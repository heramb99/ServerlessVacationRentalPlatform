resource "google_dialogflow_cx_webhook" "getroomdetailshook" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "GetRoomDetailsHook"

  generic_web_service {
    uri = "https://dn76h928g5.execute-api.us-east-1.amazonaws.com/dev/getDetails"
  }
}

resource "google_dialogflow_cx_webhook" "createtickethook" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "CreateTicketHook"

  generic_web_service {
    uri = "https://us-central1-sdp-project-427923.cloudfunctions.net/handleBotRequest"
  }
}

resource "google_dialogflow_cx_page" "Middleware" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Middleware"

  transition_routes {
    intent      = google_dialogflow_cx_intent.signup.id
    target_page = google_dialogflow_cx_page.signup.id
  }

  transition_routes {
    intent      = google_dialogflow_cx_intent.login.id
    target_page = google_dialogflow_cx_page.login.id
  }

  transition_routes {
    intent      = google_dialogflow_cx_intent.room.id
    target_page = google_dialogflow_cx_page.room.id
  }

  transition_routes {
    intent      = google_dialogflow_cx_intent.room_details.id
    target_page = google_dialogflow_cx_page.room_details.id
  }

  transition_routes {
      intent      = google_dialogflow_cx_intent.create_ticket_intent.id
      target_page = google_dialogflow_cx_page.create_ticket.id
    }

  entry_fulfillment {
    return_partial_responses = false

    messages {
      text {
        text = ["How can I help you?"]
      }
    }
  }
}

resource "google_dialogflow_cx_page" "signup" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Signup"

  entry_fulfillment {
    return_partial_responses = false

    messages {
      text {
        text = [
          "Sure! You can find two Guest/Agent Login options on the top right navigation bar. Once you navigate to the login page, you'll find an option to Register. Users can register using email and password. To complete the account setup, the user should complete 2 Multi-factor authentication steps where the first step is to set up a security question & answer and set a cypher key."
        ]
      }
    }
  }

  transition_routes {
    condition   = "true"
    target_page = google_dialogflow_cx_page.confirm.id
  }
}

resource "google_dialogflow_cx_page" "login" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Login"

  entry_fulfillment {
    return_partial_responses = false

    messages {
      text {
        text = [
          "Sure! You can find Guest/Agent Login options on the top right navigation bar. When you click on one of the options, the user is navigated to the login page where the user must enter their email and password. Once the user enters the correct details, the user should complete 2 Multi-factor Authentication steps which includes answering the security question and entering cypher text."
        ]
      }
    }
  }

  transition_routes {
    condition   = "true"
    target_page = google_dialogflow_cx_page.confirm.id
  }
}

resource "google_dialogflow_cx_page" "room" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Room"

  entry_fulfillment {
    return_partial_responses = false

    messages {
      text {
        text = [
          "You can find Rooms option in top right navigation bar. Once you navigate to rooms page, you'll be able to see list of rooms. You can select room of your choice. When you click on a particular room you can find its availability, price and reviews."
        ]
      }
    }
  }

  transition_routes {
    condition   = "true"
    target_page = google_dialogflow_cx_page.confirm.id
  }
}

resource "google_dialogflow_cx_page" "room_details" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Room Details"

  transition_routes {
    condition = "true"
    target_page = google_dialogflow_cx_page.get_room_details.id
    trigger_fulfillment {
      return_partial_responses = false
    }
  }
}

resource "google_dialogflow_cx_page" "create_ticket" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "CreateTicket"

  entry_fulfillment {
      messages {
        text {
          text = [
            "Please enter your Booking Reference Code"
          ]
        }
      }
    }

    transition_routes {
      condition = "true"
      intent      = google_dialogflow_cx_intent.get_booking_id.id
      target_page = google_dialogflow_cx_page.confirm.id

      trigger_fulfillment {
        webhook = google_dialogflow_cx_webhook.createtickethook.id
        tag     = "RoomTag"
      }
    }
  }

resource "google_dialogflow_cx_page" "get_room_details" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Get Room Details"

  entry_fulfillment {
    messages {
      text {
        text = [
          "Please enter your Booking Reference Code"
        ]
      }
    }
  }

  transition_routes {
    condition = "true"
    intent      = google_dialogflow_cx_intent.get_booking_id.id
    target_page = google_dialogflow_cx_page.confirm.id

    trigger_fulfillment {
      webhook = google_dialogflow_cx_webhook.getroomdetailshook.id
      tag     = "RoomTag"
    }
  }
}


resource "google_dialogflow_cx_page" "confirm" {
  parent       = google_dialogflow_cx_agent.agent.start_flow
  display_name = "Confirm"

  entry_fulfillment {
    return_partial_responses = true

    messages {
          text {
            text = ["Thank you for using our service! Have a good day"]
          }
        }
  }
  transition_routes {
      condition   = "true"
      target_page = "${google_dialogflow_cx_agent.agent.start_flow}/pages/END_SESSION"
    }
}
