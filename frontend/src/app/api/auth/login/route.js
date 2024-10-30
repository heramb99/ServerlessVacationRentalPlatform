import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';
import { createSession } from '@/lib/session';

export const POST = async (request) => {
  try {
    const payload = await request.json();
    const { email, role } = payload;
    const res = await axios.post('/auth/login', payload);
    const data = res?.data;
    let defaultSession = {
      user: {},
      role: 'guest',
    };
    let redirectUrl;
    let session = data?.session;
    if (data?.redirect_to_verification) {
      session = defaultSession;
      redirectUrl = `/${role}/register/verify?email=${email}`;
    } else if (!session?.mfa_1?.configured || !session?.mfa_2?.configured) {
      session = defaultSession;
      redirectUrl = `/${role}/register/mfa-setup?email=${email}`;
    } else {
      redirectUrl = `/${role}/login/mfa-verify`;
    }

    await createSession(session);
    return handleSuccess({ ...data, redirectUrl });
  } catch (err) {
    return handleError({ ...err?.response?.data });
  }
};
