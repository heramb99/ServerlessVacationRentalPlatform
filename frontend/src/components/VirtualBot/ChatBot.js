import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToDialogflow } from '../../lib/dialogflow';
import { X, Bot, Send } from 'lucide-react';

const ChatBot = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput) return;

    // Sending user input to Dialogflow and receive a response
    const response = await sendMessageToDialogflow(userInput.trim(), session);

    const botMessages = response.map((text) => ({ text, type: 'bot' }));
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userInput, type: 'user' },
      ...botMessages,
    ]);

    // Clearing the user input field
    setUserInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          className="bg-violet-500 border-b-black text-white rounded-full p-4 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Bot />
        </button>
      )}
      {isOpen && (
        <div className="flex flex-col w-96 h-[450px] bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="flex justify-between items-center bg-violet-500 text-white p-4 rounded-t-lg">
            <h2>Virtual Assistant</h2>
            <button onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto w-full">
            {messages.map((message, index) => (
              <div
                key={index}
                className={` flex w-full ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <p
                  className={`mb-2 p-2  rounded w-fit ${
                    message.type === 'user'
                      ? 'bg-gray-200 text-gray-700 '
                      : ' bg-blue-200 text-gray-700'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
          <div className="flex p-4 border-t border-gray-300">
            <input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={handleUserInput}
              onKeyDown={handleKeyDown}
              className="flex-grow p-2 border bg-white border-gray-300 rounded mr-2"
            />
            <button
              onClick={handleSendMessage}
              className="bg-violet-500 text-white rounded-full px-4 py-2"
            >
              <Send />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
