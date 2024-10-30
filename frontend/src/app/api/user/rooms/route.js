import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const response = await axios.get(`/user/rooms`, {
      params: searchParams,
    });
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
