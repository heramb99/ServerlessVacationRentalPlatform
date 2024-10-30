import os
import json
import boto3
import traceback
from datetime import datetime, UTC
from dateutil.parser import parse

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")
sns_topic_arn = os.getenv("SNS_TOPIC_ARN")


class DynamoDBService:
    def __init__(self):
        self.dynamodb = dynamodb

    def get_item(self, table_name, key):
        table = self.dynamodb.Table(table_name)
        response = table.get_item(Key=key)
        return response.get("Item")

    def update_item(
        self,
        table_name,
        key,
        update_expression,
        expression_attribute_values,
        expression_attribute_names=None,
    ):
        table = self.dynamodb.Table(table_name)
        table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
        )

    def scan_table(self, table_name, filter_expression, expression_attribute_values):
        table = self.dynamodb.Table(table_name)
        response = table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
        return response.get("Items", [])


class BookingService:
    def __init__(self):
        self.db_service = DynamoDBService()

    def approve_booking(self, booking_id):
        timestamp = datetime.now(UTC).isoformat()
        self.db_service.update_item(
            "dvh-booking",
            {"id": booking_id},
            "SET #status = :status, updated_at = :timestamp",
            {":status": "RESERVED", ":timestamp": timestamp},
            {"#status": "status"},
        )

    def is_overlapping_booking(self, room_id, check_in_date, check_out_date):
        filter_expression = (
            "room.id = :roomId AND #status = :status AND ("
            ":checkInDate BETWEEN check_in_date AND check_out_date OR "
            ":checkOutDate BETWEEN check_in_date AND check_out_date OR "
            "check_in_date BETWEEN :checkInDate AND :checkOutDate OR "
            "check_out_date BETWEEN :checkInDate AND :checkOutDate)"
        )
        expression_attribute_values = {
            ":roomId": room_id,
            ":checkInDate": check_in_date.isoformat(),
            ":checkOutDate": check_out_date.isoformat(),
            ":status": "RESERVED",
        }
        expression_attribute_names = {
            "#status": "status",
        }
        items = self.db_service.scan_table(
            "dvh-booking",
            filter_expression,
            expression_attribute_values,
            expression_attribute_names,
        )
        return len(items) > 0


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
    try:
        for record in event["Records"]:
            message = json.loads(record["body"])
            booking_id = message.get("id")
            email = message.get("user", {}).get("email")
            room_id = message.get("room", {}).get("id")
            check_in_date = parse(message.get("check_in_date"))
            check_out_date = parse(message.get("check_out_date"))
            user_name = message.get("user", {}).get("name")
            total_price = message.get("total_price")

            booking_service = BookingService()

            if booking_service.is_overlapping_booking(
                room_id, check_in_date, check_out_date
            ):
                # Send failure email
                sns.publish(
                    TopicArn=sns_topic_arn,
                    Subject="Booking Failed",
                    Message=(
                        f"Dear {user_name},\n\n"
                        f"Your booking request for Room ID {room_id} from {check_in_date.strftime('%Y-%m-%d')} to {check_out_date.strftime('%Y-%m-%d')} "
                        "could not be approved due to an overlap with an existing booking.\n\n"
                        "Please choose different dates or another room.\n\n"
                        "Thank you,\nDalVacationHome"
                    ),
                    MessageAttributes={
                        "email": {"DataType": "String", "StringValue": email}
                    },
                )
            else:
                # Approve booking
                booking_service.approve_booking(booking_id)

                # Send approval email
                sns.publish(
                    TopicArn=sns_topic_arn,
                    Subject="Booking Approved",
                    Message=(
                        f"Dear {user_name},\n\n"
                        f"Your booking request for Room ID {room_id} from {check_in_date.strftime('%Y-%m-%d')} to {check_out_date.strftime('%Y-%m-%d')} "
                        "has been approved.\n\n"
                        f"Booking ID: {booking_id}\n"
                        f"Total Price: ${total_price}\n\n"
                        "Thank you,\nDalVacationHome"
                    ),
                    MessageAttributes={
                        "email": {"DataType": "String", "StringValue": email}
                    },
                )

        return ResponseBuilder.prepare_response(
            status=200, message="Booking process completed successfully!!"
        )
    except Exception as e:
        traceback.print_exc()
        return ResponseBuilder.prepare_response(status=500, message=str(e))
