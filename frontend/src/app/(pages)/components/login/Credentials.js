'use client';

import { z } from 'zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[\W_]/, 'Password must contain at least one special character'),
});

const Credentials = ({ role }) => {
  const { toast } = useToast();
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [disableForm, setDisableForm] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const loginUser = async (values) => {
    setDisableForm(true);
    const payload = {
      email: values.email,
      password: values.password,
      role: role,
    };
    fetch(`/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      ?.then(async (res) => {
        const data = await res?.json();
        if (res.ok) {
          toast({
            title: 'Success',
            description: data?.message,
          });
          refreshSession();
          router.push(data.redirectUrl);
        } else {
          form.setError('formError', {
            message: data?.message,
          });
        }
      })
      ?.finally(() => {
        setDisableForm(false);
      });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mt-7 border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              {role == 'user' ? 'User' : 'Agent'} Login
            </h1>
          </div>
          <div className="mt-5">
            <Form {...form}>
              <form onSubmit={form?.handleSubmit(loginUser)}>
                {form?.formState?.errors?.formError && (
                  <div className="mb-4 text-sm font-medium text-red-600">
                    {form.formState.errors.formError.message}
                  </div>
                )}
                <div className="grid gap-y-4">
                  <FormField
                    control={form?.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="mt-2"
                            placeholder="Enter email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form?.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            className="mt-2"
                            placeholder="Enter password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={disableForm}>
                    Login
                  </Button>
                </div>
              </form>
            </Form>
            <p className="mt-3 text-sm">
              {`Don't have an account?`}{' '}
              <Link className="underline" href={`/${role}/register`}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credentials;
