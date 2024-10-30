import json
import boto3
import traceback
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


def validate_filters(filters):
    """validates the required filters."""
    if not filters.get("roomId"):
        raise Exception("RoomId is missing in filters!!")


def get_feedbacks(room_id):
    """Gets the feedbacks for the room."""
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("dvh-feedback")
    response = table.scan(
        FilterExpression="room_id = :room_id",
        ExpressionAttributeValues={":room_id": room_id},
    )
    feedbacks = response.get("Items", [])
    return feedbacks or []


def get_room_details(room_id):
    """Gets the room details."""
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("dvh-room")
    response = table.get_item(Key={"id": room_id})
    room = response.get("Item")
    if not room:
        raise Exception("Room not found!!")

    feedbacks = get_feedbacks(room_id)
    room["feedbacks"] = feedbacks
    return room


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
    filters = event.get("pathParameters", {})
    try:
        validate_filters(filters)
        room_id = filters.get("roomId")
        details = get_room_details(room_id)
        return prepare_response(
            status=200, message="Rooms details fetched successfully!!", room=details
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
