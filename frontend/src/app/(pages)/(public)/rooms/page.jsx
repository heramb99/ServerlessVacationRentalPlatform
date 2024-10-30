import RoomList from './RoomList';
import RoomFilters from './RoomFilters';

const Index = () => {
  return (
    <div className="flex justify-between w-full h-full py-2 pt-3">
      <div className="w-1/4 h-full pr-2 hidden lg:block">
        <RoomFilters />
      </div>
      <div className="w-3/4 h-full px-4 overflow-scroll">
        <RoomList />
      </div>
    </div>
  );
};

export default Index;
