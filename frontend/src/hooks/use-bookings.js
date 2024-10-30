'use client';

import { useToast } from '@/components/ui/use-toast';
import { createContext, useContext, useEffect, useState } from 'react';

const MyBookingsContext = createContext(null);

export const MyBookingsProvider = ({ children }) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('reserved');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/bookings', {
        method: 'GET',
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(data?.bookings);
      } else {
        toast({
          title: 'Error',
          description: data?.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MyBookingsContext.Provider
      value={{
        fetchBookings,
        activeTab,
        setActiveTab,
        bookings,
        setBookings,
        loading,
        setLoading,
      }}
    >
      {children}
    </MyBookingsContext.Provider>
  );
};

export const useBookings = () => {
  return useContext(MyBookingsContext);
};
