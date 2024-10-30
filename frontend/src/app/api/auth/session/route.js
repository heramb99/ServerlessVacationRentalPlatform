import { handleSuccess } from '@/lib/response';
import { getSession } from '@/lib/session';

export const GET = async (request) => {
  try {
    const session = await getSession();
    return handleSuccess({ session });
  } catch (error) {
    return handleError({ message: 'Error occurred in session' });
  }
};
