// app/_layout.tsx

import React, { useState } from 'react'; 
import { Stack } from 'expo-router';
// ⚠️ เปลี่ยนมา Import Hook ของ Expo
import { useExpoPushToken } from '../hooks/useExpoPushToken'; 
import { useNotificationListener } from '../hooks/useNotificationListener'; 

// Hook จำลอง/เชื่อมต่อ: ใช้สำหรับดึง JWT Token จริงจาก Global State/Context
const useAuth = () => {
    // ⚠️ ในโค้ดจริง คุณต้องดึง JWT Token ที่ถูกต้องจากระบบ Authentication ของคุณ
    const [jwtToken, setJwtToken] = useState('YOUR_ACTUAL_JWT_TOKEN_HERE'); 
    
    // ตรวจสอบสถานะล็อกอิน
    const isLoggedIn = !!jwtToken && jwtToken.length > 10; 

    return { jwtToken, isLoggedIn };
};

export default function RootLayout() {
    // ดึง JWT Token ที่จำเป็นในการยืนยันตัวตนกับ Backend
    const { jwtToken, isLoggedIn } = useAuth(); 

    // 1. เรียกใช้ Hook ดึง/บันทึก EXPO PUSH Token
    // Hook นี้จะส่ง Expo Token ไปยัง Backend
    const expoPushToken = useExpoPushToken(jwtToken); 

    // 2. เรียกใช้ Hook จัดการ Listener
    // Listener นี้จะใช้ Expo Notifications SDK เพื่อรับการแจ้งเตือน
    useNotificationListener(); 

    return (
        <Stack>
            {/* โครงสร้าง Router หลักของแอปฯ */}
            <Stack.Screen name="buyer/homeBuyer" options={{ headerShown: false }} />
            {/* ... โครงสร้าง Stack อื่นๆ ของคุณ ... */}
        </Stack>
    );
}