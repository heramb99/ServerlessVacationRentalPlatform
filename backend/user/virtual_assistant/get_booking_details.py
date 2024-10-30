import json
from datetime import datetime
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
booking_table_name= os.getenv("DYNAMODB_BOOKING_TABLE_NAME")

booking_table = dynamodb.Table(booking_table_name)

def format_date(date_str):
    """Formats the date string to 'YYYY-MM-DD HH:MM'."""
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        return date_obj.strftime("%Y-%m-%d %H:%M %p")
    except ValueError:
        return 'Invalid Date' 

def get_value(item,key):
    """ Gets value from item using key"""
    if key in item:
        return item.get(key)
    else:
        return 'N/A'

def get_booking_details(booking_id):
    """ Fetches booking details from dynamodb table using id"""
    
    
    response = booking_table.get_item(Key={"id": booking_id})
    if "Item" not in response:
        return "Invalid Booking Id"
    else:
        booking_data=get_value(response,'Item')
        
        # booking details
        check_in_date=format_date(get_value(booking_data,'check_in_date'))
        check_out_date=format_date(get_value(booking_data,'check_out_date'))
        guests=get_value(booking_data,'guests')
 
        # room details
        room_details=get_value(booking_data,'room')
        room_name=get_value(room_details,'name')
        room_bathrooms=get_value(room_details.get('config',{}),'bathrooms')
        room_beds=get_value(room_details.get('config',{}),'beds')
        
        # Formatting the output string
        booking_details_str = f"""Booking Details: \nCheck-in Date: {check_in_date} \nCheck-out Date: {check_out_date} \nGuests: {guests}\n"""
        
        room_details_str = f"""Room Details: \nRoom Name: {room_name} \nBathrooms: {room_bathrooms} \nBeds: {room_beds}"""
        
        return booking_details_str + room_details_str
        
def validateUserRole(parameters):
    return parameters.get('userRole')!='guest'

def lambda_handler(event, context):
    try:
        payload = json.loads(event.get("body", "{}"))
        intentInfo = payload.get('intentInfo')
        parameters = payload.get('sessionInfo').get('parameters')
        
        booking_response=""
        
        if validateUserRole(parameters):
            booking_id =intentInfo.get('parameters').get('bookingid').get('originalValue')
            booking_response = get_booking_details(booking_id)
        else:
            booking_response = "Please Sign up or Login to get booking details"
        
    except:
        booking_response = "Sorry! We can't fetch details for now. Please try again later"
    
    headers =  {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    
    jsonResponse = {
        'fulfillment_response': {
            'messages': [
                {
                    'text': {
                        'text': [booking_response]
                    }
                }
            ]
        }
    }
    
    return {
        'statusCode': 200,
        'headers':headers,
        'isBase64Encoded': True,
        'body': json.dumps(jsonResponse)
    }
