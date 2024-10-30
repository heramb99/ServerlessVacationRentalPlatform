import os
import time
import json
import uuid
import boto3
import traceback
from boto3.dynamodb.conditions import Attr
from datetime import datetime, timedelta

dynamodb = boto3.resource("dynamodb")
cognito_client_id = os.getenv("COGNITO_CLIENT_ID")
cognito_user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
cognito_client = boto3.client("cognito-idp")


class UserNotVerifiedException(Exception):
    """User not verified exception"""

    pass


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


def validate_payload(payload):
    """validates the payload"""
    required_keys = ["email", "password", "role"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")

    if payload.get("role") not in ["agent", "user"]:
        raise Exception("Invalid Role!!")


def get_user_from_cognito(email):
    """validates and return user if exists in cognito"""
    response = cognito_client.admin_get_user(
        UserPoolId=cognito_user_pool_id, Username=email
    )
    if response.get("UserStatus") != "CONFIRMED":
        raise UserNotVerifiedException("User is not verified!!")
    return response


def get_user_from_dynamodb(email, password, role):
    """validates and returns user if it exists in dynamodb"""
    table = dynamodb.Table("dvh-user")
    response = table.scan(
        FilterExpression=Attr("email").eq(email)
        & Attr("password").eq(password)
        & Attr("role").eq(role)
    )
    if response.get("Count") == 0:
        raise Exception("Invalid Email or Password!!")

    return response.get("Items")[0]


def send_user_verification_code(email):
    """sends the verification code"""
    cognito_client.resend_confirmation_code(ClientId=cognito_client_id, Username=email)


def check_and_delete_existing_session(user):
    """checks and deletes existing session"""
    table = dynamodb.Table("dvh-session")
    response = table.scan(FilterExpression=Attr("user.id").eq(user.get("id")))
    if response.get("Count") > 0:
        table.delete_item(Key={"id": response.get("Items")[0].get("id")})


def create_session(user):
    """creates a session"""
    check_and_delete_existing_session(user)
    is_verified_user = user.get("is_verified")
    if not is_verified_user:
        return {"user": {}, "role": "guest"}
    _id = uuid.uuid4().hex
    session_schema = {
        "id": _id,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "is_verified": user.get("is_verified"),
        },
        "role": user.get("role"),
        "token": "",
        "mfa_1": {
            "question": user.get("mfa_1").get("question"),
            "configured": user.get("mfa_1").get("configured"),
            "verified": False,
        },
        "mfa_2": {
            "configured": user.get("mfa_2").get("configured"),
            "verified": False,
        },
        "expiry_date": (datetime.now() + timedelta(minutes=60)).strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "expiry_time": int(time.time()) + 600,
    }
    table = dynamodb.Table("dvh-session")
    table.put_item(Item=session_schema)
    return session_schema


def login_user(payload):
    """logs in the user"""
    email = payload.get("email")
    password = payload.get("password")
    role = payload.get("role")
    dynamodb_user = get_user_from_dynamodb(email, password, role)
    cognito_user = get_user_from_cognito(email)
    session = create_session(dynamodb_user)
    return session


def lambda_handler(event, context):
    payload = json.loads(event.get("body"))
    try:
        validate_payload(payload)
        email = payload.get("email")
        session = login_user(payload)
        return prepare_response(
            status=200, message="User Logged in successfully", session=session
        )
    except UserNotVerifiedException as e:
        send_user_verification_code(email)
        return prepare_response(
            status=200,
            message="User not verified!! Verification code sent successfully!!",
            session={
                "user": {},
                "role": "guest",
            },
            redirect_to_verification=True,
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
