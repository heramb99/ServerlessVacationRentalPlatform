import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const GET = async (request) => {
  try {
    const response = await axios.get('/agent/rooms');
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};

export const POST = async (request) => {
  try {
    const payload = await request?.json();
    const response = await axios.post('/agent/rooms', payload);
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
