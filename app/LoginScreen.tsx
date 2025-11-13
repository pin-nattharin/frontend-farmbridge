import { LinearGradient } from 'expo-linear-gradient'; // สำหรับพื้นหลังไล่ระดับ
import { useRouter } from 'expo-router'; // สำหรับการนำทาง
import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import Button from '../components/ui/Button';
import RoundedInput from '../components/ui/RoundedInput';
import { registerBaseStyles } from './farmer/RegisterSellerScreen'; // Import Styles จาก RegisterScreen

const LoginScreen: React.FC = () => {
  const router = useRouter(); // เรียกใช้ Router

  // 4. เพิ่ม States สำหรับเก็บข้อมูล
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
    
  const handleLogin = () => {
    console.log('Login pressed');
  };

  const handleRegisterNavigation = () => {
    // นำทางไปยังไฟล์ app/Register.tsx
    router.push('../RegisterSellerScreen');
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
          
          <RoundedInput label="อีเมล" placeholder="example@mail.com" keyboardType="email-address" />
          <RoundedInput label="รหัสผ่าน" placeholder="********" secureTextEntry />

          <Button 
            title="เข้าสู่ระบบ" 
            onPress={handleLogin} 
            variant="default"
            style={loginStyles.loginButton}
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