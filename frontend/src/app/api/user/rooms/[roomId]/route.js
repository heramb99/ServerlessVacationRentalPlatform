import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const GET = async (request, { params }) => {
  try {
    const response = await axios.get(`/user/rooms/${params?.roomId}`);
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
