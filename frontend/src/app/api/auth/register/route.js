import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const POST = async (request) => {
  try {
    const payload = await request.json();
    const { role, email } = payload;
    const response = await axios.post('/auth/register', payload);
    let redirectUrl = '/';
    if (response?.data?.redirect_to_verification) {
      redirectUrl = `/${role}/register/verify?email=${email}`;
    }
    return handleSuccess({ ...response?.data, redirectUrl });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
