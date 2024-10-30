import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';
import { createSession } from '@/lib/session';

export const POST = async (request) => {
  try {
    const payload = await request.json();
    const response = await axios.post(
      '/auth/login/mfa/security-question',
      payload,
    );
    await createSession(response?.data?.session);

    return handleSuccess({ message: response?.data?.message });
  } catch (err) {
    return handleError({ message: err?.response?.data?.message });
  }
};
