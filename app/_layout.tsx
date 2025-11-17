// app/_layout.tsx

import React, { useState } from 'react'; 
import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';
// ⚠️ เปลี่ยนมา Import Hook ของ Expo
//import { useExpoPushToken } from '../hooks/useExpoPushToken'; 
//import { useNotificationListener } from '../hooks/useNotificationListener'; 

// Hook จำลอง/เชื่อมต่อ: ใช้สำหรับดึง JWT Token จริง
const useAuth = () => {
    // ... (Logic เดิม)
    const [jwtToken, setJwtToken] = useState('YOUR_ACTUAL_JWT_TOKEN_HERE'); 
    const isLoggedIn = !!jwtToken && jwtToken.length > 10; 
    return { jwtToken, isLoggedIn };
};

export default function RootLayout() {
    const { jwtToken, isLoggedIn } = useAuth(); 

    // 1. เรียกใช้ Hook ดึง/บันทึก EXPO PUSH Token
    // Hook นี้จะส่ง Expo Token ไปยัง Backend
    //const expoPushToken = useExpoPushToken(jwtToken); 

    // 2. เรียกใช้ Hook จัดการ Listener
    // Listener นี้จะใช้ Expo Notifications SDK เพื่อรับการแจ้งเตือน
    //useNotificationListener(); 

    // 💡 หากต้องการให้หน้าแรกแสดงผลตามที่คุณต้องการ:
    // คุณอาจต้องตั้งค่า isLoggedIn ให้เป็น true ชั่วคราว (หรือลบ Conditional Routing ที่ใช้ isLoggedIn ออก)
    
    return (
        <AuthProvider>
        <Stack>
            {/* 🎯 จัด Index เป็นหน้าแรกสุด */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            
            {/* 💡 หน้าที่ต้องการแสดงผล */}
            <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="productDetail" options={{ headerShown: false }} />

            {/* Buyer Routes */}
            <Stack.Screen name="buyer/homeBuyer" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/historyBuy" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/historyDemand" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/notificationDemand" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/payment" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/paymentSuccess" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/RegisterBuyerScreen" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/Profile" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/createDemand" options={{ headerShown: false }} />
            <Stack.Screen name="buyer/paymentMethod" options={{ headerShown: false }} /> 
            
            {/* Farmer Routes */}
            <Stack.Screen name="farmer/homeFarmer" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/createPost" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/historySale" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/notification" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/verifyPickup" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/farmerProfile" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/pickupSuccess" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/RegisterSellerScreen" options={{ headerShown: false }} />

            {/* Shared/Utility Routes */}
            <Stack.Screen name="editProfile" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} /> 
            
        </Stack>
        </AuthProvider>
    );
}