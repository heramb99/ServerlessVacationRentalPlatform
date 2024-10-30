provider "google" {
  project = "sdp-project-427923"
  region  = "us-central1"
}

# Create Pub/Sub topic
resource "google_pubsub_topic" "raise_ticket_topic" {
  name = "raise_ticket_topic"
}

# Create IAM service account
resource "google_service_account" "cloud_function_sa" {
  account_id   = "cloud-function-sa"
  display_name = "Cloud Function Service Account"
}

# Assign roles to the service account
resource "google_project_iam_member" "pubsub_publisher_role" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.cloud_function_sa.email}"
}

resource "google_project_iam_member" "cloudfunctions_invoker_role" {
  project = var.project_id
  role    = "roles/cloudfunctions.invoker"
  member  = "serviceAccount:${google_service_account.cloud_function_sa.email}"
}

# Create a storage bucket for Cloud Functions source code
resource "google_storage_bucket" "sdp_source_bucket" {
  name     = "${var.project_id}-sdp-function-source"
  location = var.region
}

# Upload Cloud Functions source code to the storage bucket
resource "google_storage_bucket_object" "handleBotRequest_function" {
  name   = "handleBotRequest_function.zip"
  bucket = google_storage_bucket.sdp_source_bucket.name
  source = "./function-source-handleBotRequest.zip"
}

# Upload Cloud Functions source code to the storage bucket
resource "google_storage_bucket_object" "handleMessagePublish_function" {
  name   = "handleMessagePublish_function.zip"
  bucket = google_storage_bucket.sdp_source_bucket.name
  source = "./function-source-handleMessagePublish.zip"
}

# Deploy the first Cloud Function (HTTP trigger)
resource "google_cloudfunctions_function" "handle_bot_request_tf" {
  name        = "handleBotRequestTf"
  runtime     = "python311"  
  entry_point = "publish_message" 
  source_archive_bucket = google_storage_bucket.sdp_source_bucket.name
  source_archive_object = google_storage_bucket_object.handleBotRequest_function.name
  trigger_http = true
  available_memory_mb = 256

  environment_variables = {
    GCP_PROJECT_ID   = var.project_id
    PUBSUB_TOPIC_ID  = google_pubsub_topic.raise_ticket_topic.name
    LOG_EXECUTION_ID = true
    API_ENDPOINT     = var.api_endpoint
  }

  service_account_email = google_service_account.cloud_function_sa.email
}

resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = google_cloudfunctions_function.handle_bot_request_tf.project
  region         = google_cloudfunctions_function.handle_bot_request_tf.region
  cloud_function = google_cloudfunctions_function.handle_bot_request_tf.name
 
  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}

# Deploy the second Cloud Function (Pub/Sub trigger)
resource "google_cloudfunctions_function" "handle_message_publish_tf" {
  name        = "handleMessagePublishTf"
  runtime     = "python311"  # Change to your runtime
  entry_point = "createChatDocuments" 
  source_archive_bucket = google_storage_bucket.sdp_source_bucket.name
  source_archive_object = google_storage_bucket_object.handleMessagePublish_function.name

  event_trigger {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.raise_ticket_topic.id
  }

  environment_variables = {
    LOG_EXECUTION_ID        = true
    FIREBASE_PRIVATE_KEY_ID = var.firebase_private_key_id
    FIREBASE_PROJECT_ID     = var.project_id
    FIREBASE_PRIVATE_KEY    =  var.firebase_private_key
    FIREBASE_CLIENT_EMAIL    = var.firebase_client_email
    FIREBASE_CLIENT_ID       = var.firebase_client_id
    FIREBASE_CLIENT_CERT_URL = var.firebase_client_cert_url
  }

  service_account_email = google_service_account.cloud_function_sa.email
}

# Output the URL of the HTTP-triggered Cloud Function
output "handle_bot_request_tf_url" {
  value = google_cloudfunctions_function.handle_bot_request_tf.https_trigger_url
}

# Variables
variable "project_id" {
  description = "The ID of the project in which to create the resources."
  type        = string
}

variable "region" {
  description = "The region in which to create the resources."
  type        = string
}

variable "firebase_private_key" {
  description = "The private key for Firebase."
  type        = string
}

variable "firebase_private_key_id" {
  description = "The private key id for Firebase."
  type        = string
}

variable "firebase_client_email" {
  description = "The client email for Firebase."
  type        = string
}

variable "firebase_client_id" {
  description = "The client ID for Firebase."
  type        = string
}

variable "firebase_client_cert_url" {
  description = "The client certificate URL for Firebase."
  type        = string
}

variable "api_endpoint" {
  description = "The API Gateway endpoint."
  type        = string
}
