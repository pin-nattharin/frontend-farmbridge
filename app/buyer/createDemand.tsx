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
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

// (สมมติว่าคุณมีไฟล์ Dropdown ที่ path นี้)
import CustomDropdown from '../../components/ui/Dropdown'; 

// --- [แก้ไข] นำเข้า Axios Instance และ useAuth ---
import api from '../../services/api';
import { useAuth } from '../context/AuthContext'; 

const CreateDemandScreen = () => {
  const router = useRouter();
  // ดึง Token และสถานะโหลด Auth (จำเป็นต้องถูกห่อหุ้มด้วย AuthProvider)
  const { token, isLoading: authLoading } = useAuth(); 

  // --- 1. States for Form Data ---
  const [productName, setProductName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(''); 

  // --- 2. States for UI (Dropdown) ---
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ label: string; value: string }>>([]);
  const [productsLoading, setProductsLoading] = useState(false); 
  
  // --- สถานะโหลดตอนกด "ยืนยัน" ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ดึงข้อมูลสินค้าสำหรับ Dropdown ---
  useEffect(() => {
    const fetchProductOptions = async () => {
      // ⚠️ รอให้ Token พร้อม และ AuthContext ไม่ได้อยู่ในสถานะโหลด
      if (!token || authLoading) return;

      setProductsLoading(true);
      try {
        // [แก้ไข] ใช้ api.get() แทน fetch()
        const response = await api.get(`/demands/products`); // Axios จะจัดการ Token Header ให้เอง

        const productList: string[] = response.data; // Axios แปลง JSON ให้แล้ว

        // แปลงข้อมูล dropdownItems
        const dropdownItems = productList.map(product => ({
          label: product,
          value: product,
        }));
        setItems(dropdownItems);

      } catch (error: any) {
        console.error('Fetch Product Options Failed:', error);
        // แสดงข้อความ Error จาก Axios
        Alert.alert('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถดึงข้อมูลสินค้าได้');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductOptions();
  }, [token, authLoading]); // ทำงานเมื่อ Token และ AuthContext พร้อมใช้งาน

  // --- 3. ฟังก์ชันสำหรับปุ่ม ---
  const handleCancel = () => {
    // ป้องกันการทำงานขณะ Submit
    if (isSubmitting) return; 
    router.back();
  };

  const handleConfirm = async () => {
    // --- 4. ตรวจสอบข้อมูล ---
    if (!productName || !quantity) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกสินค้าและระบุจำนวน');
      return;
    }

    if (isSubmitting || !token) return; // ป้องกันการกดย้ำ & ต้องมี Token
    setIsSubmitting(true); 

    console.log('Sending Demand:', {
      product_name: productName,
      desired_quantity: quantity,
      desired_price: price,
      unit: 'kg',
    });

    try {
      // [แก้ไข] ใช้ api.post() แทน fetch()
      const response = await api.post(`/demands`, { 
        product_name: productName,
        desired_quantity: parseFloat(quantity),
        desired_price: price ? parseFloat(price) : null,
        unit: 'kg', 
      });

      // ถ้า Axios ไม่โยน Error แสดงว่า response.status อยู่ใน 2xx
      Alert.alert('ส่งสำเร็จ', 'คำขอของคุณถูกบันทึกแล้ว');
      router.back();

    } catch (error: any) { 
      console.error('Create Demand Failed:', error);
      // [แก้ไข] ใช้โครงสร้างการรับ Error จาก Axios
      Alert.alert(
        'เกิดข้อผิดพลาด', 
        error.response?.data?.message || error.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (โปรดเช็ค IP ใน services/api.js)'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'สร้างความต้องการ' }} />

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
            loading={productsLoading}
            disabled={isSubmitting}
            listMode="MODAL"
          />

          {/* --- 2. จำนวน (TextInput) --- */}
          <Text style={styles.label}>จำนวน (กิโลกรัม)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุจำนวนที่ต้องการ (กก.)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
          
          {/* --- 3. ราคา (TextInput) --- */}
          <Text style={styles.label}>ราคาที่ต้องการ (บาท / กก.)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุราคาที่ต้องการ (ไม่บังคับ)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          {/* --- 4. ปุ่ม --- */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutline]} 
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonOutlineText}>ยกเลิก</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonSolid, isSubmitting && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonSolidText}>ยืนยัน</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet (เหมือนเดิม) ---
const styles = StyleSheet.create({
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
    marginHorizontal: -4,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#28a745',
  },
  buttonOutlineText: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSolid: {
    backgroundColor: '#28a745',
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
});

export default CreateDemandScreen;