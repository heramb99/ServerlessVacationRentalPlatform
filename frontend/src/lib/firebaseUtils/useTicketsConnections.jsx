import { useEffect, useState } from 'react';
// import { doc } from "firebase-admin/firestore";
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

const useTicketsConnections = (currentUser,chatSubscriptionRef) => {
  const [usersForChat, setUsersForChat] = useState([]);
  let unsubFunction=()=>{ }

  useEffect(() => {
    const getChats = () => {

    

      const unsub = onSnapshot(
        doc(db, 'chatConnections', currentUser),
        (doc) => {
          if (doc.exists()) {
            const conversations = doc.data();
            const userList = [];
            Object.keys(conversations).forEach((key) => {
              userList.push({
                name: conversations[key]?.name,
                lastUpdatedTimestamp:conversations[key]?.lastUpdatedTimestamp,
                lastMessage: conversations[key]?.lastMessage,
                agentEmail: conversations[key]?.agentEmail,
                userEmail: conversations[key]?.userEmail,
                ticketId: key,
                isResolved: conversations[key]?.isResolved,
                lastMessageBy: conversations[key]?.lastMessageBy,
                bookingId: conversations[key]?.bookingId,
              });
            });
            setUsersForChat(userList);
          }
        },
      );

      // chatSubscriptionRef.current = unsub
      unsubFunction=unsub
      
    };
    currentUser && getChats();
    return () => {
        unsubFunction()
    };
  }, [currentUser]);

  return usersForChat;
};

export default useTicketsConnections;
