import json
import boto3
import pymysql
import os

# Environment variables for RDS connection
rds_host = os.environ["RDS_HOST"]
db_username = os.environ["DB_USERNAME"]
db_password = os.environ["DB_PASSWORD"]
db_name = os.environ["DB_NAME"]
db_port = os.environ["DB_PORT"]

# Initialize DynamoDB and RDS clients
dynamodb = boto3.client("dynamodb")
rds = pymysql.connect(
    host=rds_host, user=db_username, passwd=db_password, db=db_name, port=int(db_port)
)


def lambda_handler(event, context):
    rds_table_name = "dvh_room"

    # Prepare SQL insert/update statement for RDS
    upsert_query = f"""
    INSERT INTO {rds_table_name} (id, name, price_per_day, beds, baths, guests)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        price_per_day = VALUES(price_per_day),
        beds = VALUES(beds),
        baths = VALUES(baths),
        guests = VALUES(guests)
    """

    # Prepare SQL delete statement for RDS
    delete_query = f"DELETE FROM {rds_table_name} WHERE id = %s"

    with rds.cursor() as cursor:
        for record in event["Records"]:
            if record["eventName"] in ["INSERT", "MODIFY"]:
                new_image = record["dynamodb"]["NewImage"]
                id = new_image.get("id", {}).get("S")
                name = new_image.get("name", {}).get("S")
                price_per_day = float(new_image.get("price_per_day", {}).get("N"))
                beds = int(
                    new_image.get("config", {}).get("M", {}).get("beds", {}).get("N")
                )
                baths = int(
                    new_image.get("config", {})
                    .get("M", {})
                    .get("bathrooms", {})
                    .get("N")
                )
                guests = int(
                    new_image.get("config", {}).get("M", {}).get("guests", {}).get("N")
                )

                # Execute SQL upsert statement
                cursor.execute(
                    upsert_query,
                    (id, name, price_per_day, beds, baths, guests),
                )
            elif record["eventName"] == "REMOVE":
                old_image = record["dynamodb"]["OldImage"]
                id = old_image["id"]["S"]

                # Execute SQL delete statement
                cursor.execute(delete_query, (id,))

        rds.commit()

    return {"statusCode": 200, "body": json.dumps("Data migration complete")}
