import { UserRoomProvider } from '@/hooks/use-user-room';
import React from 'react';

const UserRoomLayout = ({ children }) => {
  return <UserRoomProvider>{children}</UserRoomProvider>;
};

export default UserRoomLayout;
