'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';

const Index = () => {
  const { logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    logoutUser();
  }, []);

  const logoutUser = async () => {
    await logout();
    router.push('/');
  };

  return <Loading placeHolder={'Logging out....'} />;
};

export default Index;
