import json
import boto3
import traceback


def remove_session_from_dynamodb(session_id):
    """removes the session from dynamodb"""
    if not session_id:
        return

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("dvh-session")
    table.delete_item(Key={"id": session_id})


def sign_out_user_from_cognito(token):
    """signs out the user from cognito"""
    if not token:
        return

    client = boto3.client("cognito-idp")
    client.global_sign_out(AccessToken=token)


def prepare_response(status, message, **kwargs):
    """prepares the response"""
    response = {
        "statusCode": status,
        "body": json.dumps({"message": message, **kwargs}),
        "headers": {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
        },
    }
    return response


def lambda_handler(event, context):
    headers = event.get("headers")
    session_id = headers.get("session-id")
    token = headers.get("auth-token")
    try:
        remove_session_from_dynamodb(session_id)
        sign_out_user_from_cognito(token)
        return prepare_response(status=200, message="User logged out successfully!!")
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
