import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* 🔐 Attach token automatically */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API REQUEST 👉', config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

/* ❌ Global error logging */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API ERROR 👉',
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
