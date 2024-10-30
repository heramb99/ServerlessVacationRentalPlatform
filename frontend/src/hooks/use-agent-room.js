'use client';

import { createContext, useContext, useState } from 'react';

const AgentRoomContext = createContext(null);

export const AgentRoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  return (
    <AgentRoomContext.Provider
      value={{
        rooms,
        loading,
        setRooms,
        searchText,
        setLoading,
        setSearchText,
      }}
    >
      {children}
    </AgentRoomContext.Provider>
  );
};

export const useAgentRoom = () => {
  return useContext(AgentRoomContext);
};
