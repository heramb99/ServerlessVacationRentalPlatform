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
import { words } from '@/utils/caeser-words';

const formSchema = z.object({
  plainText: z.string(),
  cipherText: z.string(),
});

const CaesarCipher = ({ onSubmit, disableForm = false }) => {
  const generateRandomWord = () => {
    return words[Math.floor(Math.random() * words.length)];
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plainText: generateRandomWord(),
      cipherText: '',
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
                {form?.formState?.errors?.formError && (
                  <div className="mb-4 text-sm text-red-600">
                    {form.formState.errors.formError.message}
                  </div>
                )}
                <div className="grid gap-y-6">
                  <FormField
                    control={form.control}
                    name="plainText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plain Text</FormLabel>
                        <FormControl>
                          <Input
                            className="mt-2"
                            type="text"
                            disabled={true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cipherText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cipher Text</FormLabel>
                        <FormControl>
                          <Input
                            className="mt-2"
                            type="text"
                            placeholder="Enter encrypted text"
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
                    Verify
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
