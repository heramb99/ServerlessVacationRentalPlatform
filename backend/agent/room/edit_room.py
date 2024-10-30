import json
import boto3
import base64
import traceback
from uuid import uuid4
from decimal import Decimal

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


def validate_payload(payload):
    """Validates the payload."""
    required_keys = [
        "name",
        "description",
        "price",
        "beds",
        "bathrooms",
        "guests",
        "amenities",
        "images",
    ]
    for key in required_keys:
        if key not in payload or not payload.get(key):
            raise Exception(f"{key} not present in payload!!")


def validate_and_get_room(room_id):
    """validates the room if it exists"""
    table = dynamodb.Table("dvh-room")
    response = table.get_item(Key={"id": room_id})
    if not response.get("Item"):
        raise Exception(f"Room with id {room_id} not found!!")

    return response.get("Item")


def upload_image_to_bucket(image, room_id):
    """Uploads the image to the bucket"""
    image_data = image.get("url")
    image_type = image.get("type")
    bucket_name = "dvh-bucket"
    filename = f"{uuid4().hex}.{image_type.split('/')[1]}"
    filepath = f"rooms/{room_id}/images/{filename}"
    decoded_image = base64.b64decode(image_data.split(",")[1])
    s3.put_object(
        Body=decoded_image,
        Bucket=bucket_name,
        Key=filepath,
    )
    return {
        "url": f"https://{bucket_name}.s3.amazonaws.com/{filepath}",
        "name": filename,
    }


def remove_rest_of_the_images():
    # TODO(Hatim)
    pass


def get_and_validate_images(images, payload_images, room_id):
    """get and validate the images"""
    image_names = [image.get("name") for image in images]
    image_list = []
    for image in payload_images:
        if image.get("name") not in image_names:
            image_list.append(upload_image_to_bucket(image, room_id))
            continue

        image_list.append(image)

    return image_list


def edit_room(room_id, payload):
    """edit the specific room"""
    room = validate_and_get_room(room_id)
    image_urls = get_and_validate_images(
        room.get("images"), payload.get("images"), room_id
    )
    table = dynamodb.Table("dvh-room")
    updated_room = table.update_item(
        Key={"id": room_id},
        UpdateExpression="SET #name = :name, #description = :description, #price_per_day = :price, #config = :config, #amenities = :amenities, #images = :images",
        ExpressionAttributeNames={
            "#name": "name",
            "#description": "description",
            "#price_per_day": "price_per_day",
            "#config": "config",
            "#amenities": "amenities",
            "#images": "images",
        },
        ExpressionAttributeValues={
            ":name": payload.get("name"),
            ":description": payload.get("description"),
            ":price": payload.get("price"),
            ":config": {
                "beds": payload.get("beds"),
                "bathrooms": payload.get("bathrooms"),
                "guests": payload.get("guests"),
            },
            ":amenities": payload.get("amenities"),
            ":images": image_urls,
        },
        ReturnValues="ALL_NEW",
    )
    return updated_room.get("Attributes")


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
    path_params = event.get("pathParameters", {})
    payload = json.loads(event.get("body"))
    try:
        validate_payload(payload)
        room_id = path_params.get("roomId")
        room = edit_room(room_id, payload)
        return prepare_response(
            status=200, message="Room updated successfully!!", room=room
        )
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
