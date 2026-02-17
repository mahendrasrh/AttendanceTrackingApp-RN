import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  async (config:any) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('➡️ API REQUEST');
    console.log('URL 👉', `${config.baseURL}${config.url}`);
    console.log('METHOD 👉', config.method?.toUpperCase());

    // 🔒 Mask token in logs
    const safeHeaders = { ...config.headers };
    if (safeHeaders.Authorization) {
      safeHeaders.Authorization = 'Bearer ***';
    }

    console.log('HEADERS 👉', safeHeaders);
    console.log('PAYLOAD 👉', config.data || null);

    return config;
  },
  (error:any) => {
    // console.error('❌ REQUEST ERROR 👉', error);
    return Promise.reject(error);
  }
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response:any) => {
    console.log('✅ API RESPONSE');
    console.log('URL 👉', response.config.url);
    console.log('STATUS 👉', response.status);
    console.log('DATA 👉', response.data);

    return response;
  },
  (error) => {
    // console.error('❌ API RESPONSE ERROR');

    if (error.response) {
      console.log('URL 👉', error.config?.url);
      console.log('STATUS 👉', error.response.status);
      console.log('ERROR DATA 👉', error.response.data);

      if (error.response.status === 401) {
        console.log('🔒 Unauthorized – Token missing or expired');
      }
    } else {
      console.log('ERROR MESSAGE 👉', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
