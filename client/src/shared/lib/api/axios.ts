import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAuthLogic = async (): Promise<void> => {
  await api.post('auth/refresh');
  return Promise.resolve();
};

createAuthRefreshInterceptor(api, refreshAuthLogic);