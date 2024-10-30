import os
import json
import boto3
import traceback

dynamodb = boto3.resource("dynamodb")
table_name = os.getenv("DYNAMODB_TABLE_NAME")
cognito_client_id = os.getenv("COGNITO_CLIENT_ID")


def validate_payload(payload):
    """validates the payload"""
    required_keys = ["email"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")


def resend_code(email):
    """resend the verification code"""
    client = boto3.client("cognito-idp")
    client.resend_confirmation_code(ClientId=cognito_client_id, Username=email)


def prepare_response(status, message, headers={}, **kwargs):
    """prepares the response"""
    response = {
        "statusCode": status,
        "body": json.dumps({"message": message, **kwargs}),
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
        resend_code(email)
        return prepare_response(
            status=200, message="Verification code resent successfully!!"
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
