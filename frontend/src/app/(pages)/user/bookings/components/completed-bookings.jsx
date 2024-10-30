import NoDataFound from '@/components/no-data-found';
import { useBookings } from '@/hooks/use-bookings';
import { useEffect, useState } from 'react';

const ReservedBookings = () => {
  const { bookings = [] } = useBookings();
  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    prepareCompletedBookings();
  }, [bookings]);

  const prepareCompletedBookings = () => {
    setCompletedBookings(
      bookings?.filter((booking) => booking?.status === 'COMPLETED'),
    );
  };

  if (!completedBookings?.length) {
    return <NoDataFound placeholder="No Bookings to show" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {completedBookings?.map((booking, index) => {
        return <div key={`booking-item-${index}`}>{booking?.room?.name}</div>;
      })}
    </div>
  );
};

export default ReservedBookings;
