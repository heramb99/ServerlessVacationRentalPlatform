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
    rds_table_name = "dvh_user"

    # Prepare SQL insert/update statement for RDS
    upsert_query = f"""
    INSERT INTO {rds_table_name} (id, email, cognito_user_id, dob, gender, is_verified, mfa_1_configured, mfa_2_configured, name, role)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        cognito_user_id = VALUES(cognito_user_id),
        dob = VALUES(dob),
        gender = VALUES(gender),
        is_verified = VALUES(is_verified),
        mfa_1_configured = VALUES(mfa_1_configured),
        mfa_2_configured = VALUES(mfa_2_configured),
        name = VALUES(name),
        role = VALUES(role)
    """

    with rds.cursor() as cursor:
        for record in event["Records"]:
            if record["eventName"] in ["INSERT", "MODIFY"]:
                new_image = record["dynamodb"]["NewImage"]
                id = new_image.get("id", {}).get("S", "")
                email = new_image.get("email", {}).get("S", "")
                cognito_user_id = new_image.get("cognito_user_id", {}).get("S", "")
                dob = new_image.get("dob", {}).get("S", "")
                gender = new_image.get("gender", {}).get("S", "")
                is_verified = new_image.get("is_verified", {}).get("BOOL", False)
                mfa_1_configured = (
                    new_image.get("mfa_1", {})
                    .get("M", {})
                    .get("configured", {})
                    .get("BOOL", False)
                )
                mfa_2_configured = (
                    new_image.get("mfa_2", {})
                    .get("M", {})
                    .get("configured", {})
                    .get("BOOL", False)
                )
                name = new_image.get("name", {}).get("S", "")
                role = new_image.get("role", {}).get("S", "")

                # Execute SQL upsert statement
                cursor.execute(
                    upsert_query,
                    (
                        id,
                        email,
                        cognito_user_id,
                        dob,
                        gender,
                        is_verified,
                        mfa_1_configured,
                        mfa_2_configured,
                        name,
                        role,
                    ),
                )
        rds.commit()

    return {"statusCode": 200, "body": json.dumps("Data migration complete")}
