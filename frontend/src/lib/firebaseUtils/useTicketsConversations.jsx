import { useEffect, useState } from 'react';
// import { doc } from "firebase-admin/firestore";
import { arrayUnion, doc, onSnapshot, updateDoc,collection } from "firebase/firestore";
import{ db } from './firebaseConfig';

function formatTimestamp(timestamp) {
    const date = new Date(parseInt(timestamp, 10));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    return formattedDate;
}

const useTicketConversations = (ticketId,currentUserEmail,chatSubscriptionRef) => {
  const [messageList, setMessageList] = useState([]);


  useEffect(() => {
    const getChats = () => {

        if (chatSubscriptionRef.current) {
            chatSubscriptionRef.current();
        }

      const unsub = onSnapshot(doc(db, "chats" , ticketId), (doc) => {
        if (doc.exists()) {
          const conversations = doc.data().messages;
          const messages = [];
          conversations.map((msg, index) => {
            messages.push({
                message: msg.message,
                sender: msg.sender,
                timestamp: formatTimestamp(msg.timestamp),
                isOutgoing: msg.sender === currentUserEmail,
            })
        });
          setMessageList(messages);
        }
      });
      chatSubscriptionRef.current = unsub
      
    };
    currentUserEmail && ticketId && getChats();
    return () => {
        if (chatSubscriptionRef.current) {
            chatSubscriptionRef.current();
        }
      };

  }, [ticketId]);

  return messageList;
};

export default useTicketConversations;
