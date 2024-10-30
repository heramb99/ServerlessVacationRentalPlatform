import json
import boto3
import traceback
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return json.JSONEncoder.default(self, obj)


def validate_payload(payload):
    """validates if the payload consist of the keys required by lambda"""
    required_keys = ["email", "answer", "session_id"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")


def validate_and_get_user(email):
    """validates if user already exists in system"""
    table = dynamodb.Table("dvh-user")
    response = table.get_item(Key={"email": email})
    if "Item" not in response:
        raise Exception("Email doesn't exists in system")

    user = response.get("Item")
    if not user.get("mfa_1", {}).get("configured"):
        raise Exception("Security question and answer not configured!!")

    return user


def validate_security_answer(user, answer):
    """validates the security answer"""
    security_details = user.get("mfa_1", {})
    if security_details.get("answer").lower() != answer.lower():
        raise Exception("Invalid security answer!!")


def update_status_in_session(session_id, email):
    """Updates the status in session table"""
    session_table = dynamodb.Table("dvh-session")
    response = session_table.scan(FilterExpression=Attr("id").eq(session_id))
    if response.get("Count") != 1:
        raise Exception("Session does not exist")

    session = response.get("Items")[0]
    if not session.get("user"):
        raise Exception("User has not logged in yet!!")

    if session.get("mfa_1", {}).get("verified"):
        raise Exception("User has already verified the security question!!")

    return session_table.update_item(
        Key={"id": session_id},
        UpdateExpression="SET mfa_1.verified = :val",
        ExpressionAttributeValues={":val": True},
        ReturnValues="ALL_NEW",
    )


def prepare_response(status, message, headers={}, **kwargs):
    """prepares the response"""
    response = {
        "statusCode": status,
        "body": json.dumps({"message": message, **kwargs}, cls=DecimalEncoder),
        "headers": {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            **headers,
        },
    }
    return response


def lambda_handler(event, context):
    payload = json.loads(event.get("body"))
    try:
        validate_payload(payload)
        email = payload.get("email")
        answer = payload.get("answer")
        session_id = payload.get("session_id")
        user = validate_and_get_user(email)
        validate_security_answer(user, answer)
        session = update_status_in_session(session_id, email)
        return prepare_response(
            status=200,
            message="Security answer verified successfully!!",
            session=session.get("Attributes"),
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
