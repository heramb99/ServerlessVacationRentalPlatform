import { MyBookingsProvider } from '@/hooks/use-bookings';

const BookingListLayout = ({ children }) => {
  return <MyBookingsProvider>{children}</MyBookingsProvider>;
};

export default BookingListLayout;
