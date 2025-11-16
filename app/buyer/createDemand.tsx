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
  ActivityIndicator, // --- [NEW] ---
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

// (สมมติว่าคุณมีไฟล์ Dropdown ที่ path นี้)
import CustomDropdown from '../../components/ui/Dropdown'; 

// --- [NEW] --- (สมมติว่าคุณมีไฟล์ config และ context)
// (***กรุณาแก้ Path ให้ถูกต้องตามโปรเจกต์ของคุณ***)
// (ถ้าคุณยังไม่มี AuthContext ให้ดูที่ผมส่งให้ก่อนหน้านี้)
import api from '../../services/api';
import { useAuth } from '../context/AuthContext'; // (แก้ path นี้ให้ถูก)

const CreateDemandScreen = () => {
  const router = useRouter();
  const { token } = useAuth(); // --- [NEW] --- (ดึง Token)

  // --- 1. States for Form Data ---
  const [productName, setProductName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(''); // --- [NEW] --- (สำหรับ desired_price)

  // --- 2. States for UI (Dropdown) ---
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ label: string; value: string }>>([]); // --- [NEW] --- (เริ่มจากค่าว่าง)
  const [productsLoading, setProductsLoading] = useState(false); // --- [NEW] --- (สถานะโหลด Dropdown)
  
  // --- [NEW] --- (สถานะโหลดตอนกด "ยืนยัน")
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- [NEW] --- ดึงข้อมูลสินค้าสำหรับ Dropdown
  useEffect(() => {
    const fetchProductOptions = async () => {
      if (!token) return;
      setProductsLoading(true);
      try {
        // (อิงจาก demand.routes.js -> router.get('/products', ...) )
        const response = await fetch(`/api/demands/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลสินค้าได้');
        }

        const productList: string[] = await response.json();
        
        // (อิงจาก demand.controller.js -> getProductOptions)
        // แปลง array [ 'ทุเรียน', 'มะม่วง' ] 
        // ให้เป็น [ { label: 'ทุเรียน', value: 'ทุเรียน' }, { label: 'มะม่วง', value: 'มะม่วง' } ]
        const dropdownItems = productList.map(product => ({
          label: product,
          value: product,
        }));
        setItems(dropdownItems);

      } catch (error) {
        console.error(error);
        Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลสินค้าได้');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductOptions();
  }, [token]); // ทำงานเมื่อ Token พร้อมใช้งาน

  // --- 3. ฟังก์ชันสำหรับปุ่ม ---
  const handleCancel = () => {
    if (isSubmitting) return; // --- [NEW] ---
    router.back();
  };

  const handleConfirm = async () => {
    // --- 4. ตรวจสอบข้อมูล ---
    // (desired_price เป็น optional ใน controller จึงไม่ต้องบังคับ)
    if (!productName || !quantity) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกสินค้าและระบุจำนวน');
      return;
    }

    if (isSubmitting) return; // --- [NEW] --- (ป้องกันการกดย้ำ)
    setIsSubmitting(true); // --- [NEW] ---

    // --- 5. (ของจริง) การยิง API ---
    console.log('Sending Demand:', {
      product_name: productName,
      desired_quantity: quantity,
      desired_price: price,
      unit: 'kg', // (ตามที่ UI ระบุ)
    });

    try {
      // (อิงจาก demand.routes.js -> router.post('/', ...) )
      // (อิงจาก demand.controller.js -> createDemand)
      const response = await fetch(`/api/demands`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // (ต้องใช้ Token เพื่อให้ controller รู้ 'buyer_id' จาก req.identity.id)
        },
        body: JSON.stringify({
          product_name: productName,
          desired_quantity: parseFloat(quantity),
          desired_price: price ? parseFloat(price) : null, // --- [NEW] --- (ส่งค่า price)
          unit: 'kg', 
          // (location_geom จะถูกดึงจาก profile ของ buyer_id ใน backend)
        }),
      });

      if (response.ok) {
        Alert.alert('ส่งสำเร็จ', 'คำขอของคุณถูกบันทึกแล้ว');
        router.back();
      } else {
        const errData = await response.json();
        Alert.alert('ผิดพลาด', errData.message || 'ไม่สามารถส่งคำขอได้');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false); // --- [NEW] ---
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
            loading={productsLoading} // --- [NEW] ---
            disabled={isSubmitting} // --- [NEW] ---
            listMode="MODAL" // (แนะนำสำหรับ ScrollView)
          />

          {/* --- 2. จำนวน (TextInput) --- */}
          <Text style={styles.label}>จำนวน (กิโลกรัม)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุจำนวนที่ต้องการ (กก.)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            editable={!isSubmitting} // --- [NEW] ---
          />
          
          {/* --- 3. ราคา (TextInput) --- [NEW] --- */}
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
              disabled={isSubmitting} // --- [NEW] ---
            >
              <Text style={styles.buttonOutlineText}>ยกเลิก</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonSolid, isSubmitting && styles.buttonDisabled]} // --- [NEW] ---
              onPress={handleConfirm}
              disabled={isSubmitting} // --- [NEW] ---
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" /> // --- [NEW] ---
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
  // --- [NEW] ---
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
});

export default CreateDemandScreen;