import json
import boto3
import traceback

table_name = "dvh-user"
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)


def validate_payload(payload):
    """validates if the payload consist of the keys required by lambda"""
    required_keys = ["email", "question", "answer"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")


def validate_and_get_user(email):
    """validates if email already exists in system"""
    response = table.get_item(Key={"email": email})
    if "Item" not in response:
        raise Exception("Email doesn't exists in system")

    user = response.get("Item")
    if user.get("mfa_1", {}).get("configured"):
        raise Exception("Security question and answer already set for the user")

    return user


def configure_security_question_and_answer(payload):
    """Configures the security question and answer for the user"""
    mfa_1 = {
        "question": payload.get("question"),
        "answer": payload.get("answer"),
        "configured": True,
    }
    return table.update_item(
        Key={"email": payload.get("email")},
        UpdateExpression="SET mfa_1 = :mfa_1",
        ExpressionAttributeValues={":mfa_1": mfa_1},
        ReturnValues="ALL_NEW",
    )


def update_security_details_in_dynamodb(payload):
    security_question = payload.get("security_question")
    security_answer = payload.get("security_answer")

    response = table.update_item(
        Key={"email": payload.get("email")},
        UpdateExpression="SET mfa_1.security_question = :security_question, mfa_1.security_answer = :security_answer",
        ExpressionAttributeValues={
            ":security_question": security_question,
            ":security_answer": security_answer,
        },
        ReturnValues="ALL_NEW",
    )
    return response


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
        user = validate_and_get_user(payload.get("email"))
        configure_security_question_and_answer(payload)
        return prepare_response(
            status=200,
            message="Security question and answer configured successfully",
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
