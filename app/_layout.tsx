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
            <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="editProfile" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="productDetail" options={{ headerShown: false }} />

            <Stack.Screen name="buyer/homeBuyer" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/Profile" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/createDemand.tsx" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/historyBuy" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/historyDemand" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/notificationDemand" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/payment" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/paymentSuccess" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/RegisterBuyerScreen" options={{ headerShown: false }} />

            <Stack.Screen name="farmer/homeFarmer" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/farmerProfile" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/createPost" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/historySale" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/notification" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/pickupSuccess" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/verifyPickup" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/RegisterSellerScreen" options={{ headerShown: false }} />
            {/* ... โครงสร้าง Stack อื่นๆ ของคุณ ... */}
        </Stack>
    );
}