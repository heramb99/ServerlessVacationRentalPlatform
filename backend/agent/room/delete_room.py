import json
import boto3
import traceback

dynamodb = boto3.resource("dynamodb")


def delete_images_from_bucket(room_id):
    """Deletes the images from the bucket."""
    s3 = boto3.client("s3")
    bucket_name = "dvh-bucket"
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=f"rooms/{room_id}/images/")
    if "Contents" in response:
        for obj in response["Contents"]:
            s3.delete_object(Bucket=bucket_name, Key=obj["Key"])


def delete_room(room_id):
    """Deletes the room."""
    table = dynamodb.Table("dvh-room")
    delete_images_from_bucket(room_id)
    table.delete_item(Key={"id": room_id})


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
    path_params = event.get("pathParameters", {})
    try:
        room_id = path_params.get("roomId")
        delete_room(room_id)
        return prepare_response(status=200, message="Room deleted successfully!!")
    except Exception as e:
        traceback.print_exc()
        return prepare_response(status=500, message=str(e))
