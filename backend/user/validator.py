import json
import boto3
import traceback
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


def validate_headers(headers):
    """validates the headers"""
    required_headers = ["session-id", "auth-token"]
    for header in required_headers:
        if header not in headers or not headers.get(header):
            raise Exception(f"{header} is missing in headers")


def validate_session_in_dynamodb(session_id, token):
    """validates the session in dynamodb"""
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("dvh-session")
    response = table.get_item(Key={"id": session_id})
    if "Item" not in response:
        raise Exception("Invalid session_id")

    session = response.get("Item")
    if session.get("role") not in ["agent", "user"]:
        raise Exception("Invalid role in session")

    mfa_1_verified = session.get("mfa_1").get("verified")
    mfa_2_verified = session.get("mfa_2").get("verified")
    if not all([mfa_1_verified, mfa_2_verified]):
        raise Exception("MFA not verified")

    if token != session.get("token"):
        raise Exception("Token doesn't match with session")

    if session.get("role") != "user":
        raise Exception("User is not authorized to access this url.")

    session.pop("token")
    return session


def validate_cognito_token(token):
    """validates the cognito token"""
    client = boto3.client("cognito-idp")
    client.get_user(AccessToken=token)


def generate_policy(effect, resource, context={}):
    auth_response = {"principalId": "user"}
    if effect and resource:
        policy_document = {
            "Version": "2012-10-17",
            "Statement": [
                {"Action": "execute-api:Invoke", "Effect": effect, "Resource": resource}
            ],
        }
        auth_response["policyDocument"] = policy_document

    if context:
        auth_response["context"] = {**context}

    return auth_response


def lambda_handler(event, context):
    headers = event.get("headers")
    validate_headers(headers)
    session_id = headers.get("session-id")
    auth_token = headers.get("auth-token")
    session = validate_session_in_dynamodb(session_id, auth_token)
    auth_context = {
        "session": json.dumps(session, cls=DecimalEncoder),
    }
    token = headers.get("auth-token")
    validate_cognito_token(token)
    method_arn = event.get("methodArn")
    try:
        return generate_policy(
            effect="Allow", resource=method_arn, context=auth_context
        )
    except Exception as e:
        traceback.print_exc()
        return generate_policy(
            effect="Deny", resource=method_arn, context={"message": str(e)}
        )
