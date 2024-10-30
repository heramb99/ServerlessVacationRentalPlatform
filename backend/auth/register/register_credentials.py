import os
import traceback
import re
import json
import uuid
import boto3
import random
from constants import adjectives, nouns
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")
table_name = os.getenv("DYNAMODB_TABLE_NAME")
table = dynamodb.Table(table_name)
cognito_client_id = os.getenv("COGNITO_CLIENT_ID")
cognito_client = boto3.client("cognito-idp")


class VerifyUserException(Exception):
    """User not verified exception"""

    pass


def validate_role(role):
    """validates the role"""
    if role not in ["agent", "user"]:
        raise Exception("Role must be either agent or user!!")


def validate_password(password):
    """validates the password requirements using regex"""
    if len(password) < 8:
        raise Exception("Password must be at least 8 characters long")
    if not re.search(r"\d", password):
        raise Exception("Password must have at least one digit")
    if not re.search(r"[A-Z]", password):
        raise Exception("Password must have at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise Exception("Password must have at least one lowercase letter")
    if not re.search(r"[!@#$%^&*()-+]", password):
        raise Exception("Password must have at least one special character")


def validate_event(payload):
    """validates if the payload consist of the keys required by lambda"""
    required_keys = ["email", "password", "role"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")

    validate_password(payload.get("password"))
    validate_role(payload.get("role"))


def check_user_exists(email, password):
    """validates if email already exists in system"""
    response = table.scan(
        FilterExpression=Attr("email").eq(email) & Attr("password").eq(password)
    )
    if response.get("Count") > 0:
        user = response.get("Items")[0]
        is_verified = user.get("is_verified")
        if is_verified:
            raise Exception("User already exists!!")
        else:
            raise VerifyUserException("User exists but not verified!!")


def generate_random_name():
    """generates a random name"""
    adjective = random.choice(adjectives)
    noun = random.choice(nouns)
    number = random.randint(1, 9999)
    name = f"{adjective}{noun}{number}"
    return name


def prepare_user_schema(payload):
    """prepares the user schema"""
    return {
        "email": payload.get("email"),
        "password": payload.get("password"),
        "role": payload.get("role"),
        "cognito_user_id": payload.get("cognito_user_id"),
        "is_verified": False,
        "name": generate_random_name(),
        "dob": "",
        "gender": "",
        "mfa_1": {
            "question": "",
            "answer": "",
        },
        "mfa_2": {
            "cipher_decryption_key": "",
        },
    }


def register_user_to_cognito(payload):
    """registers the user to cognito"""
    response = cognito_client.sign_up(
        ClientId=cognito_client_id,
        Username=payload.get("email"),
        Password=payload.get("password"),
    )
    return response


def store_record_in_dynamodb(data):
    """stores the user record in dynamodb"""
    _id = uuid.uuid4().hex
    record = table.put_item(Item={"id": _id, **data}, ReturnValues="ALL_OLD")
    return record


def send_user_verification_code(email):
    """sends the verification code"""
    cognito_client.resend_confirmation_code(ClientId=cognito_client_id, Username=email)


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
        validate_event(payload)
        email = payload.get("email")
        password = payload.get("password")
        check_user_exists(email, password)
        user_payload = prepare_user_schema(payload)
        cognito_response = register_user_to_cognito(payload)
        user_payload.update({"cognito_user_id": cognito_response.get("UserSub")})
        store_record_in_dynamodb(user_payload)
        return prepare_response(
            status=200,
            message="User registered successfully",
            redirect_to_verification=True,
        )
    except VerifyUserException:
        send_user_verification_code(email)
        return prepare_response(
            status=200,
            message="User Already Registered, please do the verification!!",
            redirect_to_verification=True,
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
