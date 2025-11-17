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
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const PaymentScreen = () => {
  const router = useRouter();
  
  // ✅ 1. รับข้อมูลจากหน้า Product Detail
  const params = useLocalSearchParams();
  
  // ⚠️ สำคัญ: ต้องรับ listing_id มาด้วย
  const listing_id = params.listing_id as string; 
  
  const product_name = params.product_name as string || 'สินค้า';
  const price_per_unit = parseFloat(params.price_per_unit as string) || 0;
  const seller_location = params.seller_location as string || '-';
  const product_image = params.image_url as string || 'https://via.placeholder.com/150';
  const unit = params.unit as string || 'กก.';
  const pickup_date_raw = params.pickup_date as string; 

  // แปลงวันที่เป็น พ.ศ.
  let formattedPickupDate = 'ไม่ระบุ';
  if (pickup_date_raw) {
      const dateObj = new Date(pickup_date_raw);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('th-TH', { month: 'long' });
      const year = dateObj.getFullYear() + 543; 
      formattedPickupDate = `${day} ${month} ${year}`;
  }

  const [weightInput, setWeightInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const quantity = parseFloat(weightInput) || 0;
  const totalAmount = quantity * price_per_unit;

  const handleBack = () => {
        router.back();
  };

  // ฟังก์ชันไปหน้าเลือกวิธีชำระเงิน
  const handleToPaymentMethod = () => {
    // Validation
    if (!weightInput.trim() || quantity <= 0) {
      Alert.alert('โปรดระบุจำนวน', `กรุณากรอกจำนวน ${unit} ที่ต้องการซื้อ`);
      return;
    }

    if (!selectedDate) {
      Alert.alert('โปรดเลือกวัน', 'กรุณายืนยันวันที่สะดวกไปรับสินค้า');
      return;
    }

    // ✅ ส่งข้อมูลไปหน้า paymentMethod (รวมถึง listing_id และ quantity)
    router.push({
      pathname: '/buyer/paymentMethod',
      params: {
        listing_id: listing_id, // 👈 ส่ง ID สินค้า
        quantity: quantity.toString(), // 👈 ส่งจำนวน
        total_amount: totalAmount.toString(),
        pickup_date: selectedDate, // ส่งวันที่รับ (พ.ศ.)
        // ส่งข้อมูลอื่นไปแสดงผลด้วยก็ได้
        product_name: product_name
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0056b3" />
        </TouchableOpacity>
                      
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.pageTitle}>รายละเอียดคำสั่งซื้อ</Text>
      
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.itemHeader}>
            <Image source={{ uri: product_image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.productName}>{product_name}</Text>
              <Text style={styles.itemText}>ราคา : {price_per_unit} บาท/{unit}</Text>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-pin" size={16} color="#074E9F" /> 
                <Text style={styles.locationText} numberOfLines={1}>{seller_location}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />

          <Text style={styles.inputLabel}>จำนวน ({unit}) ที่ต้องการซื้อ</Text>
          <TextInput
            style={styles.input}
            placeholder={`ระบุจำนวน ${unit}`}
            placeholderTextColor="#9aa0a6"
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
          />

        <View style={styles.selectionRow}></View>
          <Text style={styles.dateHeader}>วันที่สะดวกเข้าไปรับสินค้า</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={styles.dateOption} 
              onPress={() => setSelectedDate(formattedPickupDate)}
            >
              <MaterialIcons 
                name={selectedDate === formattedPickupDate ? 'check-box' : 'check-box-outline-blank'}
                size={24} 
                color={selectedDate === formattedPickupDate ? '#28a745' : '#aaa'}
              />
              <Text style={styles.dateText}>{formattedPickupDate}</Text>
            </TouchableOpacity>
        </View>
        </View>

        {/* สรุปยอด */}
        <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>ข้อมูลการชำระเงิน</Text>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>จำนวน</Text>
                <Text style={styles.summaryValue}>{quantity} {unit}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ยอดชำระทั้งหมด</Text>
                <Text style={[styles.summaryValue, { fontSize: 20 }]}>฿ {totalAmount.toLocaleString()}</Text>
            </View>
        </View>

        {/* ปุ่มไปชำระเงิน */}
        <TouchableOpacity style={styles.buttonSolid} onPress={handleToPaymentMethod}>
          <Text style={styles.buttonSolidText}>ไปชำระเงิน</Text>
        </TouchableOpacity>

        <View style={{height: 50}} />
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
    marginTop: 50, // ปรับลงมาหน่อยให้พ้นปุ่ม Back
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
        position: 'absolute', 
        top: 50, 
        left: 15,
        zIndex: 10, 
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.8)', // เพิ่มพื้นหลังให้เห็นชัด
        borderRadius: 20
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
    justifyContent: 'center'
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4
  },
  locationContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: { 
    fontSize: 13,
    color: '#777',
    marginLeft: 4, 
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', 
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
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
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
    paddingBottom: 5
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
    marginTop: 10,
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff'
  },
});

export default PaymentScreen;