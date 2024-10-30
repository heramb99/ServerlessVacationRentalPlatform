import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Ratings } from '@/components/ui/ratings';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useBookings } from '@/hooks/use-bookings';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const reviewFormSchema = z.object({
  comment: z.string().min(10, 'Comment must be at least 10 characters long'),
  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating is required',
    })
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

const ReviewForm = ({ booking }) => {
  const { toast } = useToast();
  const { fetchBookings } = useBookings();
  const [disableForm, setDisableForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      comment: '',
      rating: '',
    },
  });

  useEffect(() => {
    return () => {
      form.reset({
        comment: '',
        rating: '',
      });
    };
  }, []);

  const handleFeedback = async (formValues) => {
    setDisableForm(true);
    try {
      const response = await fetch(
        `/api/user/bookings/${booking?.id}/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        form.setError('formError', {
          message: data?.message,
        });
      } else {
        toast({
          title: 'Success',
          description: data?.message,
        });
        setIsDialogOpen(false);
        await fetchBookings();
      }
    } finally {
      setDisableForm(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Feedback</Button>
      </DialogTrigger>
      <DialogContent className="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFeedback)}>
            <DialogHeader>
              <DialogTitle>How was your experience with us?</DialogTitle>
              <DialogDescription>Provide your feedback</DialogDescription>
            </DialogHeader>
            {form?.formState?.errors?.formError && (
              <div className="my-4 text-sm font-medium text-red-600">
                {form.formState.errors.formError.message}
              </div>
            )}
            <div className="grid gap-4 mt-5">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate your experience</FormLabel>
                    <FormControl>
                      <Ratings
                        rating={field.value}
                        onChange={(rating) => field.onChange(rating)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Write a Comment</FormLabel>
                    <FormControl>
                      <Textarea placeholder={'Enter here...'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className={'mt-5'}>
              <Button type="submit" disabled={disableForm}>
                Provide Feedback
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
