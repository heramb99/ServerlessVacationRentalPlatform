import json
import boto3
import base64
import traceback
from uuid import uuid4

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")


def validate_payload(payload):
    """validates the payload"""
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


def prepare_schema(payload):
    """prepares the schema"""
    _id = uuid4().hex
    schema = {
        "id": _id,
        "name": payload.get("name"),
        "description": payload.get("description"),
        "price_per_day": payload.get("price"),
        "config": {
            "beds": payload.get("beds"),
            "bathrooms": payload.get("bathrooms"),
            "guests": payload.get("guests"),
        },
        "amenities": payload.get("amenities"),
        "images": payload.get("images"),
    }
    return schema


def upload_images_to_bucket(images, room_id):
    """Uploads the images to the bucket"""
    uploaded_images = []
    for image in images:
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
            ContentType=image_type,
        )
        uploaded_images.append(
            {
                "url": f"https://{bucket_name}.s3.amazonaws.com/{filepath}",
                "name": filename,
            }
        )
    return uploaded_images


def create_room(payload):
    """Creates the room"""
    schema = prepare_schema(payload)
    uploaded_images = upload_images_to_bucket(payload.get("images"), schema.get("id"))
    schema["images"] = uploaded_images
    table = dynamodb.Table("dvh-room")
    table.put_item(Item=schema)


def prepare_response(status, message, **kwargs):
    """Prepares the response."""
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
    payload = json.loads(event.get("body"))
    try:
        validate_payload(payload)
        create_room(payload)
        return prepare_response(status=200, message="Room added successfully!!")
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
