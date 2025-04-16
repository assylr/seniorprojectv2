import { api } from './api'

export type AuthForm = {
  email: string;
  password: string;
  fullName?: string;
};

export const login = async (email: string, password: string): Promise<string> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.token;
};

export const register = async (form: AuthForm): Promise<string> => {
  const response = await api.post('/auth/register', {
    email: form.email,
    password: form.password,
    role: 'USER', // hardcoded for now
  });

  return response.data.token;
};
