'use server';

import axios from 'axios';
import { getSession } from './session';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

instance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const authToken = session?.token;
    const session_id = session?.id;
    if (authToken) {
      config.headers['auth-token'] = `${authToken}`;
    }
    if (session_id) {
      config.headers['session-id'] = session_id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { instance as axios };
