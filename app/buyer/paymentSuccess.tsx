import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PaymentSuccessScreen = () => {
  const router = useRouter();
  // 1. ดึงข้อมูลที่ส่งมาจากหน้า PaymentScreen
  const { pickup_code, pickup_date, total_amount } = useLocalSearchParams();

  const handleGoHome = () => {
    // 2. กลับไปหน้าหลัก (ล้าง Stack การจ่ายเงิน)
    router.replace('/buyer/homeBuyer'); // (สมมติว่าหน้าหลักคือ Root ของ Tabs)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'ชำระเงินสำเร็จ', headerLeft: () => null }} />
      
      <View style={styles.container}>
        {/* --- 1. ไอคอนและหัวข้อ --- */}
        <View style={styles.checkCircle}>
          <MaterialIcons name="check" size={60} color="white" />
        </View>
        <Text style={styles.title}>การชำระเงินสำเร็จ</Text>

        {/* --- 2. การ์ดรหัสรับสินค้า (เชื่อม Schema) --- */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>รหัสสินค้า :</Text>
            <Text style={styles.infoValue}>{pickup_code}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>วันรับสินค้า :</Text>
            <Text style={styles.infoValue}>{pickup_date}</Text>
          </View>
        </View>

        {/* --- 4. ปุ่มกลับหน้าหลัก --- */}
        <TouchableOpacity style={styles.buttonSolid} onPress={handleGoHome}>
          <Text style={styles.buttonSolidText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center', // จัดให้อยู่กลาง (ต่างจากหน้าแรก)
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 80,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0056b3',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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

export default PaymentSuccessScreen;