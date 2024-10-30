'use client';

import { useEffect } from 'react';

import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useUserRoom } from '@/hooks/use-user-room';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { isEmpty } from '@/utils/Helpers';

const roomFiltersSchema = z
  .object({
    checkInDate: z.date({
      required_error: 'Check-in date is required',
    }),
    checkOutDate: z.date({
      required_error: 'Check-out date is required',
    }),
    beds: z
      .number()
      .min(1, 'At least one bed is required')
      .max(8, 'Cannot exceed 8 beds')
      .optional(),
    baths: z
      .number()
      .min(1, 'At least one bath is required')
      .max(8, 'Cannot exceed 8 baths')
      .optional(),
    price: z.number().positive('Price must be a positive number').optional(),
  })
  .refine((schema) => schema.checkOutDate > schema.checkInDate, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOutDate'],
    selectPaths: [['checkInDate'], ['checkOutDate']],
  });

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const defaultFilters = {
  checkInDate: tomorrow,
  checkOutDate: dayAfterTomorrow,
  beds: 1,
  baths: 1,
  price: 150,
};

const RoomFilters = () => {
  const { setLoading, setRooms, filters, setFilters } = useUserRoom();
  const {
    checkInDate = tomorrow,
    checkOutDate = dayAfterTomorrow,
    beds = 1,
    baths = 1,
    price = 100,
  } = isEmpty(filters) ? defaultFilters : filters;

  const form = useForm({
    resolver: zodResolver(roomFiltersSchema),
    defaultValues: {
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      beds: beds,
      baths: baths,
      price: price,
    },
  });

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/rooms?checkInDate=${checkInDate?.toISOString()}&checkOutDate=${checkOutDate?.toISOString()}&beds=${beds}&baths=${baths}&price=${price}`,
      );
      const data = await response.json();
      setRooms(data?.rooms);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    setFilters(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            name="checkInDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check in</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={(date) => field.onChange(date)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="checkOutDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check out</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={(date) => field.onChange(date)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="beds"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beds</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select number of beds" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(8).keys()].map((i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="baths"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baths</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select number of baths" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(8).keys()].map((i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="price"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={1000}
                    step={10}
                  />
                </FormControl>
                <FormDescription>Maximum price: ${field.value}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mt-2"
          >
            View Rooms
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoomFilters;
