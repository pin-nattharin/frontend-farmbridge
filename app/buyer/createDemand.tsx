import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import CustomDropdown from '../../components/ui/Dropdown'; 

// (สมมติว่าคุณมีไฟล์ config)
// import { API_URL } from '../utils/apiConfig';
// (สมมติว่าคุณมีวิธีดึง Token)
// import { useAuth } from '../context/AuthContext'; 

const CreateDemandScreen = () => {
  const router = useRouter();
  // const { token } = useAuth(); // (ตัวอย่างการดึง Token)

  // --- 1. States for Form Data (ตาม Schema) ---
  const [productName, setProductName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');

  // --- 2. States for UI (Dropdown) ---
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'ทุเรียน', value: 'durian' },
    { label: 'มะม่วง', value: 'mango' },
    { label: 'มังคุด', value: 'mangosteen' },
    { label: 'องุ่น', value: 'grape' },
  ]);

  // --- 3. ฟังก์ชันสำหรับปุ่ม ---
  const handleCancel = () => {
    router.back(); // กลับหน้าเดิม
  };

  const handleConfirm = async () => {
    // --- 4. ตรวจสอบข้อมูล ---
    if (!productName || !quantity) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    // --- 5. (จำลอง) การยิง API ---
    console.log('Sending Demand:', {
      product_name: productName,
      desired_quantity: quantity,
      unit: 'kg', // (ตามที่ UI ระบุ)
    });

    try {
      /* (โค้ดจริงสำหรับยิง API)
      const response = await fetch(`${API_URL}/api/demands`, { // (สมมติ Path นี้)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // (ต้องใช้ Token เพื่อรู้ 'buyer_id')
        },
        body: JSON.stringify({
          product_name: productName,
          desired_quantity: parseFloat(quantity),
          desired_price: parseFloat(price),
          unit: 'kg', 
          // (Backend จะดึง location_geom จาก profile ของ buyer_id)
        }),
      });

      if (response.ok) {
        Alert.alert('ส่งสำเร็จ', 'คำขอของคุณถูกบันทึกแล้ว');
        router.back();
      } else {
        const errData = await response.json();
        Alert.alert('ผิดพลาด', errData.message || 'ไม่สามารถส่งคำขอได้');
      }
      */

      // (สำหรับทดสอบ)
      Alert.alert('ส่งสำเร็จ', 'คำขอของคุณถูกบันทึกแล้ว (จำลอง)');
      router.back();

    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- Header --- */}
      <Stack.Screen options={{ title: 'ความต้องการ' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* --- 1. สินค้า (Dropdown) --- */}
          <Text style={styles.label}>สินค้า</Text>
          <CustomDropdown
            open={open}
            setOpen={setOpen}
            value={productName}
            items={items}
            setValue={setProductName}
            setItems={setItems}
            placeholder="เลือกสินค้าที่ต้องการ"
            containerStyle={{ zIndex: 1000, marginVertical: 8 }}
          />

          {/* --- 2. จำนวน (TextInput) --- */}
          <Text style={styles.label}>จำนวน (กิโลกรัม)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุจำนวนที่ต้องการ (กก.)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          {/* --- 4. ปุ่ม --- */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutline]} 
              onPress={handleCancel}
            >
              <Text style={styles.buttonOutlineText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSolid]} 
              onPress={handleConfirm}
            >
              <Text style={styles.buttonSolidText}>ยืนยัน</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4', // สีพื้นหลังเทาอ่อนแบบในรูป
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 24, // ให้การ์ดอยู่ต่ำลงมาหน่อย
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20, // ความโค้งมนของการ์ด
    padding: 24,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  inputBox: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: -4, // ชดเชย padding ของปุ่ม
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4, // ระยะห่างระหว่างปุ่ม
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#28a745', // สีเขียว
  },
  buttonOutlineText: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSolid: {
    backgroundColor: '#28a745', // สีเขียว
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateDemandScreen;