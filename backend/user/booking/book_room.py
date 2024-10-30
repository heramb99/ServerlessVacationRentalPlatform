import json
import boto3
import traceback
from uuid import uuid4
from dateutil.parser import parse
from datetime import datetime, timezone, UTC


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

    def scan_table(self, table_name, filter_expression, expression_attribute_values):
        table = self.dynamodb.Table(table_name)
        response = table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
        return response.get("Items", [])


class PayloadValidator:
    def __init__(self, payload, session_user_id):
        self.payload = payload
        self.session_user_id = session_user_id
        self.required_fields = [
            "checkInDate",
            "checkOutDate",
            "roomId",
            "userId",
            "guests",
            "totalPrice",
        ]

    def validate(self):
        self._check_required_fields()
        self._check_user_id()
        self._check_date_validity()
        self._check_for_overlapping_bookings()

    def _check_required_fields(self):
        for field in self.required_fields:
            if field not in self.payload or not self.payload.get(field):
                raise Exception(f"{field} is missing in the payload!!")

    def _check_user_id(self):
        if self.payload.get("userId") != self.session_user_id:
            raise Exception(
                "User ID in the payload does not match the session user ID!"
            )

    def _check_date_validity(self):
        check_in_date = parse(self.payload.get("checkInDate"))
        check_out_date = parse(self.payload.get("checkOutDate"))
        current_date = datetime.now(timezone.utc)

        if check_in_date >= check_out_date:
            raise Exception("Check-in date must be before check-out date!")

        if check_in_date <= current_date or check_out_date <= current_date:
            raise Exception("Check-in and check-out dates must be in the future!")

    def _check_for_overlapping_bookings(self):
        check_in_date = parse(self.payload.get("checkInDate"))
        check_out_date = parse(self.payload.get("checkOutDate"))
        room_id = self.payload.get("roomId")
        booking_service = BookingService()
        if booking_service.is_overlapping_booking(
            room_id, check_in_date, check_out_date
        ):
            raise Exception("Room is already booked for the given dates!")


class BookingService:
    def __init__(self):
        self.db_service = DynamoDBService()

    def is_overlapping_booking(self, room_id, check_in_date, check_out_date):
        filter_expression = (
            "room.id = :roomId AND ("
            ":checkInDate BETWEEN check_in_date AND check_out_date OR "
            ":checkOutDate BETWEEN check_in_date AND check_out_date OR "
            "check_in_date BETWEEN :checkInDate AND :checkOutDate OR "
            "check_out_date BETWEEN :checkInDate AND :checkOutDate)"
        )
        expression_attribute_values = {
            ":roomId": room_id,
            ":checkInDate": check_in_date.isoformat(),
            ":checkOutDate": check_out_date.isoformat(),
        }
        items = self.db_service.scan_table(
            "dvh-booking", filter_expression, expression_attribute_values
        )
        return len(items) > 0

    def book_room(self, schema):
        self.db_service.put_item("dvh-booking", schema)


class BookingSchema:
    def __init__(self, payload, session_user):
        self.payload = payload
        self.session_user = session_user
        self.room_service = RoomService()

    def prepare(self):
        room = self.room_service.get_room(self.payload.get("roomId"))
        guests = self.payload.get("guests")
        timestamp = datetime.now(UTC).isoformat()
        if room.get("config", {}).get("guests") < guests:
            raise Exception("Guests count exceeds the room capacity!!")

        booking_id = uuid4().hex
        return {
            "id": booking_id,
            "check_in_date": self.payload.get("checkInDate"),
            "check_out_date": self.payload.get("checkOutDate"),
            "guests": guests,
            "room": room,
            "status": "RESERVED",
            "total_price": self.payload.get("totalPrice"),
            "user": self.session_user,
            "created_at": timestamp,
            "updated_at": timestamp,
        }


class RoomService:
    def __init__(self):
        self.db_service = DynamoDBService()

    def get_room(self, room_id):
        return self.db_service.get_item("dvh-room", {"id": room_id})


class ResponseBuilder:
    @staticmethod
    def prepare_response(status, message, **kwargs):
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
    payload = json.loads(event.get("body", "{}"))
    session = json.loads(
        event.get("requestContext", {}).get("authorizer", {}).get("session", {})
    )
    session_user_id = session.get("user").get("id")
    session_user = session.get("user")

    try:
        validator = PayloadValidator(payload, session_user_id)
        validator.validate()

        booking_service = BookingService()
        schema = BookingSchema(payload, session_user).prepare()
        booking_service.book_room(schema)

        return ResponseBuilder.prepare_response(
            status=200, message="Room reserved successfully!!"
        )
    except Exception as e:
        traceback.print_exc()
        return ResponseBuilder.prepare_response(status=500, message=str(e))
