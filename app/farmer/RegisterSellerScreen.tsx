// 🟢 แก้ไขไฟล์: RegisterSellerScreen.tsx

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  TouchableOpacity, 
  Alert // 🟢 1. Import Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker'; 
import { useRouter } from 'expo-router'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import RoundedInput from '../../components/ui/RoundedInput'; 
import Button from '../../components/ui/Button'; 
import api from '../../services/api'; // 🟢 2. Import API client ที่เราสร้าง

// (ส่วนของ styles ไม่มีการเปลี่ยนแปลง)
// (export registerBaseStyles... ทั้งหมดเหมือนเดิม)
export const registerBaseStyles = StyleSheet.create({
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
        paddingTop: 50,
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
    uploadBox: {
      height: 120,
      borderWidth: 1,
      borderColor: '#A0AEC0',
      borderStyle: 'dashed',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadText: {
      fontSize: 14,
      color: '#A0AEC0',
      marginTop: 5, 
    },
    fileNameText: {
        fontSize: 14,
        color: '#2D3748',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 10,
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


const RegisterSellerScreen: React.FC = () => {
  const router = useRouter();
  
  // 🟢 3. เพิ่ม State สำหรับเก็บข้อมูลใน Form
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false); // (State กันการกดปุ่มซ้ำ)

  
  // 🟢 4. แก้ไขฟังก์ชัน handleRegister (ส่วนนี้คือหัวใจหลัก)
  const handleRegister = async () => {
    if (isLoading) return; // กันการกดซ้ำ

    // --- ตรวจสอบข้อมูลเบื้องต้น ---
    if (!fullname || !email || !password) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อ, อีเมล และรหัสผ่าน');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (!selectedFile) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาอัปโหลดเอกสารเกษตรกร');
      return;
    }

    setIsLoading(true);

    // -----------------------------------------------------------------
    // !!! ⚠️ นี่คือส่วนจำลองการอัปโหลดไฟล์ ⚠️ !!!
    // -----------------------------------------------------------------
    // ในแอปจริง: คุณต้องอัปโหลด 'selectedFile' (เช่น ใช้ FormData ส่งไป endpoint อื่น)
    // แล้วรับ URL ที่แท้จริงกลับมา
    // แต่ตอนนี้เราจะ "จำลอง" ว่าอัปโหลดสำเร็จแล้วได้ URL มา
    // -----------------------------------------------------------------
    const simulated_farmer_doc_url = `https://example.com/uploads/${selectedFile.name}`;
    // -----------------------------------------------------------------

    try {
      // 🟢 5. เรียก API /register
      const response = await api.post('/auth/register', {
        fullname,
        email,
        password,
        phone,
        address,
        farmer_doc_url: simulated_farmer_doc_url // ‼️ ใช้ URL จำลอง
      });

      // ถ้าสำเร็จ
      setIsLoading(false);
      console.log('Register successful:', response.data);
      
      // (ตัวเลือก) เก็บ token ไว้ใน AsyncStorage ที่นี่
      // await AsyncStorage.setItem('token', response.data.token);

      Alert.alert(
        'สมัครสมาชิกสำเร็จ',
        'การลงทะเบียนเกษตรกรสำเร็จแล้ว',
        [{ text: 'ตกลง', onPress: () => router.push('/LoginScreen') }]
      );

    } catch (err: any) {
      // ถ้าล้มเหลว
      setIsLoading(false);
      console.error('Register failed:', err.response?.data || err.message);
      Alert.alert(
        'สมัครไม่สำเร็จ',
        // แสดงข้อความ error จาก server ถ้ามี
        err.response?.data?.message || 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง'
      );
    }
  };

  // (ฟังก์ชัน handleUpload เหมือนเดิม)
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*', // รูปภาพทุกประเภท
          'application/pdf', // ไฟล์ PDF
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: false,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        console.log('File selected:', result.assets[0].name);
      } else {
        console.log('File selection cancelled or failed.');
        setSelectedFile(null); // เคลียร์ไฟล์หากยกเลิก
      }
    } catch (err) {
      console.error('Error picking document:', err);
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

          {/* 🟢 6. เชื่อม Input เข้ากับ State */}
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
            autoCapitalize="none" // 🟢 (แนะนำ) ปิดตัวพิมพ์ใหญ่ช่องอีเมล
            value={email}
            onChangeText={setEmail}
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

          {/* (ส่วน Upload เหมือนเดิม) */}
          <View style={registerBaseStyles.uploadContainer}>
            <Text style={registerBaseStyles.label}>เอกสาร (ทะเบียนเกษตรกร)</Text>
            <TouchableOpacity 
              style={registerBaseStyles.uploadBox} 
              onPress={handleUpload}
            >
              {selectedFile ? (
                <>
                  <Text style={registerBaseStyles.fileNameText} numberOfLines={2}>
                    ไฟล์ที่เลือก: {selectedFile.name}
                  </Text>
                  <Text style={registerBaseStyles.uploadText}>
                    (คลิกเพื่อเปลี่ยนไฟล์)
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={36} color="#A0AEC0" />
                  <Text style={registerBaseStyles.uploadText}>
                    คลิกเพื่ออัปโหลดไฟล์หรือรูปภาพ
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* 🟢 7. แก้ไข Button */}
          <Button 
            title={isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'} 
            onPress={handleRegister} 
            variant="default" 
            style={registerBaseStyles.registerButton}
            disabled={isLoading || !selectedFile} // ปิดปุ่มตอนโหลด หรือยังไม่เลือกไฟล์
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterSellerScreen;