import axios from 'axios';

// Configurable via CRA env var: REACT_APP_API_BASE_URL
export const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export const http = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/json'
  },
  timeout: 10000,
  withCredentials: false,
});

// Optional: basic response error pass-through
http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
