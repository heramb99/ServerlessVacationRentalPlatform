'use client';

import React, { useEffect, useState } from 'react';

import { z } from 'zod';
import { addDays } from 'date-fns';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the validation schema
const bookingSchema = z.object({
  dateRange: z
    .object({
      from: z.date().nullable(),
      to: z.date().nullable(),
    })
    .refine((data) => data.from && data.to && data.to > data.from, {
      message: 'Check-out date must be after check-in date',
      path: ['to'], // Path to apply the error message to
    }),
  guests: z
    .number()
    .min(1, 'At least one guest is required')
    .max(10, 'Maximum 10 guests allowed'),
});

const RoomBooking = ({ room }) => {
  const { isAuthenticatedUser, session } = useAuth();
  const [disableBtn, setDisableBtn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const defaultStartDate = addDays(new Date(), 1);
  const defaultEndDate = addDays(defaultStartDate, 2);
  const [totalPrice, setTotalPrice] = useState(0);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: {
        from: defaultStartDate,
        to: defaultEndDate,
      },
      guests: 1,
    },
  });

  const { watch, handleSubmit, control, getValues } = form;
  const dateRange = watch('dateRange');

  useEffect(() => {
    const { from, to } = getValues().dateRange || {};
    setTotalPrice(calculateTotalPrice(from, to));
  }, [dateRange, getValues]);

  const onSubmit = async (data) => {
    if (!isAuthenticatedUser()) {
      return router.push('/user/login');
    }
    const payload = {
      checkInDate: data?.dateRange?.from,
      checkOutDate: data?.dateRange?.to,
      roomId: room?.id,
      userId: session?.user?.id,
      guests: data?.guests,
      totalPrice: Number((totalPrice * 1.1).toFixed(2)),
    };

    setDisableBtn(true);
    try {
      const response = await fetch(`/api/user/rooms/${room?.id}/book`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Congratulations 🎉',
          description: data?.message,
        });
        return router.push(`/user/bookings`);
      } else {
        toast({
          title: 'Error',
          description: data?.message,
          variant: 'destructive',
        });
        form.setError('formError', {
          type: 'manual',
          message: data?.message,
        });
      }
    } finally {
      setDisableBtn(false);
    }
  };

  const calculateTotalPrice = (from, to) => {
    if (from && to) {
      const days = (to - from) / (1000 * 60 * 60 * 24);
      return Math.ceil(days) * room?.price_per_day;
    }
    return 0;
  };

  const noOfDays = (range) => {
    const { from, to } = range || {};
    if (from && to) {
      return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  return (
    <Card className="shadow sticky top-6">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>${room?.price_per_day} CAD</CardTitle>
            <CardDescription>per night</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {form.formState.errors.formError && (
              <div className="mb-4 text-sm font-medium text-red-600">
                {form.formState.errors.formError.message}
              </div>
            )}
            <div>
              <FormField
                name="dateRange"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <DatePickerWithRange
                        date={field.value}
                        setDate={field.onChange}
                        calenderProps={{ disabled: [{ before: new Date() }] }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                name="guests"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guests</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select number of guests" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10).keys()].map((i) => (
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
            </div>
            <Button type="submit" disabled={disableBtn}>
              Reserve
            </Button>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium underline">
                ${room?.price_per_day} CAD x{' '}
                {noOfDays(form?.getValues()?.dateRange) || 0} nights
              </span>
              <span>${totalPrice} CAD</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium">Taxes:</span>
              <span>${(totalPrice * 0.1).toFixed(2)} CAD</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-base">
                ${(totalPrice * 1.1).toFixed(2)} CAD
              </span>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
};

export default RoomBooking;
