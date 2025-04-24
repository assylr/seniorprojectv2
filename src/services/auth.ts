// src/services/auth.ts
import { apiClient } from './api'

const AUTH_TOKEN_KEY = 'authToken'
export const USER_DATA_KEY = "user";

interface LoginResponse {
  token: string
  email: string
  role: 'ADMIN' | 'USER'
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', { email, password })
  const { token, email: responseEmail, role } = response.data;

  const user = { email: responseEmail, role };

  // Store to localStorage
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))

  // Apply token to axios for future requests
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

  return token
}

export const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete apiClient.defaults.headers.common['Authorization'];
    window.location.href = "/login";
  };
  

export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const getCurrentUser = (): User | null => {
    try {
        const user = localStorage.getItem(USER_DATA_KEY);
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error("Failed to parse user data", error);
        return null;
    }
  };
  

export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getCurrentUser()
}

export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.role === 'ADMIN'
}

export type AuthForm = {
  email: string
  password: string
  fullName?: string
}

export const register = async (form: AuthForm): Promise<string> => {
  const response = await apiClient.post<LoginResponse>('/auth/register', {
    email: form.email,
    password: form.password,
    role: 'USER', // or allow user to select role
  })

  const { token, user } = response.data

  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

  return token
}
