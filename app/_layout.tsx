// app/_layout.tsx

import React, { useState } from 'react'; 
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFcmToken } from '../hooks/useFcmToken'; 
import { useNotificationListener } from '../hooks/useNotificationListener'; 

// Hook จำลอง/เชื่อมต่อ: ใช้สำหรับดึง JWT Token จริงจาก Global State/Context
const useAuth = () => {
    // ⚠️ ต้องแทนที่ 'YOUR_ACTUAL_JWT_TOKEN_HERE' ด้วย Logic ดึง Token ที่ถูกต้อง
    const [jwtToken, setJwtToken] = useState('YOUR_ACTUAL_JWT_TOKEN_HERE'); 
    
    // ตรวจสอบสถานะล็อกอิน
    const isLoggedIn = !!jwtToken && jwtToken.length > 10; 
      return { jwtToken, isLoggedIn };
};

export default function RootLayout() {
    // ดึง JWT Token ที่จำเป็นในการยืนยันตัวตนกับ Backend
    const { jwtToken, isLoggedIn } = useAuth(); 

    // 1. เรียกใช้ Hook ดึง/บันทึก FCM Token
    const fcmToken = useFcmToken(jwtToken); 

    // 2. เรียกใช้ Hook จัดการ Listener
    useNotificationListener(); 
 return (
        <Stack>
            {/* โครงสร้าง Router หลักของแอปฯ */}
            <Stack.Screen name="home" options={{ headerShown: false }} />
            {/* ... โครงสร้าง Stack อื่นๆ ของคุณ ... */}
        </Stack>
    );
}