import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VerifyPickupScreen = () => {
  const router = useRouter();
  
  // ✅ รับ ID จากหน้า Notification
  const { orderId } = useLocalSearchParams();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  // ✅ ดึงข้อมูลออเดอร์จริง
  useEffect(() => {
    const fetchOrder = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // Backend ต้องมี API: GET /orders/:id (เพื่อดูรายละเอียด)
            // (ถ้ายังไม่มี ให้ใช้ข้อมูลจาก params ไปพลางๆ หรือสร้าง API เพิ่ม)
            // สมมติว่ามี API นี้แล้ว:
            /* const response = await api.get(`/orders/${orderId}`, { headers: ... });
               setOrderData(response.data);
            */
            
            // *ถ้า Backend ยังไม่พร้อม ให้ Mock ไปก่อนว่ามีข้อมูล*
            setOrderData({
                id: orderId,
                productName: 'สินค้า (รอ API)',
                buyerName: 'ลูกค้า (รอ API)',
                quantity: '-',
                totalPrice: '-'
            });

        } catch (error) {
            Alert.alert("Error", "ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setFetching(false);
        }
    };

    if(orderId) fetchOrder();
  }, [orderId]);

  const handleFinish = async () => {
    if (loading) return;
    if (!code.trim()) {
        Alert.alert("แจ้งเตือน", "กรุณากรอกรหัส");
        return;
    }

    setLoading(true);
    try {
        const token = await AsyncStorage.getItem('userToken');
        
        // ✅ ยิง API ยืนยันรหัส (ไปที่ order.controller.js -> confirmPickup)
        const response = await api.post(`/orders/${orderId}/confirm`, {
            confirmation_code: code.trim()
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        Alert.alert("สำเร็จ", "ยืนยันการส่งมอบเรียบร้อยแล้ว!", [
            { text: "ตกลง", onPress: () => router.replace('/farmer/dashboard') }
        ]);

    } catch (error: any) {
        const msg = error.response?.data?.message || "รหัสไม่ถูกต้อง หรือเกิดข้อผิดพลาด";
        Alert.alert("ผิดพลาด", msg);
    } finally {
        setLoading(false);
    }
  };

  if (fetching) {
      return <SafeAreaView style={styles.safeArea}><ActivityIndicator size="large" color="#0056b3" style={{marginTop:50}}/></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0056b3" />
        </TouchableOpacity>

      <Text style={styles.pageTitle}>ตรวจสอบรายการ</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
            
          {/* แสดงข้อมูล (ที่ดึงมาจาก API หรือ Mock) */}
          <View style={styles.itemContainer}>
            <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              {/* แสดงข้อมูลจริงถ้ามี */}
              <Text style={styles.sellerName}>ผู้ซื้อ: {orderData?.buyerName}</Text>
              <Text style={styles.itemText}>สินค้า: {orderData?.productName}</Text>
              <Text style={styles.itemText}>จำนวน: {orderData?.quantity}</Text>
              <Text style={styles.itemText}>ยอดเงิน: {orderData?.totalPrice} บาท</Text>
            </View>
          </View>

          <Text style={styles.label}>กรอกรหัสสินค้าจากผู้ซื้อ</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="กรอกรหัส 6 หลัก (เช่น ABC123)"
            value={code}
            onChangeText={setCode}
            maxLength={10}
            autoCapitalize="characters"
          />

          <TouchableOpacity 
            style={styles.buttonSolid} 
            onPress={handleFinish}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white"/> : <Text style={styles.buttonSolidText}>ยืนยันการส่งมอบ</Text>}
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