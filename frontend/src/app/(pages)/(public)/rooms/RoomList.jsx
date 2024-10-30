'use client';

import { useUserRoom } from '@/hooks/use-user-room';
import RoomCard from './components/RoomCard';
import { Loading } from '@/components/ui/loading';
import NoDataFound from '@/components/no-data-found';

const RoomList = () => {
  const { rooms = [], loading } = useUserRoom();

  if (loading) {
    return <Loading placeHolder={'Loading rooms...'} />;
  }

  if (!rooms?.length) {
    return <NoDataFound placeholder="No rooms found!!" />;
  }

  return (
    <div className="overflow-auto">
      <div className="grid lg:grid-cols-3 gap-5 md:grid-cols-2 sm:grid-cols-1">
        {rooms?.map((room, index) => {
          return <RoomCard key={`user-room-${index}`} room={room} />;
        })}
      </div>
    </div>
  );
};

export default RoomList;
