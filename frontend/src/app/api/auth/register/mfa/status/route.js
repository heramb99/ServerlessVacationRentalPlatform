import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const GET = async (request) => {
  try {
    const queryParams = request.nextUrl.searchParams;
    const response = await axios.get('/auth/register/mfa/status', {
      params: queryParams,
    });
    return handleSuccess({
      message: response?.data?.message,
      mfa_status: response?.data?.mfa_status,
    });
  } catch (error) {
    return handleError({ message: error?.response?.data?.message });
  }
};
