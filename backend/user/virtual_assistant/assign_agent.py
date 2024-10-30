import json
import json
import boto3
import traceback
from boto3.dynamodb.conditions import Attr
from uuid import uuid4
import random


dynamodb = boto3.resource("dynamodb")
user_table = dynamodb.Table("dvh-user")
booking_table = dynamodb.Table("dvh-booking")

def validate_headers(headers):
    """validates the headers"""
    required_headers = ["bookingId", "userEmail"]
    for header in required_headers:
        if header not in headers or not headers.get(header):
            raise Exception(f"{header} is missing in headers")

def get_value(item,key):
    """ Gets value from item using key"""
    if key in item:
        return item.get(key)
    else:
        return 'N/A'

def check_booking_details(booking_id,email_id):
    """ Fetches booking details from dynamodb table using id"""
    
    response = booking_table.get_item(Key={"id": booking_id})
    if "Item" not in response:
        raise Exception("Invalid Booking Id") 
    else:
        booking_data=get_value(response,'Item')
        user_details=get_value(booking_data,'user')
        user_email=get_value(user_details,'email')
        
        if email_id!=user_email:
            raise Exception("Sorry! This is not your booking.")

def assign_agent():
    
    response = user_table.scan(
        FilterExpression=boto3.dynamodb.conditions.Attr('role').eq('agent')
    )
    agents = response.get('Items', [])
    
    if not agents:
        raise Exception("No agents available at moment")
    
    # Randomly selecting an agent
    selected_agent = random.choice(agents)
    return selected_agent.get('email')
    

def lambda_handler(event, context):
    
    try:
        validate_headers(event)
        
        email=event.get('userEmail')
        bookingId=event.get('bookingId')
        check_booking_details(bookingId,email)
        
        ticket_id=uuid4().hex
        agent_email=assign_agent()
        
        data={
            'agent_email':agent_email,
            'ticket_id':ticket_id
        }
        
        return {
            'statusCode': 200,
            'message':'success',
            'body': json.dumps(data)
        }
        
        
    except Exception as e:
        return {
            'statusCode': 200,
            'message':'failed',
            'errorMessage':str(e),
            'body': json.dumps(str(e))
        }
    
