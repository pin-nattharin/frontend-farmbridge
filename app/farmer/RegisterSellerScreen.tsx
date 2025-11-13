import React, { useState } from 'react'; // 🟢 เพิ่ม useState
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker'; 
import { useRouter } from 'expo-router'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import RoundedInput from '../../components/ui/RoundedInput'; 
import Button from '../../components/ui/Button'; 

// สร้างตัวแปร styles ที่สามารถ export เพื่อให้ LoginScreen ใช้งานได้
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
      // ลบ flexDirection: 'row' ออก เพื่อให้ Text และ Icon อยู่กึ่งกลาง
    },
    uploadText: {
      fontSize: 14,
      color: '#A0AEC0',
      marginTop: 5, 
    },
    fileNameText: { // Style สำหรับแสดงชื่อไฟล์ที่เลือกแล้ว
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
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null); // State สำหรับเก็บไฟล์ที่เลือก
  
  const handleRegister = () => {
    router.push('/LoginScreen');
  };

  // ฟังก์ชันใหม่สำหรับเลือกเอกสาร/รูปภาพ
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*', // รูปภาพทุกประเภท
          'application/pdf', // ไฟล์ PDF
          'application/msword', // ไฟล์ Word (doc)
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // ไฟล์ Word (docx)
          // สามารถเพิ่มประเภทไฟล์อื่น ๆ ได้ตามต้องการ เช่น 'text/plain'
        ],
        copyToCacheDirectory: false,
      });

      // ตรวจสอบว่าผู้ใช้ไม่ได้ยกเลิกการเลือก
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        // 'assets' เป็น array ของไฟล์ที่ถูกเลือก (แม้ว่าจะเลือกได้ไฟล์เดียว)
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

          <RoundedInput label="ชื่อ" placeholder="ชื่อ-นามสกุล" />
          <RoundedInput label="อีเมล" placeholder="example@mail.com" keyboardType="email-address" />
          <RoundedInput label="เบอร์โทรศัพท์" placeholder="0XXXXXXXXX" keyboardType="phone-pad" />
          <RoundedInput label="รหัสผ่าน" placeholder="********" secureTextEntry />
          <RoundedInput label="ยืนยันรหัสผ่าน" placeholder="********" secureTextEntry />
          <RoundedInput label="ที่อยู่" placeholder="เลขที่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด" multiline />

          {/* ช่องอัปโหลดเอกสารที่แก้ไขแล้ว */}
          <View style={registerBaseStyles.uploadContainer}>
            <Text style={registerBaseStyles.label}>เอกสาร (ทะเบียนเกษตรกร)</Text>
            <TouchableOpacity 
              style={registerBaseStyles.uploadBox} 
              onPress={handleUpload}
            >
              {selectedFile ? (
                // แสดงชื่อไฟล์ที่เลือกแล้ว
                <>
                  <Text style={registerBaseStyles.fileNameText}>
                    ไฟล์ที่เลือก: **{selectedFile.name}**
                  </Text>
                  <Text style={registerBaseStyles.uploadText}>
                    (คลิกเพื่อเปลี่ยนไฟล์)
                  </Text>
                </>
              ) : (
                //แสดงข้อความเริ่มต้น
                <>
                  <MaterialIcons name="cloud-upload" size={36} color="#A0AEC0" />
                  <Text style={registerBaseStyles.uploadText}>
                    คลิกเพื่ออัพโหลดไฟล์หรือรูปภาพ
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <Button 
            title="สมัครสมาชิก" 
            onPress={handleRegister} 
            variant="default" 
            style={registerBaseStyles.registerButton}
            //disabled={!selectedFile}// ปิดปุ่มหากยังไม่ได้เลือกไฟล์
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterSellerScreen;