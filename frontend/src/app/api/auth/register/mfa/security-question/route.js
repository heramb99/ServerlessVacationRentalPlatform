import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const POST = async (request) => {
  try {
    const payload = await request.json();
    const response = await axios.post(
      '/auth/register/mfa/security-question',
      payload,
    );
    return handleSuccess({ message: response.data?.message });
  } catch (error) {
    return handleError({ message: error?.response?.data?.message });
  }
};
