import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStepper } from '@/components/stepper';
import { zodResolver } from '@hookform/resolvers/zod';
import { SECURITY_QUESTIONS } from '@/utils/constants';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  question: z.enum(
    SECURITY_QUESTIONS.map((question) => question.value),
    {
      message: 'Please select a security question',
    },
  ),
  answer: z.string().min(2, 'Answer should be at least 2 characters long'),
});

const SecurityQuestion = ({ onSubmit, question, disableForm = false }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: question,
      answer: '',
    },
    mode: 'onChange',
  });
  const { nextStep } = useStepper();

  const handleFormSubmit = async (values) => {
    const res = await onSubmit(values);
    if (res?.ok) {
      nextStep();
    } else {
      const data = await res.json();
      form.setError('formError', {
        message: data?.message,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mt-7 border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              Security Question
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
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            className="w-full"
                            disabled={true}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a question" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Security Questions</SelectLabel>
                                {SECURITY_QUESTIONS?.map((question, index) => (
                                  <SelectItem
                                    key={`security-question-${index}`}
                                    value={question.value}
                                  >
                                    {question.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Security Answer"
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
                    Submit Answer
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

export default SecurityQuestion;
