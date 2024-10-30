import { v4 as uuid } from 'uuid';
import { db } from './firebaseConfig';
import {  doc, updateDoc, arrayUnion } from "firebase/firestore";


const pushMessage= async (seletectedTicket,inputMessage,currentUserEmail) => {

    if(!inputMessage || !seletectedTicket) return
    console.log(seletectedTicket, inputMessage, currentUserEmail) 
    await updateDoc(doc(db, "chats" , seletectedTicket.ticketId), {
        messages: arrayUnion({
            id: uuid(),
            message: inputMessage,
            sender: currentUserEmail,
            timestamp: Date.now(),
        }),
    });

    var secondUser;
    if (seletectedTicket.agentEmail === currentUserEmail) {
        secondUser = seletectedTicket.userEmail;
    } else {
        secondUser = seletectedTicket.agentEmail;
    }
    const currentTimestamp = Date.now();
    const ticketId = seletectedTicket.ticketId;
    await updateDoc(doc(db, "chatConnections", currentUserEmail), {
        [ticketId + ".lastMessage"]: inputMessage,
        [ticketId + ".lastUpdatedTimestamp"]: currentTimestamp,
        [ticketId + ".lastMessageBy"]: currentUserEmail
    });

    await updateDoc(doc(db, "chatConnections", secondUser), {
        [ticketId + ".lastMessage"]: inputMessage,
        [ticketId + ".lastUpdatedTimestamp"]: currentTimestamp,
        [ticketId + ".lastMessageBy"]: currentUserEmail
    });
}

const markTicketAsResolved = async (seletectedTicket,currentUserEmail) => {

    if(!seletectedTicket) return
    console.log("Insided markedAsResolved:",seletectedTicket)
    pushMessage(seletectedTicket,"Agent as marked this ticket as resolved",currentUserEmail)
    const ticketId = seletectedTicket.ticketId;
    await updateDoc(doc(db, "chatConnections", seletectedTicket.userEmail), {
        [ticketId + ".isResolved"]: true,
    });
    await updateDoc(doc(db, "chatConnections", seletectedTicket.agentEmail), {
        [ticketId + ".isResolved"]: true,
    });

}

export  {pushMessage,markTicketAsResolved}