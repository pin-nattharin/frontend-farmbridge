import React, { useState } from 'react'; // 1. Import useState
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native'; // 2. Import Alert
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import RoundedInput from '../../components/ui/RoundedInput'; 
import Button from '../../components/ui/Button';
import api from '../../services/api'; // 3. Import api service

// สร้างตัวแปร styles ที่สามารถ export เพื่อให้ LoginScreen ใช้งานได้
export const registerBaseStyles = StyleSheet.create({
    // ... (ส่วน Styles ไม่มีการเปลี่ยนแปลง) ...
    fullScreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backgroundTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%', 
    },
    scrollContainer: {
        paddingTop: 90,
        alignItems: 'center',
    },
    card: {
        width: '90%',
        maxWidth: 450,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 25,
        paddingTop: 40,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
        marginBottom: 50,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 30,
    },
    label: {
      fontSize: 14,
      color: '#4A5568',
      marginBottom: 5,
    },
    uploadContainer: {
      marginBottom: 10,
    },
    uploadText: {
      fontSize: 14,
      color: '#A0AEC0',
      marginLeft: 10,
    },
    registerButton: {
      marginTop: 20,
      marginBottom: 0,
      backgroundColor: '#22AB67', 
      borderColor: '#22AB67',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
    },
    linkText: {
        fontSize: 14,
        color: '#718096', 
    },
});

const RegisterBuyerScreen: React.FC = () => {
  const router = useRouter();

  // 4. เพิ่ม States สำหรับฟอร์มทั้งหมด
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // 5. เปลี่ยน handleRegister ให้เป็น async และเพิ่ม Logic
  const handleRegister = async () => {
    if (loading) return;

    // 6. ตรวจสอบข้อมูล
    if (!fullname || !email || !password) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ, อีเมล และรหัสผ่าน');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      // 7. ยิง API (Backend จะรู้ว่าเป็น Buyer เพราะไม่มี farmer_doc_url)
      const payload = {
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        address: address.trim()
        // ไม่ต้องส่ง farmer_doc_url
      };

      const response = await api.post('/auth/register', payload);

      // 8. สมัครสำเร็จ
      Alert.alert('สำเร็จ!', 'สมัครสมาชิกเรียบร้อยแล้ว, กรุณาเข้าสู่ระบบ');
      router.push('/LoginScreen'); // กลับไปหน้า Login

    } catch (err) {
      // 9. สมัครไม่สำเร็จ
      console.error(err.response ? err.response.data : err);
      // ตรวจสอบว่ามี err.response ก่อนใช้
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัคร';
      Alert.alert('สมัครไม่สำเร็จ', message); // เช่น "Email already exists"
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={registerBaseStyles.fullScreen}>
      <LinearGradient
        colors={['#22AB67', '#074E9F']}
        style={registerBaseStyles.backgroundTop}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView contentContainerStyle={registerBaseStyles.scrollContainer}>
        <View style={registerBaseStyles.card}>
          <Text style={registerBaseStyles.header}>สมัครสมาชิก</Text>

          {/* 10. เชื่อมต่อ State เข้ากับ Input (เพิ่ม value และ onChangeText) */}
          <RoundedInput 
            label="ชื่อ" 
            placeholder="ชื่อ-นามสกุล" 
            value={fullname} 
            onChangeText={setFullname} 
          />
          <RoundedInput 
            label="อีเมล" 
            placeholder="example@mail.com" 
            keyboardType="email-address" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
          />
          <RoundedInput 
            label="เบอร์โทรศัพท์" 
            placeholder="0XXXXXXXXX" 
            keyboardType="phone-pad" 
            value={phone} 
            onChangeText={setPhone} 
          />
          <RoundedInput 
            label="รหัสผ่าน" 
            placeholder="********" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />
          <RoundedInput 
            label="ยืนยันรหัสผ่าน" 
            placeholder="********" 
            secureTextEntry 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
          />
          <RoundedInput 
            label="ที่อยู่" 
            placeholder="เลขที่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด" 
            multiline 
            value={address} 
            onChangeText={setAddress} 
          />
          
          <Button 
            title={loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'} // 11. แสดง Loading
            onPress={handleRegister} 
            variant="default" 
            style={registerBaseStyles.registerButton}
            disabled={loading} // 12. ปิดปุ่มตอนโหลด
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterBuyerScreen;