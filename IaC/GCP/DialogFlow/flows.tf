resource "null_resource" "default_start_flow" {
  provisioner "local-exec" {
    command = <<-EOT
    curl --location --request PATCH "https://dialogflow.googleapis.com/v3/projects/${self.triggers.PROJECT}/locations/global/agents/${self.triggers.AGENT}/flows/${self.triggers.DEFAULT_START_FLOW}?updateMask=transitionRoutes" \
    -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
    -H 'Content-Type: application/json' \
    -H "x-goog-user-project: ${self.triggers.QUOTA_PROJECT}" \
    --data-raw "{
      'transitionRoutes': [{
        'intent': 'projects/${self.triggers.PROJECT}/locations/global/agents/${self.triggers.AGENT}/intents/${self.triggers.DEFAULT_WELCOME_INTENT}',
        'triggerFulfillment': {
          'messages': [{
            'text': {
              'text': [
                'Hi! Welcome to DALVacationHome Website. Here you can book rooms, get reviews for past customers'
              ]
            }
          }]
        }
      }, {
        'intent': '${self.triggers.middleware_INTENT}',
        'targetPage': '${self.triggers.middleware_PAGE}'

      }]
    }"
    EOT
  }

  triggers = {
    PROJECT                = var.project_id
    LOCATION               = var.region
    AGENT                  = google_dialogflow_cx_agent.agent.name
    DEFAULT_START_FLOW     = "00000000-0000-0000-0000-000000000000"
    DEFAULT_WELCOME_INTENT = "00000000-0000-0000-0000-000000000000"

    middleware_INTENT      = google_dialogflow_cx_intent.middleware.id
    middleware_PAGE      = google_dialogflow_cx_page.Middleware.id
    QUOTA_PROJECT       = var.quota_project_id
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
    curl --location --request PATCH "https://dialogflow.googleapis.com/v3/projects/${self.triggers.PROJECT}/locations/global/agents/${self.triggers.AGENT}/flows/${self.triggers.DEFAULT_START_FLOW}?updateMask=transitionRoutes" \
    -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
    -H 'Content-Type: application/json' \
    -H "x-goog-user-project: ${self.triggers.QUOTA_PROJECT}" \
    --data-raw "{
      'transitionRoutes': [{
        'intent': 'projects/${self.triggers.PROJECT}/locations/global/agents/${self.triggers.AGENT}/intents/${self.triggers.DEFAULT_WELCOME_INTENT}',
        'triggerFulfillment': {
          'messages': [{
            'text': {
              'text': [
                'Hi! Welcome to DALVacationHome Website. Here you can book rooms, get reviews for past customers'
              ]
            }
          }]
        }
      }]
    }"
    EOT
  }

  depends_on = [
    google_dialogflow_cx_agent.agent
  ]
}


