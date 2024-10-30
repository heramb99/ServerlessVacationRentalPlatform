import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontal } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import useTicketConversations from '@/lib/firebaseUtils/useTicketsConversations';
import { useAuth } from '@/hooks/use-auth';
import {pushMessage, markTicketAsResolved} from '@/lib/firebaseUtils/utilsFunctions';

const Conversation = ({ selectedTicket, setSelectedTicket }) => {
  const messagesEndRef = useRef(null);
  const { isAuthenticatedUser, session } = useAuth();
  const [chatData, setChatData] = useState([]);
  const chatSubscriptionRef = useRef(null);
  const messageData = useTicketConversations(
    selectedTicket?.ticketId,
    session?.user?.email,
    chatSubscriptionRef,
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    setChatData(messageData);
  }, [messageData]);

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  const Messages = () => {
    return (
      <div className="flex-grow w-full mt-4 overflow-y-scroll p-4">
        <div className="grid grid-col-1 gap-2">
          {chatData.map((messageData, index) => {
            return (
              <div
                key={index}
                className={`flex text-sm flex-col space-y-1 ${
                  !messageData.isOutgoing ? 'items-start' : 'items-end'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    messageData.isOutgoing
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-violet-500 text-white'
                  }`}
                >
                  {messageData.message}
                </div>
                <div
                  className={`text-xs text-gray-500 ${
                    !messageData.isOutgoing ? 'text-left' : 'text-right'
                  }`}
                >
                  {messageData.timestamp}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const BottomBar = () => {
    const [message, setMessage] = useState('');

    const inputChangeHandler = (event) => {
      // console.log("message data:",event.target.value)
      setMessage(event.target.value);
    };

    const handleButtonClick = () => {
      if (message) {
        pushMessage(selectedTicket, message, session?.user?.email);
        setMessage('');
      }
    };

    const handleMarkAsResolved = () => {
      markTicketAsResolved(selectedTicket,session?.user?.email)
      setSelectedTicket(null)
    }
    

    return (
      <div className="h-20 w-full flex justify-between items-end py-1 space-x-2">
        <Input
          onChange={inputChangeHandler}
          value={message}
          disabled={selectedTicket?.isResolved}
          placeholder="Type a message"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleButtonClick();
            }
          }}
        />
        <Button disabled={selectedTicket?.isResolved} onClick={() => handleButtonClick()}>
          <SendHorizontal size={'15px'} />
        </Button>
        {!selectedTicket.isResolved && (
          <Button onClick={() => handleMarkAsResolved()}>Close Ticket</Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between w-full h-full">
      {selectedTicket === null ? (
        <div className="w-full h-full flex justify-center items-center">
          <h3 className="font-medium text-lg">Select a ticket</h3>
        </div>
      ) : (
        <>
          <Messages />
          <BottomBar />
        </>
      )}
    </div>
  );
};

export default Conversation;
