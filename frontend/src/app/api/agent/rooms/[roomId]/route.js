import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const PUT = async (request, { params }) => {
  try {
    const payload = await request?.json();
    const response = await axios.put(`/agent/rooms/${params?.roomId}`, payload);
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const response = await axios.delete(`/agent/rooms/${params?.roomId}`);
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
