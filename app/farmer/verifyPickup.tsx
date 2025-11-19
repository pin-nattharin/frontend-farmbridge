import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderDetails {
    id: number;
    quantity_ordered: string;
    total_price: string;
    status: string;
    Listing: {
        product_name: string;
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
            const response = await api.get('/orders/history/sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const allOrders = response.data;
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

  return (
    <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0056b3" />
        </TouchableOpacity>

      <Text style={styles.pageTitle}>ตรวจสอบรายการ</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
            
          {/* ส่วนที่ 1: ข้อมูลผู้ซื้อ */}
          <View style={styles.rowDetail}>
            <Text style={styles.detailLabel}>ผู้ซื้อ:</Text>
            <Text style={styles.buyerValue}>
                 {orderData?.Buyer?.fullname || 'ลูกค้าทั่วไป'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* ✅ ส่วนที่ 2: ปรับให้เป็นแนวนอน (ซ้าย: หัวข้อ, ขวา: ชื่อสินค้า) */}
          <View style={styles.rowDetail}>
            <Text style={styles.detailLabel}>สินค้าที่สั่งซื้อ:</Text>
            <Text style={styles.productNameRight}>
                {orderData?.Listing?.product_name}
            </Text>
          </View>

          {/* รายละเอียด จำนวน */}
          <View style={styles.rowDetail}>
            <Text style={styles.detailLabel}>จำนวน:</Text>
            <Text style={styles.detailValue}>
                {orderData ? parseFloat(orderData.quantity_ordered).toFixed(0) : '-'} กก.
            </Text>
          </View>

          {/* รายละเอียด ยอดรวม */}
          <View style={styles.rowDetail}>
            <Text style={styles.detailLabel}>ยอดรวม:</Text>
            <Text style={styles.priceValue}>
                {orderData ? parseFloat(orderData.total_price).toLocaleString() : '-'} บาท
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>กรอกรหัสยืนยัน (Code)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Ex. ABC123"
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
    alignItems: 'center', 
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Layout แบบแนวนอน (ซ้าย-ขวา)
  rowDetail: {
      flexDirection: 'row',
      justifyContent: 'space-between', // หัวท้ายแยกกัน
      alignItems: 'center',
      marginBottom: 16, // เพิ่มระยะห่างระหว่างบรรทัดนิดหน่อยให้อ่านง่าย
      width: '100%',
  },
  detailLabel: {
      fontSize: 16,
      color: '#666', 
  },
  buyerValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
  },
  // ✅ สไตล์สำหรับชื่อสินค้า (ชิดขวา + สีน้ำเงิน)
  productNameRight: { 
    fontSize: 22,
    color: '#0056b3',
    fontWeight: 'bold',
    textAlign: 'right', 
  },
  detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  priceValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#28a745',
  },
  divider: {
      height: 1,
      backgroundColor: '#eee',
      width: '100%',
      marginVertical: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center', 
  },
  inputBox: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  buttonSolid: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#074E9F',
    marginTop: 70,
    marginBottom: 10,
    textAlign: 'center', 
    width: '100%',
  },
});

export default VerifyPickupScreen;