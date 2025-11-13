import axios from 'axios';

// !!! เปลี่ยน IP และ Port ให้ตรงกับเครื่องคุณ !!!
const API_BASE_URL = 'http://192.168.0.102:3000'; // <-- ตัวอย่างสำหรับมือถือจริง
// const API_BASE_URL = 'http://localhost:8081'; // <-- ตัวอย่างสำหรับ Emulator

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


//หมายเหตุสำคัญ (Localhost):

/* ถ้าทดสอบบน iOS Simulator หรือ Android Emulator 
ให้ใช้: http://localhost:8080 (หรือ Port ที่คุณรัน Backend)

ถ้าทดสอบบน มือถือจริง (Expo Go) localhost จะใช้ไม่ได้! 
คุณต้องใช้ IP Address ของคอมพิวเตอร์คุณ (เช่น http://192.168.1.10:8080) */