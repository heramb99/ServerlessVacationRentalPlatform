import json
import boto3
import traceback
from decimal import Decimal
from google.cloud import language_v2
from google.oauth2 import service_account

# Initialize AWS services
s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

# Replace with your S3 bucket and file details
BUCKET_NAME = "dvh-bucket"
FILE_KEY = "private/gcp/credentials/dvh-service-account.json"
LOCAL_FILE_PATH = "/tmp/service_account.json"


class S3Service:
    def __init__(self):
        self.s3 = s3

    def download_file(self, bucket_name, file_key, local_file_path):
        self.s3.download_file(bucket_name, file_key, local_file_path)


class DynamoDBService:
    def __init__(self):
        self.dynamodb = dynamodb

    def update_item(
        self, table_name, key, update_expression, expression_attribute_values
    ):
        table = self.dynamodb.Table(table_name)
        table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )


class GoogleNLPService:
    def __init__(self, local_file_path):
        credentials = service_account.Credentials.from_service_account_file(
            local_file_path
        )
        self.client = language_v2.LanguageServiceClient(credentials=credentials)

    def analyze_sentiment(self, text_content):
        document = language_v2.Document(
            content=text_content, type_=language_v2.Document.Type.PLAIN_TEXT
        )
        response = self.client.analyze_sentiment(request={"document": document})
        sentiment = response.document_sentiment
        return sentiment.score, sentiment.magnitude


def lambda_handler(event, context):
    s3_service = S3Service()
    db_service = DynamoDBService()

    s3_service.download_file(BUCKET_NAME, FILE_KEY, LOCAL_FILE_PATH)

    nlp_service = GoogleNLPService(LOCAL_FILE_PATH)

    try:
        for record in event["Records"]:
            if record["eventName"] != "INSERT":
                continue
            new_image = record["dynamodb"]["NewImage"]
            feedback_id = new_image["id"]["S"]
            comment = new_image["comment"]["S"]

            # Perform sentiment analysis
            sentiment_score, sentiment_magnitude = nlp_service.analyze_sentiment(
                comment
            )

            db_service.update_item(
                table_name="dvh-feedback",
                key={"id": feedback_id},
                update_expression="SET sentiment = :sentiment",
                expression_attribute_values={
                    ":sentiment": {
                        "score": Decimal(str(sentiment_score)),
                        "magnitude": Decimal(str(sentiment_magnitude)),
                    }
                },
            )
    except Exception as e:
        traceback.print_exc()
