import json
import boto3
import traceback

table_name = "dvh-user"
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)


def validate_payload(payload):
    """validates if the payload consist of the keys required by lambda"""
    required_keys = ["email"]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in query params!!")


def get_mfa_status(email):
    """returns dictionary of mfa status"""
    response = table.get_item(Key={"email": email})
    if "Item" not in response:
        raise Exception("User doesn't exists in system")

    user = response.get("Item")
    return {
        "mfa_1": user.get("mfa_1", {}).get("configured", False),
        "mfa_2": user.get("mfa_2", {}).get("configured", False),
    }


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
    payload = event.get("queryStringParameters")
    try:
        validate_payload(payload)
        mfa_status = get_mfa_status(payload.get("email"))
        return prepare_response(
            status=200,
            message="MFA status fetched successfully!!",
            mfa_status=mfa_status,
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
