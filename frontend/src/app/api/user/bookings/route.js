import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const GET = async (request) => {
  try {
    const response = await axios.get(`/user/bookings`);
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
