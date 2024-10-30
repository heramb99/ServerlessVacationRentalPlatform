'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { Step, Stepper } from '@/components/stepper';
import { useRouter, useSearchParams } from 'next/navigation';
import CaesarCipher from '@/app/(pages)/components/register/CaesarCipher';
import SecurityQuestion from '@/app/(pages)/components/register/SecurityQuestion';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';

const MFASetup = ({ role }) => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();
  const [initialStep, setInitialStep] = useState(null);
  const [disableForm, setDisableForm] = useState(false);

  useEffect(() => {
    prepareForm();
  }, []);

  const prepareForm = async () => {
    // check if email is present in the query params
    const email = searchParams.get('email');
    if (!email) {
      router.push(`/`);
    } else {
      const response = await fetch(
        `/api/auth/register/mfa/status?email=${email}`,
        {
          method: 'GET',
        },
      );
      const { mfa_status } = await response.json();
      if (!mfa_status?.mfa_1) {
        setInitialStep(0);
      } else if (!mfa_status?.mfa_2) {
        setInitialStep(1);
      } else {
        router.push(`/${role}/login`);
      }
    }
  };

  const saveSecurityQuestion = async (values) => {
    const payload = {
      email: searchParams.get('email'),
      question: values?.question,
      answer: values?.answer,
    };
    return fetch('/api/auth/register/mfa/security-question', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const saveCaesarCipher = (values) => {
    setDisableForm(true);
    const payload = {
      email: searchParams.get('email'),
      cipher_decryption_key: values?.encryptionKey,
    };
    return fetch('/api/auth/register/mfa/caesar-cipher', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then((res) => {
        return {
          res,
          callback: async () => {
            router.push(`/${role}/login`);
          },
        };
      })
      .finally(() => {
        setDisableForm(false);
      });
  };

  const steps = [
    {
      label: 'MFA #1',
      component: SecurityQuestion,
      onSubmit: saveSecurityQuestion,
    },
    {
      label: 'MFA #2',
      component: CaesarCipher,
      onSubmit: saveCaesarCipher,
    },
  ];

  if (initialStep === null) {
    // Render a loading state while determining the initial step
    return <Loading />;
  }

  return (
    <div className="flex lg:w-1/2 md:w-3/4 py-5 mx-auto flex-col gap-4 sm:w-full">
      <h1 className="text-xl text-center mb-2 font-bold text-gray-800 dark:text-white">
        Configure Multi-Factor Authentication
      </h1>
      <Stepper initialStep={initialStep} steps={steps}>
        {steps.map((stepProps, index) => {
          const { component: Component, onSubmit } = stepProps;
          return (
            <Step key={stepProps.label} {...stepProps}>
              <div className=" flex items-center justify-center">
                <Component onSubmit={onSubmit} disableForm={disableForm} />
              </div>
            </Step>
          );
        })}
      </Stepper>
    </div>
  );
};

export default MFASetup;
