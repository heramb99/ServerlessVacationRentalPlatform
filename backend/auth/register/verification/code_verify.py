import os
import json
import boto3
import traceback

dynamodb = boto3.resource("dynamodb")
table_name = os.getenv("DYNAMODB_TABLE_NAME")
cognito_client_id = os.getenv("COGNITO_CLIENT_ID")
sns_topic_arn = os.getenv("SNS_TOPIC_ARN")
sns_client = boto3.client("sns")


def validate_payload(payload):
    """validates the payload"""
    required_keys = ["email", "code"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")


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


def verify_code(email, code):
    """verifies the code"""
    client = boto3.client("cognito-idp")
    client.confirm_sign_up(
        ClientId=cognito_client_id,
        Username=email,
        ConfirmationCode=code,
    )


def update_user_verification_status(email):
    """updates the user verification status"""
    table = dynamodb.Table(table_name)
    table.update_item(
        Key={"email": email},
        UpdateExpression="set is_verified = :v",
        ExpressionAttributeValues={":v": True},
    )


def send_subscription_confirmation_email(email):
    """sends the subscription confirmation email"""
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


def lambda_handler(event, context):
    payload = json.loads(event.get("body"))
    try:
        validate_payload(payload)
        email = payload.get("email")
        code = payload.get("code")
        verify_code(email, code)
        update_user_verification_status(email)
        send_subscription_confirmation_email(email)
        return prepare_response(status=200, message="User verified successfully!!")
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
