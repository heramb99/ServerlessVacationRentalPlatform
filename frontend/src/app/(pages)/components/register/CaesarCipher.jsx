import React from 'react';

import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  encryptionKey: z
    .union([z.string(), z.number()])
    .transform((value) =>
      typeof value === 'string' ? parseInt(value, 10) : value,
    )
    .refine((value) => !isNaN(value), {
      message: 'Decryption key must be a number',
    })
    .refine((value) => value >= 1 && value <= 25, {
      message: 'Decryption key must be between 1 and 25 (inclusive)',
    }),
});

const CaesarCipher = ({ onSubmit, disableForm = false }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      encryptionKey: '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (values) => {
    const res = await onSubmit(values);
    const data = await res?.res?.json();
    if (!res?.res?.ok) {
      form.setError('formError', {
        message: data?.message,
      });
      return;
    }
    await res?.callback();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mt-7 border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              Caesar Cipher
            </h1>
          </div>

          <div className="mt-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <div className="grid gap-y-6">
                  <FormField
                    control={form.control}
                    name="encryptionKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Enter Decryption key for Caesar Cipher
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="mt-2"
                            type="number"
                            placeholder="Encryption key"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || disableForm}
                  >
                    Save Key & Login
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaesarCipher;
