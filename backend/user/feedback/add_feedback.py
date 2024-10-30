import json
import boto3
import traceback
from uuid import uuid4
from datetime import datetime, UTC


class DynamoDBService:
    def __init__(self):
        self.dynamodb = boto3.resource("dynamodb")

    def get_item(self, table_name, key):
        table = self.dynamodb.Table(table_name)
        response = table.get_item(Key=key)
        return response.get("Item")

    def put_item(self, table_name, item):
        table = self.dynamodb.Table(table_name)
        table.put_item(Item=item)

    def update_item(
        self, table_name, key, update_expression, expression_attribute_values
    ):
        table = self.dynamodb.Table(table_name)
        table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )


class BookingService:
    def __init__(self):
        self.db_service = DynamoDBService()

    def get_booking(self, booking_id):
        return self.db_service.get_item("dvh-booking", {"id": booking_id})


class FeedbackService:
    def __init__(self):
        self.db_service = DynamoDBService()

    def validate_payload(self, payload):
        required_fields = ["rating", "comment"]
        for field in required_fields:
            if field not in payload:
                raise ValueError(f"Missing required field: {field}")

        rating = payload["rating"]
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            raise ValueError("Rating must be an integer between 1 and 5")

    def create_feedback_entry(self, booking, payload, user):
        feedback_id = str(uuid4())
        timestamp = datetime.now(UTC).isoformat()
        feedback_entry = {
            "id": feedback_id,
            "booking_id": booking.get("id"),
            "room_id": booking.get("room", {}).get("id"),
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "email": user.get("email"),
            },
            "rating": payload.get("rating"),
            "comment": payload.get("comment"),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        self.db_service.put_item("dvh-feedback", feedback_entry)
        return feedback_entry

    def add_feedback_to_booking(self, booking_id, feedback_entry):
        timestamp = datetime.now(UTC).isoformat()
        update_expression = "SET feedback = list_append(if_not_exists(feedback, :empty_list), :feedback), updated_at = :updated_at"
        expression_attribute_values = {
            ":feedback": [
                {
                    "id": feedback_entry.get("id"),
                    "rating": feedback_entry.get("rating"),
                    "comment": feedback_entry.get("comment"),
                }
            ],
            ":empty_list": [],
            ":updated_at": timestamp,
        }
        self.db_service.update_item(
            "dvh-booking",
            {"id": booking_id},
            update_expression,
            expression_attribute_values,
        )


class SessionService:
    """Service class for handling user session."""

    @staticmethod
    def get_user_from_session(event):
        """Retrieves the user information from the session in the event."""
        session = json.loads(
            event.get("requestContext", {}).get("authorizer", {}).get("session", {})
        )
        return session.get("user")


class ResponseBuilder:
    """Utility class for building HTTP responses."""

    @staticmethod
    def prepare_response(status, message, **kwargs):
        """Prepares an HTTP response."""
        response = {
            "statusCode": status,
            "body": json.dumps({"message": message, **kwargs}),
            "headers": {
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "http://localhost:3000",
            },
        }
        return response


def lambda_handler(event, context):
    try:
        path_parameters = event.get("pathParameters", {})
        booking_id = path_parameters.get("bookingId")

        payload = json.loads(event.get("body", "{}"))
        feedback_service = FeedbackService()
        feedback_service.validate_payload(payload)

        session_user = SessionService.get_user_from_session(event)

        booking_service = BookingService()
        booking = booking_service.get_booking(booking_id)
        if not booking:
            return ResponseBuilder.prepare_response(404, "Booking not found")

        feedback_entry = feedback_service.create_feedback_entry(
            booking, payload, session_user
        )

        feedback_service.add_feedback_to_booking(booking_id, feedback_entry)

        return ResponseBuilder.prepare_response(
            200, "Feedback added successfully", feedback=feedback_entry
        )
    except ValueError as e:
        return ResponseBuilder.prepare_response(400, str(e))
    except Exception as e:
        traceback.print_exc()
        return ResponseBuilder.prepare_response(500, str(e))
