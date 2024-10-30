import NoDataFound from '@/components/no-data-found';
import { useBookings } from '@/hooks/use-bookings';
import { useEffect, useState } from 'react';
import BookingCard from './booking-card';

const ReservedBookings = () => {
  const { bookings = [] } = useBookings();
  const [reservedBookings, setReservedBookings] = useState([]);

  useEffect(() => {
    prepareReservedBookings();
  }, [bookings]);

  const prepareReservedBookings = () => {
    setReservedBookings(
      bookings?.filter((booking) => booking?.status === 'RESERVED'),
    );
  };

  if (!reservedBookings?.length) {
    return <NoDataFound placeholder="No Bookings to show" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {reservedBookings?.map((booking, index) => {
        return <BookingCard key={`booking-item-${index}`} booking={booking} />;
      })}
    </div>
  );
};

export default ReservedBookings;
