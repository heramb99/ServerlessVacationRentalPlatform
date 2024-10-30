import json
import boto3
import traceback
from decimal import Decimal
from boto3.dynamodb.conditions import Attr, And
from dateutil.parser import parse as parse_date

dynamodb = boto3.resource("dynamodb")


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


def validate_filters(filters):
    """Validates the required filters."""
    required_filters = ["checkInDate", "checkOutDate"]
    for filter in required_filters:
        if filter not in filters or not filters.get(filter):
            raise Exception(f"{filter} is missing in filters!!")

    if filters.get("beds") and not 0 < int(filters.get("beds")) < 9:
        raise Exception("Invalid number of beds!!")

    if filters.get("baths") and not 0 < int(filters.get("baths")) < 9:
        raise Exception("Invalid number of baths!!")

    if filters.get("price") and not 0 < int(filters.get("price")) < 1001:
        raise Exception("Invalid price range!!")


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


def get_booked_room_ids(check_in_date, check_out_date):
    """Gets the booked room ids."""
    table = dynamodb.Table("dvh-booking")
    response = table.scan(
        FilterExpression=Attr("checkInDate").lt(check_out_date)
        & Attr("checkOutDate").gt(check_in_date)
    )
    return [item.get("room_id") for item in response.get("Items", [])]


def get_feedbacks(room_id):
    """Gets the feedbacks for the room."""
    table = dynamodb.Table("dvh-feedback")
    response = table.scan(FilterExpression=Attr("room_id").eq(room_id))
    feedbacks = response.get("Items", [])
    return feedbacks or []


def get_rooms(filters):
    """Gets the rooms from DynamoDB."""
    check_in_date = parse_date(filters.get("checkInDate")).isoformat()
    check_out_date = parse_date(filters.get("checkOutDate")).isoformat()
    booked_room_ids = get_booked_room_ids(check_in_date, check_out_date)

    table = dynamodb.Table("dvh-room")

    # Initialize the filter expression
    filter_expression = None

    if booked_room_ids:
        filter_expression = Attr("id").ne(booked_room_ids[0])
        for room_id in booked_room_ids[1:]:
            filter_expression &= Attr("id").ne(room_id)

    # Add additional filters based on user input
    if "beds" in filters:
        beds_filter = Attr("config.beds").eq(int(filters["beds"]))
        filter_expression = (
            beds_filter
            if filter_expression is None
            else filter_expression & beds_filter
        )
    if "baths" in filters:
        baths_filter = Attr("config.bathrooms").eq(int(filters["baths"]))
        filter_expression = (
            baths_filter
            if filter_expression is None
            else filter_expression & baths_filter
        )
    if "price" in filters:
        price_filter = Attr("price_per_day").lte(int(filters["price"]))
        filter_expression = (
            price_filter
            if filter_expression is None
            else filter_expression & price_filter
        )

    response = table.scan(FilterExpression=filter_expression)
    rooms = response.get("Items", [])
    if not rooms:
        return []

    for room in rooms:
        room_id = room.get("id")
        feedbacks = get_feedbacks(room_id)
        room["overall_rating"] = (
            sum([feedback.get("rating") for feedback in feedbacks]) / len(feedbacks)
            if feedbacks
            else 0
        )
        room["total_reviews"] = len(feedbacks)

    return rooms


def lambda_handler(event, context):
    filters = event.get("queryStringParameters")
    try:
        validate_filters(filters)
        rooms = get_rooms(filters)
        return prepare_response(
            status=200, message="Rooms fetched successfully!!", rooms=rooms
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
