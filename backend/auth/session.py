import json
import boto3
import traceback
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")


def parse_cookies(cookie_header):
    cookies = {}
    if cookie_header:
        cookie_pairs = cookie_header.split(";")
        for pair in cookie_pairs:
            name, value = pair.strip().split("=", 1)
            cookies[name] = value
    return cookies


def get_session(token, session_id):
    """gets the session from dynamodb"""
    table = dynamodb.Table("dvh-session")
    response = table.scan(FilterExpression=Attr("id").eq(session_id))
    default_session = {
        "user": {},
        "role": "guest",
    }
    if response.get("Count") == 0:
        return default_session

    session = response.get("Items")[0]
    if session.get("token", "") != token:
        return default_session
    else:
        return session


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
    cookie_header = event.get("headers").get("cookie")
    cookies = parse_cookies(cookie_header)
    session_id = cookies.get("session-id")
    token = cookies.get("auth-token") or ""
    try:
        session = get_session(token, session_id)
        return prepare_response(
            status=200, message="Session fetched successfully!!", session=session
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
