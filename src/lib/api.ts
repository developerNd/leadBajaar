import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // This is important for handling cookies/sessions
});

export const login = async (email: string, password: string, remember: boolean) => {
  const response = await api.post('/login', { email, password, remember });
  return response.data;
};

export const register = async (name: string, email: string, password: string, password_confirmation: string) => {
  const response = await api.post('/register', { name, email, password, password_confirmation });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const loginWithGoogle = async (token: string) => {
  const response = await api.post('/login/google', { token });
  return response.data;
};

export default api;

