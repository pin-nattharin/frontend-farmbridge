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

// 🟢 กำหนด Base URL (Emulator ใช้ 10.0.2.2)
const IMAGE_BASE_URL = 'http://10.0.2.2:3000'; 

interface OrderDetails {
    id: number;
    quantity_ordered: string;
    total_price: string;
    status: string;
    Listing: {
        product_name: string;
        // รองรับ image_url เป็น array string
        image_url?: string[] | null; 
    };
    Buyer: {
        fullname: string;
        phone?: string;
    };
}

const VerifyPickupScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            // เรียก API ประวัติการขายทั้งหมด (ที่มีอยู่แล้ว)
            const response = await api.get('/orders/history/sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const allOrders = response.data;
            // ค้นหา Order ที่ต้องการจากรายการทั้งหมด
            const targetOrder = allOrders.find((o: OrderDetails) => o.id == Number(orderId));

            if (targetOrder) {
                setOrderData(targetOrder);
            } else {
                Alert.alert("ไม่พบข้อมูล", "ไม่พบรายการสั่งซื้อนี้ในระบบ");
                router.back();
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "ไม่สามารถโหลดข้อมูลได้");
            router.back();
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
        
        // API ยืนยัน (confirm)
        await api.post(`/orders/${orderId}/confirm`, {
            confirmation_code: code.trim()
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        router.replace('/farmer/pickupSuccess');

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

  // 🟢 Logic จัดการรูปภาพ (ดึงรูปแรกจาก array)
  const getProductImageSource = () => {
      const rawPath = orderData?.Listing?.image_url?.[0]; // ดึงรูปแรก
      
      if (!rawPath) return { uri: 'https://via.placeholder.com/150?text=No+Image' };

      let cleanPath = rawPath.replace(/['"]+/g, '').replace(/\\/g, '/');
      let finalUrl = '';

      if (cleanPath.startsWith('content://') || cleanPath.startsWith('file://')) {
          finalUrl = cleanPath;
      } else if (cleanPath.startsWith('http')) {
          finalUrl = cleanPath;
      } else {
          // ถ้าเป็น path บน server
          cleanPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
          if (!cleanPath.startsWith('uploads/')) {
              cleanPath = `uploads/${cleanPath}`;
          }
          finalUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
      }
      return { uri: finalUrl };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0056b3" />
        </TouchableOpacity>

      <Text style={styles.pageTitle}>ตรวจสอบรายการ</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
            
          <View style={styles.itemContainer}>
            {/* 🟢 แสดงรูปภาพ */}
            <Image 
                source={getProductImageSource()} 
                style={styles.itemImage} 
                resizeMode="cover" // เพิ่ม resizeMode ให้รูปไม่เพี้ยน
            />
            
            <View style={styles.itemInfo}>
              {/* แสดงข้อมูลที่หาเจอ */}
              <Text style={styles.sellerName}>
                  ผู้ซื้อ: {orderData?.Buyer?.fullname || 'ลูกค้าทั่วไป'}
              </Text>
              <Text style={styles.itemText}>
                  สินค้า: {orderData?.Listing?.product_name}
              </Text>
              <Text style={styles.itemText}>
                จำนวน: {orderData ? parseFloat(orderData.quantity_ordered).toFixed(0) : '-'} หน่วย
              </Text>
              <Text style={styles.itemText}>
                ยอดเงิน: {orderData ? parseFloat(orderData.total_price).toLocaleString() : '-'} บาท
              </Text>
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

const styles = StyleSheet.create({
  backButton: {
        position: 'absolute',
        top: 50,
        left: 15,
        zIndex: 10,
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
    borderWidth: 1,         // ใส่ขอบเล็กน้อย
    borderColor: '#f0f0f0'
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
    backgroundColor: '#28a745',
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