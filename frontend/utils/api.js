import axios from 'axios';
import { BASE_URL as ENV_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || ENV_BASE_URL || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.warn('API base URL is missing. Set BASE_URL or EXPO_PUBLIC_API_URL to your Render backend URL.');
}

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export { API_BASE_URL };
export default API;
