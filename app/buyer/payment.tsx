import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // (สำหรับไอคอน Checkbox)
import { Ionicons } from '@expo/vector-icons'; 

// --- (จำลอง) ข้อมูลที่ถูกส่งมาจากหน้าก่อนหน้า (เช่น หน้า Match) ---
// ในแอปจริง ข้อมูลนี้จะถูกดึงมาจาก API หรือส่งมาจาก useLocalSearchParams
const mockTransactionData = {
  // (ข้อมูลจาก Schema 'transactions')
  product_name: 'มะม่วง',
  quantity: 30,
  price_per_unit: 30,
  total_amount: 900,
  pickup_code: 'ABC123', // (รหัสที่จะได้หลังจ่ายสำเร็จ)
  // (ข้อมูลเสริมสำหรับ UI)
  seller_location: 'สหกรณ์ฟาร์ม อ.ฝาง, จ.เชียงใหม่',
  product_image: 'https://i.imgur.com/gS4QhmS.jpeg',
  available_pickup_dates: ['6/11/2025'],
  pickup_deadline: '12/11/2568',
  wieght_unit: '20 กิโลกรัม',
};
    
const PaymentScreen = () => {
  const router = useRouter();
  // const { match_id } = useLocalSearchParams(); // (วิธีรับ ID เพื่อไปดึง data จริง)

  // 🆕 NEW: ฟังก์ชันสำหรับปุ่มย้อนกลับ
    const handleBack = () => {
        router.back();
    };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weightInKg, setWeightInKg] = useState('');

  // ฟังก์ชันสำหรับกด "ชำระเงิน"
  const handlePayment = () => {
    // 1. ตรวจสอบว่าเลือกวันหรือยัง
    if (!weightInKg.trim()) {
      Alert.alert('โปรดระบุจำนวนกิโลกรัม', 'กรุณากรอกจำนวนกิโลกรัมที่ต้องการซื้อ');
      return;
    }

    if (!selectedDate) {
      Alert.alert('โปรดเลือกวัน', 'กรุณาเลือกวันที่สะดวกไปรับสินค้า');
      return;
    }

    // 2. (จำลอง) การยิง API ชำระเงิน
    // ... (ยิง API ไปยัง Backend เพื่ออัปเดต payment_status = 'paid'
    // ... และบันทึก 'pickup_date' = selectedDate)
    // ... (Backend จะตอบกลับมาพร้อม 'pickup_code')

    console.log('Payment Confirmed:', {
      pickup_date: selectedDate,
      total_amount: mockTransactionData.total_amount,
    });

    // 3. เมื่อสำเร็จ นำทางไปหน้า Success
    // (เราจะส่งข้อมูลจาก schema 'transactions' ไปแสดงผล)
    router.push({
      pathname: '/buyer/paymentSuccess', // (ต้องสร้างไฟล์นี้)
      params: {
        pickup_code: mockTransactionData.pickup_code,
        pickup_date: selectedDate,
        total_amount: mockTransactionData.total_amount,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🆕 ADD: ปุ่มย้อนกลับ (จัดวางให้ลอยอยู่เหนือเนื้อหา) */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#0056b3" />
                        </TouchableOpacity>
                      
      <Stack.Screen options={{ title: 'การชำระเงิน' }} />
      <Text style={styles.pageTitle}>การชำระเงิน</Text>
      <ScrollView style={styles.container}>
        {/* --- 1. การ์ดสินค้า --- */}
        <View style={styles.card}>
          <View style={styles.itemHeader}>
            <Image source={{ uri: mockTransactionData.product_image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.productName}>{mockTransactionData.product_name}</Text>
              <Text style={styles.itemText}>จำนวน : {mockTransactionData.quantity} กิโลกรัม</Text>
              <Text style={styles.itemText}>ราคา : {mockTransactionData.price_per_unit} บาท/กก.</Text>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-pin" size={16} color="#074E9F" /> 
                <Text style={styles.locationText}>{mockTransactionData.seller_location}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />

          <Text style={styles.inputLabel}>จำนวนกิโลกรัมที่ต้องการซื้อ</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น 20"
            placeholderTextColor="#9aa0a6"
            keyboardType="numeric"
            value={weightInKg}
            onChangeText={setWeightInKg}
          />

        <View style={styles.selectionRow}></View>
          <Text style={styles.dateHeader}>วันที่ต้องเข้าไปรับสินค้า</Text>
          <View style={styles.dateRow}>
          {mockTransactionData.available_pickup_dates.map((date) => (
            <TouchableOpacity 
              key={date} 
              style={styles.dateOption} 
              onPress={() => setSelectedDate(date)}
            >
              <MaterialIcons 
                name={selectedDate === date ? 'check-box' : 'check-box-outline-blank'}
                size={24} 
                color={selectedDate === date ? '#28a745' : '#aaa'}
              />
              <Text style={styles.dateText}>{date}</Text>
            </TouchableOpacity>
          ))}
        </View>
        </View>

        {/* --- 3. สรุปยอด (เหมือนหน้าก่อน) --- */}
        <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>ข้อมูลการชำระเงิน</Text>
            <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ยอดชำระทั้งหมด</Text>
            <Text style={styles.summaryValue}>฿ {mockTransactionData.total_amount}</Text>
            </View>
        </View>

        {/* --- 4. ปุ่มชำระเงิน --- */}
        <TouchableOpacity style={styles.buttonSolid} onPress={handlePayment}>
          <Text style={styles.buttonSolidText}>ชำระเงิน</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
  container: { flex: 1, padding: 16 },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#074E9F',
    marginTop: 70,
    marginBottom: 20,
    marginLeft: 100,
    paddingLeft: 40,
  },//  Style สำหรับปุ่มย้อนกลับ
    backButton: {
        position: 'absolute', // ทำให้ปุ่มลอย
        top: 50, // ปรับตำแหน่งให้เหมาะสมกับ SafeAreaView
        left: 15,
        zIndex: 10, // ให้อยู่ด้านบนสุด
        padding: 5,
    },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  locationContainer: { 
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  locationText: { 
    fontSize: 14,
    color: '#555',
    marginLeft: 4, 
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  deadlineTag: {
    borderWidth: 1,
    borderColor: '#0056b3', // (สีน้ำเงินตามขอบ)
    backgroundColor: '#e6f0ff', // (สีฟ้าอ่อนตามพื้น)
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start', // (ให้ขนาดพอดีกับข้อความ)
    marginBottom: 16, // (ระยะห่างจาก "ช่วงเวลา...")
  },
  deadlineText: {
    color: '#0056b3', // (สีน้ำเงินตามข้อความ)
    fontSize: 12,
    fontWeight: '500',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // (เผื่อหน้าจอแคบมาก)
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateHeader: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 25,
    color: '#333',
  },
  summaryBox: {
    backgroundColor: '#e6f0ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  buttonSolid: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111',
  },
  inputHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
});

export default PaymentScreen;