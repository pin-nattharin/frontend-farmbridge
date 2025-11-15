// app/_layout.tsx

import React from 'react'; 
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

// 1. นำเข้า AuthProvider (กล่อง) และ useAuth (กุญแจ) ตัวจริง
// (*** กรุณาตรวจสอบ Path ไปยัง AuthContext.tsx ให้ถูกต้อง ***)
import { AuthProvider, useAuth } from './context/AuthContext'; 

// 2. นำเข้า Hooks สำหรับ Notification (เอา comment ออก)
/* import { useFcmToken } from '../hooks/useFcmToken'; 
import { useNotificationListener } from '../hooks/useNotificationListener';  */

/**
 * สร้าง Component ภายใน เพื่อให้เราสามารถเรียกใช้ useAuth() 
 * (ที่อยู่ "ภายใน" AuthProvider) ได้อย่างปลอดภัย
 */
function RootLayoutNav() {
  
  // 3. ดึง token และสถานะ loading จาก Context ตัวจริง
  const { token, isLoading } = useAuth(); 

  // 4. เรียกใช้ Hook ดึง/บันทึก FCM Token (ส่ง token จริงเข้าไป)
  // Hook นี้จะทำงานเมื่อ token พร้อมใช้งาน (ไม่ใช่ null)
  //useFcmToken(token); 

  // 5. เรียกใช้ Hook จัดการ Listener (ทำงานได้เลย)
  //useNotificationListener(); 

  // 6. (แนะนำ) ถ้ายังโหลด Token จาก Storage ไม่เสร็จ ให้แสดงหน้า Loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 7. คืนค่า Stack Navigator หลักของแอป
  // (AuthProvider จะจัดการ Redirect ไปหน้า Login หรือ Home ให้อัตโนมัติ)
  return (
      <Stack>
          {/* เราต้องกำหนด "กลุ่ม" ของหน้าหลักๆ ที่นี่
            เพื่อให้ AuthProvider รู้จักและ Redirect ได้ถูก
          */}
          
          {/* กลุ่มสำหรับหน้า Login, Register */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} /> 
          
          {/* กลุ่มสำหรับ Buyer (เมื่อล็อกอินแล้ว) */}
          <Stack.Screen name="(buyer)" options={{ headerShown: false }} /> 
          
          {/* (ถ้ามีกลุ่มสำหรับ Farmer ก็เพิ่มตรงนี้) */}
          {/* <Stack.Screen name="(farmer)" options={{ headerShown: false }} /> */}

          {/* (ถ้าคุณไม่ได้ใช้กลุ่ม ให้ระบุชื่อหน้าตรงๆ) */}
          {/* <Stack.Screen name="LoginScreen" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="homeBuyer" options={{ headerShown: false }} /> */}
      </Stack>
  );
}

// 8. Layout หลัก จะหุ้มทุกอย่างด้วย AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}