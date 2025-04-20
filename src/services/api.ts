import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://spring-backend-latest.onrender.com/api',
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
