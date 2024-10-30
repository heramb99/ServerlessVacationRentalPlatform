import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const POST = async (request) => {
  try {
    const payload = await request.json();
    const response = await axios.post(
      '/auth/register/mfa/caesar-cipher',
      payload,
    );
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
