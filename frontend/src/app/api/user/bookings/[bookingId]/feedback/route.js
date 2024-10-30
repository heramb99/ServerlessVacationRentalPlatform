import { axios } from '@/lib/axios';
import { handleError, handleSuccess } from '@/lib/response';

export const POST = async (request, { params }) => {
  try {
    const payload = await request.json();
    const response = await axios.post(
      `/user/bookings/${params.bookingId}/feedback`,
      payload,
    );
    return handleSuccess({ ...response?.data });
  } catch (error) {
    return handleError({ ...error?.response?.data });
  }
};
