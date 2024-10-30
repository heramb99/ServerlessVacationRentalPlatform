'use client';

import { createContext, useContext, useState } from 'react';

const UserRoomContext = createContext(null);

export const UserRoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  return (
    <UserRoomContext.Provider
      value={{
        rooms,
        setRooms,
        filters,
        setFilters,
        loading,
        setLoading,
      }}
    >
      {children}
    </UserRoomContext.Provider>
  );
};

export const useUserRoom = () => {
  return useContext(UserRoomContext);
};
