'use client';

import { useBookings } from '@/hooks/use-bookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fragment, useEffect } from 'react';
import ReservedBookings from './components/reserved-bookings';
import CompletedBookings from './components/completed-bookings';
import { Loading } from '@/components/ui/loading';

const Bookings = () => {
  const { activeTab, setActiveTab, loading } = useBookings();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="p-2">
      <TabsList>
        <TabsTrigger value="reserved">Reserved</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      {loading ? (
        <Loading placeHolder={'Fetching bookings....'} />
      ) : (
        <Fragment>
          <TabsContent value="reserved" className="py-2 px-1">
            <ReservedBookings />
          </TabsContent>
          <TabsContent value="completed" className="py-2 px-1">
            <CompletedBookings />
          </TabsContent>
        </Fragment>
      )}
    </Tabs>
  );
};

export default Bookings;
