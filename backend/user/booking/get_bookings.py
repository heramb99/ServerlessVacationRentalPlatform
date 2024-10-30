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


class DynamoDBService:
    """Service class for interacting with DynamoDB."""

    def __init__(self):
        self.dynamodb = boto3.resource("dynamodb")

    def scan_items(
        self,
        table_name,
        filter_expression,
        expression_attribute_values,
        expression_attribute_names,
    ):
        """Scans items from a DynamoDB table based on a filter expression."""
        table = self.dynamodb.Table(table_name)
        response = table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
        )
        return response.get("Items", [])


class SessionService:
    """Service class for handling user session."""

    @staticmethod
    def get_user_from_session(event):
        """Retrieves the user information from the session in the event."""
        session = json.loads(
            event.get("requestContext", {}).get("authorizer", {}).get("session", {})
        )
        return session.get("user")


class BookingService:
    """Service class for handling booking operations."""

    def __init__(self):
        self.db_service = DynamoDBService()

    def get_user_bookings(self, user_id):
        """Retrieves bookings for a specific user."""
        filter_expression = "#usr.id = :userId"
        expression_attribute_names = {"#usr": "user"}
        expression_attribute_values = {":userId": user_id}
        return self.db_service.scan_items(
            table_name="dvh-booking",
            filter_expression=filter_expression,
            expression_attribute_values=expression_attribute_values,
            expression_attribute_names=expression_attribute_names,
        )


class ResponseBuilder:
    """Utility class for building HTTP responses."""

    @staticmethod
    def prepare_response(status, message, **kwargs):
        """Prepares an HTTP response."""
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
        session_user = SessionService.get_user_from_session(event)
        booking_service = BookingService()
        bookings = booking_service.get_user_bookings(session_user.get("id"))

        return ResponseBuilder.prepare_response(
            200, "Bookings retrieved successfully", bookings=bookings
        )
    except Exception as e:
        traceback.print_exc()
        return ResponseBuilder.prepare_response(500, message=str(e))
