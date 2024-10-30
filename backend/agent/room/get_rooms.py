import json
import boto3
import traceback
from decimal import Decimal


dynamodb = boto3.resource("dynamodb")


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


def get_rooms():
    """Gets the rooms."""
    table = dynamodb.Table("dvh-room")
    response = table.scan()
    return response.get("Items", [])


def prepare_response(status, message, **kwargs):
    """Prepares the response."""
    response = {
        "statusCode": status,
        "body": json.dumps({"message": message, **kwargs}, cls=DecimalEncoder),
        "headers": {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
        },
    }
    return response


def lambda_handler(event, context):
    try:
        rooms = get_rooms()
        return prepare_response(
            status=200, message="Rooms fetched successfully!!", rooms=rooms
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
