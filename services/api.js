import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !!! เปลี่ยน IP และ Port ให้ตรงกับเครื่องคุณ !!!
//const API_BASE_URL = 'http://192.168.0.102:3000'; // <-- ตัวอย่างสำหรับมือถือจริง
const API_BASE_URL = 'http://10.0.2.2:3000/api'; // <-- ตัวอย่างสำหรับ android Emulator
//const API_BASE_URL = 'http://localhost:3000'; // <-- ตัวอย่างสำหรับ Emulator

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// เพิ่ม token ทุกครั้งที่เรียก API
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;


//หมายเหตุสำคัญ (Localhost):

/* ถ้าทดสอบบน iOS Simulator หรือ Android Emulator 
ให้ใช้: http://localhost:8080 (หรือ Port ที่คุณรัน Backend)

ถ้าทดสอบบน มือถือจริง (Expo Go) localhost จะใช้ไม่ได้! 
คุณต้องใช้ IP Address ของคอมพิวเตอร์คุณ (เช่น http://192.168.1.10:8080) */