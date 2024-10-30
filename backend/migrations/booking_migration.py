import json
import boto3
import pymysql
import os
from datetime import datetime

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
    rds_table_name = "dvh_booking"

    # Prepare SQL insert/update statement for RDS
    upsert_query = f"""
    INSERT INTO {rds_table_name} (id, user_id, room_id, check_in_date, check_out_date, status, total_price, guests)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        room_id = VALUES(room_id),
        check_in_date = VALUES(check_in_date),
        check_out_date = VALUES(check_out_date),
        status = VALUES(status),
        total_price = VALUES(total_price),
        guests = VALUES(guests)
    """

    # Prepare SQL delete statement for RDS
    delete_query = f"DELETE FROM {rds_table_name} WHERE id = %s"

    with rds.cursor() as cursor:
        for record in event["Records"]:
            if record["eventName"] in ["INSERT", "MODIFY"]:
                new_image = record["dynamodb"]["NewImage"]
                id = new_image["id"]["S"]
                user_id = new_image["user"]["M"]["id"]["S"]
                room_id = new_image["room"]["M"]["id"]["S"]
                check_in_date = datetime.strptime(
                    new_image["check_in_date"]["S"], "%Y-%m-%dT%H:%M:%S.%fZ"
                )
                check_out_date = datetime.strptime(
                    new_image["check_out_date"]["S"], "%Y-%m-%dT%H:%M:%S.%fZ"
                )
                status = new_image["status"]["S"]
                total_price = float(new_image["total_price"]["N"])
                guests = int(new_image["guests"]["N"])

                # Execute SQL upsert statement
                cursor.execute(
                    upsert_query,
                    (
                        id,
                        user_id,
                        room_id,
                        check_in_date,
                        check_out_date,
                        status,
                        total_price,
                        guests,
                    ),
                )
            elif record["eventName"] == "REMOVE":
                old_image = record["dynamodb"]["OldImage"]
                id = old_image["id"]["S"]

                # Execute SQL delete statement
                cursor.execute(delete_query, (id,))

        rds.commit()

    return {"statusCode": 200, "body": json.dumps("Data migration complete")}
