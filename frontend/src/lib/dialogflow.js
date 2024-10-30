'use server';
import dialogflow from '@google-cloud/dialogflow-cx';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID
const location = process.env.NEXT_PUBLIC_GOOGLE_DIALOGFLOW_REGION
const agentId = process.env.NEXT_PUBLIC_GOOGLE_DIALOGFLOW_AGENT_ID
const sessionId = uuidv4();

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_EMAIL?.replace(/\\n/g, '\n',),
    private_key: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_PRIVATE_KEY,
  },
});

// Create a new session
const sessionPath = sessionClient.projectLocationAgentSessionPath(
  projectId,
  location,
  agentId,
  sessionId,
);


// Function to send a message to Dialogflow
export async function sendMessageToDialogflow(message,session) {

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
      },
      languageCode: 'en-US',
    },
    queryParams: {
        parameters: {
          fields: {
            userRole: { kind: 'stringValue', stringValue: session.role ? session.role : 'guest' },
            userEmail: { kind: 'stringValue', stringValue: session.user.email ? session.user.email : '' },
          }
        }
      }
  };

  try {
    
    const responses = await sessionClient.detectIntent(request);
    const messages = responses[0].queryResult.responseMessages.flatMap(element => element.text?.text || []);
    
    return messages;

  } catch (error) {
    console.log('Error communicating with Dialogflow:', error);
    return 'An error occurred. Please try again.';
  }
}
