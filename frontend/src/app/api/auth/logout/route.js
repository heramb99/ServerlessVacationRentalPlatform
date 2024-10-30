import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';
import { getSession, removeSession } from '@/lib/session';
import { cookies } from 'next/headers';

export const DELETE = async (request) => {
  try {
    await axios.delete('/auth/logout');
    await removeSession();
    return handleSuccess({ message: 'Logged out successfully' });
  } catch (error) {
    return handleError({ message: error?.response?.data?.message });
  }
};
