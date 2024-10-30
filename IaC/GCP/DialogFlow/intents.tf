resource "google_dialogflow_cx_intent" "middleware" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "user.middleware"
  priority     = 500000

  training_phrases {
    repeat_count = 1
    parts {
      text = "Hi"
    }
  }
  training_phrases {
      repeat_count = 1
      parts {
        text = "Okay"
      }
    }
  training_phrases {
        repeat_count = 1
        parts {
          text = "okay"
        }
      }
  training_phrases {
        repeat_count = 1
        parts {
          text = "Ok"
        }
      }
  training_phrases {
        repeat_count = 1
        parts {
          text = "ok"
        }
      }
  training_phrases {
        repeat_count = 1
        parts {
          text = "OK"
        }
      }
  training_phrases {
      repeat_count = 1
      parts {
        text = "I need help"
      }
    }
  }
resource "google_dialogflow_cx_intent" "signup" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "Sign up Intent"
  priority     = 500000

  training_phrases {
    repeat_count = 1
    parts {
      text = "how can a user create new account"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "how can an agent create a new account"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "How to Sign up?"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "Where to sign up?"
    }
  }
  training_phrases {
      repeat_count = 1
      parts {
        text = "How to get started?"
      }
    }
  training_phrases {
      repeat_count = 1
      parts {
        text = "How to open new account"
      }
    }
  training_phrases {
      repeat_count = 1
      parts {
        text = "How to create new account"
      }
    }
}

resource "google_dialogflow_cx_intent" "login" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "Login Intent"
  priority     = 500000

  training_phrases {
    repeat_count = 1
    parts {
          text = "How to login?"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "How to login?"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "Where is guest login"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "How to login as guest"
    }
  }
  training_phrases {
      repeat_count = 1
      parts {
        text = "How to login as Agent?"
      }
    }
}

resource "google_dialogflow_cx_intent" "room_details" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "Room Details Intent"
  priority     = 500000

  training_phrases {
    repeat_count = 1
    parts {
      text = "What services are included in my booking?"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "What is my duration of stay"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "What is my room number?"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text = "previous booking details"
    }
  }
  training_phrases {
      repeat_count = 1
      parts {
        text = "Can you please give me booking details"
      }
    }
  training_phrases {
        repeat_count = 1
        parts {
          text = "I want information about my booking"
        }
      }
  training_phrases {
          repeat_count = 1
          parts {
            text = "Where can I find my booking details"
          }
        }
  training_phrases {
            repeat_count = 1
            parts {
              text = "Room reservation details"
            }
          }
  training_phrases {
              repeat_count = 1
              parts {
                text = "can you please give me booking details"
              }
            }
  training_phrases {
                repeat_count = 1
                parts {
                  text = "I want to get booking details"
                }
              }
}

resource "google_dialogflow_cx_intent" "get_booking_id" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "GetBookingId"
  priority     = 500000

  parameters {
    entity_type = "projects/-/locations/-/agents/-/entityTypes/sys.any"
    id          = "BookingId"
    is_list     = false
    redact      = false
  }

  training_phrases {
    repeat_count = 1
    parts {
      text         = "Booking Reference Code is "
    }
    parts {
      text         = "CODE"
      parameter_id = "BookingId"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text         = "It's "
    }
    parts {
      text         = "CODE"
      parameter_id = "BookingId"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text         = "Booking ID "
    }
    parts {
      text         = "CODE"
      parameter_id = "BookingId"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text         = "CODE"
      parameter_id = "BookingId"
    }
  }

  training_phrases {
    repeat_count = 1
    parts {
      text         = "My Booking Reference Code is "
    }
    parts {
      text         = "CODE"
      parameter_id = "BookingId"
    }
  }
}


resource "google_dialogflow_cx_intent" "yes" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "yes Intent"
  training_phrases {
          repeat_count = 1
          parts {
            text = "yup"
          }
        }
  training_phrases {
          repeat_count = 1
          parts {
            text = "of course"
          }
        }
  training_phrases {
          repeat_count = 1
          parts {
            text = "yes"
          }
        }
}

resource "google_dialogflow_cx_intent" "no" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "no Intent"
  training_phrases {
          repeat_count = 1
          parts {
            text = "bye"
          }
        }
  training_phrases {
          repeat_count = 1
          parts {
            text = "thanks"
          }
        }
  training_phrases {
          repeat_count = 1
          parts {
            text = "no"
          }
        }
  training_phrases {
            repeat_count = 1
            parts {
              text = "nothing"
            }
          }
  training_phrases {
              repeat_count = 1
              parts {
                text = "nope"
              }
            }
  training_phrases {
                repeat_count = 1
                parts {
                  text = "noo"
                }
              }
}

resource "google_dialogflow_cx_intent" "create_ticket_intent" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "Create Ticket Intent"
  training_phrases {
        repeat_count = 1
        parts {
          text = "create a ticket"
        }
      }
  training_phrases {
          repeat_count = 1
          parts {
            text = "I want to contact an agent"
          }
        }
  training_phrases {
            repeat_count = 1
            parts {
              text = "chat with agent"
            }
          }

  training_phrases {
              repeat_count = 1
              parts {
                text = "I want to raise a ticket"
              }
            }

  training_phrases {
                repeat_count = 1
                parts {
                  text = "Connect to agent"
                }
              }
  training_phrases {
                  repeat_count = 1
                  parts {
                    text = "Connect me with agent"
                  }
                }
}

resource "google_dialogflow_cx_intent" "room" {
  parent       = google_dialogflow_cx_agent.agent.id
  display_name = "Room Intent"
  training_phrases {
      repeat_count = 1
      parts {
        text = "How to reserve to room?"
      }
    }
  training_phrases {
         repeat_count = 1
         parts {
           text = "What are the steps to book room"
         }
    }
  training_phrases {
           repeat_count = 1
           parts {
             text = "How can I book room"
           }
      }
  training_phrases {
             repeat_count = 1
             parts {
               text = "How to book a room?"
             }
        }
  }
