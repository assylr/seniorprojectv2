import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://spring-backend-latest.onrender.com/api',
});
