import base64
import functions_framework
import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
import time

# Initialize Firebase Admin SDK using environment variables
project_id = os.getenv('FIREBASE_PROJECT_ID')
cred = credentials.Certificate({
    "type": "service_account",
    "project_id": project_id,
    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
    "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL')
})

firebase_admin.initialize_app(cred, {
    'projectId': project_id,
})

# Initialize Firestore
db = firestore.client()

@functions_framework.cloud_event
def createChatDocuments(message):
    message_data = message.data

    # Extract parameters from message data 
    attributes = message_data.get('message', {}).get('attributes', {})

    print("attributes:", attributes)
    # Access specific parameters or all parameters
    booking_id = attributes.get('bookingid')
    user_email = attributes.get('userEmail')
    user_role = attributes.get('userRole')
    agent_email = attributes.get('agentEmail')
    ticket_id = attributes.get('ticket_id')
    
    print(f"Booking ID: {booking_id}, User Email: {user_email}, User Role: {user_role}, agent_email: {agent_email}")

    try:
        # Creating or getting the database reference
        chat_connections_ref = db.collection("chatConnections")
        currentTimestamp=int(time.time())
        # Create or update document for userEmail
        user_doc_ref = chat_connections_ref.document(user_email)
        user_doc_ref.set({
            ticket_id: {
                "lastMessage": "",
                "userEmail": user_email,
                "agentEmail": agent_email,
                "lastUpdatedTimestamp": currentTimestamp,
                "bookingId": booking_id,
                "isResolved": False
            }
        }, merge=True)

        # Create or update document for agentEmail
        agent_doc_ref = chat_connections_ref.document(agent_email)
        agent_doc_ref.set({
            ticket_id: {
                "lastMessage": "",
                "userEmail": user_email,
                "agentEmail": agent_email,
                "lastUpdatedTimestamp": currentTimestamp,
                "bookingId": booking_id,
                "isResolved": False
            }
        }, merge=True)

        # chats Collection
        chats_ref = db.collection("chats")
        chat_doc_ref = chats_ref.document(ticket_id)
        chat_doc_ref.set({
            "messages": []
        }, merge=True)

        print("Database updated successfully")
    except Exception as e:
        print("Error Occured:", e)
