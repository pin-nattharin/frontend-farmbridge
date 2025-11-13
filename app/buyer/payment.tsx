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
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // (สำหรับไอคอน Checkbox)

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
  available_pickup_dates: ['6/11/2025', '7/11/2025'],
  pickup_deadline: '12/11/2568',
};

const PaymentScreen = () => {
  const router = useRouter();
  // const { match_id } = useLocalSearchParams(); // (วิธีรับ ID เพื่อไปดึง data จริง)
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ฟังก์ชันสำหรับกด "ชำระเงิน"
  const handlePayment = () => {
    // 1. ตรวจสอบว่าเลือกวันหรือยัง
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

          {/* --- 2. ส่วนเลือกวันนัดรับ --- */}
          <View style={styles.deadlineTag}>
            <Text style={styles.deadlineText}>
              ควรมารับก่อนวันที่ {mockTransactionData.pickup_deadline}
            </Text>
          </View>

        <View style={styles.selectionRow}></View>
          <Text style={styles.dateHeader}>ช่วงเวลาที่ต้องการเข้าไปรับสินค้า</Text>
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
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 110,
    paddingLeft: 40,
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
    marginBottom: 8,
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
});

export default PaymentScreen;