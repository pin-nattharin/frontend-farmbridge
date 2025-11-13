import { LinearGradient } from 'expo-linear-gradient'; // สำหรับพื้นหลังไล่ระดับ
import { useRouter } from 'expo-router'; // สำหรับการนำทาง
import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import Button from '../components/ui/Button';
import RoundedInput from '../components/ui/RoundedInput';
import { registerBaseStyles } from './farmer/RegisterSellerScreen';
import api from '../services/api';

const LoginScreen: React.FC = () => {
  const router = useRouter(); // เรียกใช้ Router

  // 4. เพิ่ม States สำหรับเก็บข้อมูล
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
    
  const handleLogin = async () => { // <-- 4. เปลี่ยนเป็น async
    if (loading) return;
    if (!email || !password) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      // 5. ยิง API (Backend ของคุณ auto-detect role)
      const response = await api.post('/api/auth/login', { 
        email: email.toLowerCase(), 
        password: password 
      });

      // 6. Login สำเร็จ (ได้ token)
      const { token, user } = response.data;
      
      // 7. เก็บ Token ลงในเครื่อง
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // 8. นำทางไปหน้าหลัก (เช่น Dashboard)
      Alert.alert('สำเร็จ', 'เข้าสู่ระบบเรียบร้อย');
      // *** เปลี่ยน '/(tabs)/dashboard' ไปยัง Path ที่ถูกต้องของคุณ ***
      router.replace('/home'); 

    } catch (err) {
      // 9. Login ไม่สำเร็จ
      console.error(err.response ? err.response.data : err);
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาด';
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNavigation = () => {
    // นำทางไปยังไฟล์ app/Register.tsx
    router.push('/buyer/RegisterBuyerScreen');
  //router.push('/RegisterBuyerScreen');
  };

  return (
    <View style={loginStyles.fullScreen}>
      {/* ใช้ LinearGradient สำหรับพื้นหลังไล่ระดับสี */}
      <LinearGradient
        colors={['#074E9F', '#22AB67']} // สีฟ้า -> เขียว
        style={loginStyles.backgroundTop}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={loginStyles.content}>
        <Text style={loginStyles.header}>เข้าสู่ระบบ</Text>
        <View style={loginStyles.card}>
          
          {/* 1. เชื่อมต่อ State เข้ากับ Input */}
          <RoundedInput 
            label="อีเมล" 
            placeholder="example@email.com" 
            keyboardType="email-address" 
            value={email} 
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <RoundedInput 
            label="รหัสผ่าน" 
            placeholder="********" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
          />
          <Button 
            title={loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'} // <-- 1. เปลี่ยน title
            onPress={handleLogin} 
            variant="default"
            style={loginStyles.loginButton}
            disabled={loading} // <-- 2. เพิ่ม disabled
          />
          
          <View style={loginStyles.linkContainer}>
            <Text style={loginStyles.linkText}>ยังไม่มีบัญชีผู้ใช้ ? </Text>
            <Button 
              title="สมัครสมาชิก" 
              onPress={handleRegisterNavigation} // เรียกใช้ฟังก์ชันนำทาง
              variant="ghost" 
              style={loginStyles.registerLinkButton}
              textStyle={loginStyles.registerLinkText}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const loginStyles = StyleSheet.create({
  ...registerBaseStyles, 

  // --- Override Styles สำหรับ Login ---
  
  backgroundTop: {
      ...registerBaseStyles.backgroundTop,
      // ไม่ต้องใส่ backgroundColor/opacity เพราะ LinearGradient จัดการแทน
  },
  content: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 80, 
  },
  header: {
    ...registerBaseStyles.header,
    color: '#FFFFFF', 
    fontSize: 30, 
    marginBottom: 20,
  },
  card: {
      ...registerBaseStyles.card,
      marginBottom: 0, 
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#22AB67', 
    borderColor: '#22AB67',
  },
  registerLinkButton: {
      paddingVertical: 0,
      marginVertical: 0,
      paddingHorizontal: 5,
  },
  registerLinkText: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#22AB67', 
  }
});

export default LoginScreen;