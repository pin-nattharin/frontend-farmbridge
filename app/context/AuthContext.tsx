import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

// (สมมติว่าคุณมีไฟล์ config)
// import { API_URL } from '../utils/apiConfig'; 

// 1. สร้าง Type (Interface) สำหรับข้อมูลที่จะเก็บใน Context
interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. สร้าง Context ขึ้นมา
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. สร้าง "กุญแจ" (Hook) ที่เราจะใช้ในไฟล์อื่น
// นี่คือตัวเดียวกับ 'useAuth' ที่คุณถามถึงครับ
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 4. สร้าง "กล่อง" (Provider) ที่จะหุ้มแอปทั้งแอป
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- ส่วนจัดการการ Redirect (ไม่บังคับ แต่แนะนำ) ---
  const segments = useSegments(); // ดูว่าอยู่หน้าไหน
  const router = useRouter(); // ใช้สำหรับสั่งย้ายหน้า

  // 5. โหลด Token จาก Storage เมื่อแอปเปิดครั้งแรก
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken'); // ดึง Token ที่เคยเก็บไว้
        if (storedToken) {
          setToken(storedToken);
          
          // (ถ้าคุณมี API สำหรับดึงข้อมูล user ก็ควรยิงตรงนี้)
          // เช่น api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error("Failed to load token", e);
      } finally {
        setIsLoading(false); // โหลดเสร็จแล้ว
      }
    };
    loadToken();
  }, []);

  // --- ส่วนจัดการการ Redirect (ต่อ) ---
  // คอยเช็คว่าถ้า Token เปลี่ยน (เช่น login/logout) หรือโหลดเสร็จแล้ว
  // จะต้องเด้งไปหน้าไหนหรือไม่
  useEffect(() => {
    if (isLoading) return; // ยังโหลดไม่เสร็จ ไม่ต้องทำอะไร

    // เช็คว่ากำลังอยู่ในกลุ่มหน้า (auth) หรือไม่ (เช่น Login, Register)
    const inAuthPage = segments[0] === 'LoginScreen'; // (ต้องสร้าง group (auth) ใน app)
    // หรือเช็คชื่อหน้าตรงๆ
    // const inLoginPage = segments.includes('LoginScreen'); 

    if (!token && !inAuthPage) {
      // --- 1. ยังไม่ล็อกอิน และไม่ได้อยู่ในหน้า Login/Register ---
      // ให้เด้งไปหน้า login
      router.replace('../LoginScreen'); // (แก้ path นี้ให้ถูก)
    } else if (token && inAuthPage) {
      // --- 2. ล็อกอินแล้ว แต่เผลอไปหน้า Login/Register ---
      // ให้เด้งไปหน้า home
      router.replace('../buyer/homeBuyer'); // (แก้ path นี้ให้ถูก)
    }
  }, [token, isLoading, segments, router]);

  // 6. ฟังก์ชัน Login
  const login = async (newToken: string) => {
    try {
      await AsyncStorage.setItem('userToken', newToken); // เก็บ Token ลงเครื่อง
      setToken(newToken); // อัปเดต Token ใน state
      
      // (ถ้าคุณใช้ axios)
      // api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // เมื่อ login สำเร็จ ให้เด้งไปหน้า Home
      router.replace('../buyer/homeBuyer'); // (แก้ path นี้ให้ถูก)
    } catch (e) {
      console.error("Failed to save token", e);
    }
  };

  // 7. ฟังก์ชัน Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // ลบ Token ออกจากเครื่อง
      setToken(null); // อัปเดต Token ใน state
      
      // (ถ้าคุณใช้ axios)
      // delete api.defaults.headers.common['Authorization'];

      // เมื่อ logout ให้เด้งไปหน้า Login
      router.replace('/LoginScreen'); // (แก้ path นี้ให้ถูก)
    } catch (e) {
      console.error("Failed to remove token", e);
    }
  };

  // 8. ส่งค่าทั้งหมด (token, login, logout) ให้ Children (ทั้งแอป)
  const value = {
    token,
    isLoading,
    login,
    logout,
  };

  // ถ้ายังโหลด Token ไม่เสร็จ อาจจะแสดงหน้า Loading
  // if (isLoading) {
  //   return <ActivityIndicator size="large" />; 
  // }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};