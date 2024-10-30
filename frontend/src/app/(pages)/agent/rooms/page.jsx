'use client';

import { useEffect } from 'react';
import { RoomTable } from './components/room-table';
import { columns } from './components/columns';
import { useAgentRoom } from '@/hooks/use-agent-room';
import { Loading } from '@/components/ui/loading';

const Index = () => {
  const { rooms, setRooms, setLoading, loading } = useAgentRoom();

  useEffect(() => {
    fetchRoomList();
  }, []);

  const fetchRoomList = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agent/rooms');
      const data = await response.json();
      setRooms(data?.rooms);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading placeHolder={'Fetching Rooms...'} />;
  }

  return (
    <div className="p-2">
      <RoomTable columns={columns} data={rooms} />
    </div>
  );
};

export default Index;
