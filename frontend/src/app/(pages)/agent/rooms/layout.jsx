import React from 'react';
import { AgentRoomProvider } from '@/hooks/use-agent-room';

const AgentRoomLayout = ({ children }) => {
  return <AgentRoomProvider>{children}</AgentRoomProvider>;
};

export default AgentRoomLayout;
