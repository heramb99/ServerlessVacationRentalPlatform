import os
import json
import time
import boto3
import traceback
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
client = boto3.client("cognito-idp")
cognito_client_id = os.getenv("COGNITO_CLIENT_ID")
sns_topic_arn = os.getenv("SNS_TOPIC_ARN")
sns_client = boto3.client("sns")


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return json.JSONEncoder.default(self, obj)


def validate_payload(payload):
    """validates if the payload consist of the keys required by lambda"""
    required_keys = ["email", "session_id", "plain_text", "cipher_text"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")


def validate_and_get_user(email):
    """validates if user already exists in system"""
    table = dynamodb.Table("dvh-user")
    response = table.get_item(Key={"email": email})
    if "Item" not in response:
        raise Exception("Email doesn't exist in the system")

    user = response.get("Item")
    if not user.get("mfa_2", {}).get("configured"):
        raise Exception("Caesar Cipher not configured!!")

    return user


def validate_cipher_text(plain_text, cipher_text, cipher_decryption_key):
    """Validates the cipher text"""
    if isinstance(cipher_decryption_key, Decimal):
        cipher_decryption_key = int(cipher_decryption_key)

    result = ""
    for char in cipher_text:
        if char.isalpha():
            result += chr((ord(char) - cipher_decryption_key - 97) % 26 + 97)
        else:
            result += char

    if result != plain_text:
        raise Exception("Cipher text is not valid!!")

    return True


def validate_and_get_session(session_id):
    """validates if the session exists in system"""
    table = dynamodb.Table("dvh-session")
    response = table.get_item(Key={"id": session_id})
    if "Item" not in response:
        raise Exception("Session doesn't exist in the system")

    session = response.get("Item")
    if not session.get("mfa_1").get("verified"):
        raise Exception("MFA #1 not verified. Please verify it first.")

    if session.get("mfa_2", {}).get("verified"):
        raise Exception("User has already verified the Caesar Cipher!!")

    return session


def authenticate_user(email, password):
    """Authenticate the user to get token from Cognito"""
    response = client.initiate_auth(
        ClientId=cognito_client_id,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": email,
            "PASSWORD": password,
        },
    )
    auth_result = response.get("AuthenticationResult")
    access_token = auth_result.get("AccessToken")
    expires_in = auth_result.get("ExpiresIn")
    return access_token, expires_in


def update_session_with_token(session_id, token, expiry_time):
    """Updates the session table with token and expiry time"""
    session_table = dynamodb.Table("dvh-session")
    response = session_table.update_item(
        Key={"id": session_id},
        UpdateExpression="SET #tk = :token, expiry_time = :expiry_time, mfa_2.verified = :is_verified",
        ExpressionAttributeValues={
            ":token": token,
            ":expiry_time": int(time.time() + expiry_time),
            ":is_verified": True,
        },
        ExpressionAttributeNames={"#tk": "token"},
        ReturnValues="ALL_NEW",
    )
    return response.get("Attributes")


def send_login_notification(email):
    """Checks for email subscription and sends notification"""
    is_subscribed = False
    paginator = sns_client.get_paginator("list_subscriptions_by_topic")
    for page in paginator.paginate(TopicArn=sns_topic_arn):
        for subscription in page["Subscriptions"]:
            if (
                subscription["Protocol"] == "email"
                and subscription["Endpoint"] == email
            ):
                is_subscribed = True
                break

        if is_subscribed:
            break

    if not is_subscribed:
        sns_client.subscribe(
            TopicArn=sns_topic_arn,
            Protocol="email",
            Endpoint=email,
            ReturnSubscriptionArn=True,
            Attributes={"FilterPolicy": json.dumps({"email": [email]})},
        )
        return

    sns_client.publish(
        TopicArn=sns_topic_arn,
        Subject="Login Successful",
        Message=f"Dear user,\n\nYour login was successful.\n\nSincerely,\nTeam SDP-32",
        MessageAttributes={"email": {"DataType": "String", "StringValue": email}},
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
        cipher_text = payload.get("cipher_text")
        user = validate_and_get_user(email)
        plain_text = payload.get("plain_text")
        cipher_decryption_key = user.get("mfa_2", {}).get("cipher_decryption_key")
        validate_cipher_text(plain_text, cipher_text, cipher_decryption_key)
        password = user.get("password")
        session_id = payload.get("session_id")
        validate_and_get_session(session_id)
        access_token, expires_in = authenticate_user(email, password)
        session = update_session_with_token(session_id, access_token, expires_in)
        send_login_notification(email)
        return prepare_response(
            status=200,
            message="User login successful!! Confirmation email sent",
            session=session,
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
