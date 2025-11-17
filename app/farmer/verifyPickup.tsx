import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- (จำลอง) ข้อมูลรายการที่จะตรวจสอบ ---
const mockItem = {
  id: 1,
  sellerName: 'ณัฐรินทร์ อาณัติธนันท์กุล',
  productName: 'มะม่วง',
  quantity: 30, // กก.
  price: 900, // บาท
  imageUrl: 'https://i.imgur.com/gS4QhmS.jpeg', // (รูปมะม่วงตัวอย่าง)
  pickup_code: 'ABC123', // (นี่คือรหัสที่ถูกต้อง)
};

const VerifyPickupScreen = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // ฟังก์ชันเมื่อกดปุ่ม "เสร็จสิ้น"
  const handleFinish = () => {
    if (loading) return;
    setLoading(true);

    // --- (จำลอง) การตรวจสอบรหัส ---
    // ในแอปจริง ส่วนนี้ควรยิง API ไปที่ Server
    // เพื่อตรวจสอบว่า code ที่กรอก ตรงกับ mockItem.pickup_code หรือไม่
    
    setTimeout(() => { // (จำลองการหน่วงเวลาของ API)
      if (code.trim().toUpperCase() === mockItem.pickup_code) {
        // --- ถ้ารหัสถูกต้อง ---
        // นำทางไปยังหน้าที่ 2 (หน้าสำเร็จ)
        router.push('/farmer/pickupSuccess');
      } else {
        // --- ถ้ารหัสผิด ---
        Alert.alert('รหัสผิดพลาด', 'รหัสยืนยันรับสินค้าไม่ถูกต้อง');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* 🆕 ADD: ปุ่มย้อนกลับ (จัดวางให้ลอยอยู่เหนือเนื้อหา) */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#0056b3" />
                        </TouchableOpacity>

      <Text style={styles.pageTitle}>ตรวจสอบรายการ</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
            
          {/* --- ส่วนข้อมูลสินค้า --- */}
          <View style={styles.itemContainer}>
            <Image source={{ uri: mockItem.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.sellerName}>{mockItem.sellerName}</Text>
              <Text style={styles.itemText}>ความต้องการ : {mockItem.productName}</Text>
              <Text style={styles.itemText}>จำนวน : {mockItem.quantity} กก.</Text>
              <Text style={styles.itemText}>ราคา : {mockItem.price} บาท</Text>
            </View>
          </View>

          {/* --- ส่วนกรอกรหัส --- */}
          <Text style={styles.label}>กรอกรหัสสินค้าจากผู้ซื้อ</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="กรอกรหัส 6 หลัก"
            value={code}
            onChangeText={setCode}
            maxLength={10} // (ตาม Schema VARCHAR(10))
            autoCapitalize="characters"
          />

          {/* --- ปุ่มเสร็จสิ้น --- */}
          <TouchableOpacity 
            style={styles.buttonSolid} 
            onPress={handleFinish}
            disabled={loading}
          >
            <Text style={styles.buttonSolidText}>
              {loading ? 'กำลังตรวจสอบ...' : 'เสร็จสิ้น'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  backButton: {
        position: 'absolute', // ทำให้ปุ่มลอย
        top: 50, // ปรับตำแหน่งให้เหมาะสมกับ SafeAreaView
        left: 15,
        zIndex: 10, // ให้อยู่ด้านบนสุด
        padding: 5,
    },
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonSolid: {
    backgroundColor: '#28a745', // สีเขียว
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
    pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#074E9F',
    marginTop: 70,
    marginBottom: 10,
    marginLeft: 100,
    paddingLeft: 20,
  },
});

export default VerifyPickupScreen;