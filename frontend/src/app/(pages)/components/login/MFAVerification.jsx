'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';
import { Step, Stepper } from '@/components/stepper';

import CaesarCipher from './CaesarCipher';
import SecurityQuestion from './SecurityQuestion';

const MFAVerification = ({ role }) => {
  const { session, refreshSession } = useAuth();
  const router = useRouter();
  const [initialStep, setInitialStep] = useState(null);
  const [disableForm, setDisableForm] = useState(false);
  const { user = {}, mfa_1 = {}, mfa_2 = {}, id = '' } = session || {};

  useEffect(() => {
    prepareForm();
  }, [session]);

  const prepareForm = async () => {
    const email = user?.email;
    if (!email) {
      router.push(`/`);
    } else {
      if (!mfa_1.verified) {
        setInitialStep(0);
      } else if (!mfa_2.verified) {
        setInitialStep(1);
      } else {
        router.push(`/rooms`);
      }
    }
  };

  const verifySecurityQuestion = async (values) => {
    setDisableForm(true);
    const payload = {
      email: session?.user?.email,
      answer: values?.answer,
      session_id: id,
    };
    return fetch('/api/auth/login/mfa/security-question', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      ?.then((res) => {
        return res;
      })
      ?.finally(() => {
        setDisableForm(false);
      });
  };

  const verifyCaesarCipher = (values) => {
    setDisableForm(true);
    const payload = {
      email: session?.user?.email,
      session_id: id,
      plain_text: values?.plainText,
      cipher_text: values?.cipherText,
    };
    return fetch('/api/auth/login/mfa/caesar-cipher', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        return {
          res,
          callback: async () => {
            await refreshSession();
            return setTimeout(() => {
              router.push(`${role === 'user' ? '/rooms' : '/agent/dashboard'}`);
            }, 1);
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
      onSubmit: verifySecurityQuestion,
      props: {
        question: mfa_1?.question,
      },
    },
    {
      label: 'MFA #2',
      component: CaesarCipher,
      onSubmit: verifyCaesarCipher,
    },
  ];

  if (initialStep === null) {
    return <Loading />;
  }

  return (
    <div className="flex lg:w-1/2 md:w-3/4 py-5 mx-auto flex-col gap-4 sm:w-full">
      <h1 className="text-xl text-center mb-2 font-bold text-gray-800 dark:text-white">
        Verify Multi-Factor Authentication
      </h1>
      <Stepper initialStep={initialStep} steps={steps}>
        {steps.map((stepProps, index) => {
          const { component: Component, onSubmit, props = {} } = stepProps;
          return (
            <Step key={stepProps.label} {...stepProps}>
              <div className=" flex items-center justify-center">
                <Component
                  onSubmit={onSubmit}
                  disableForm={disableForm}
                  {...props}
                />
              </div>
            </Step>
          );
        })}
      </Stepper>
    </div>
  );
};

export default MFAVerification;
