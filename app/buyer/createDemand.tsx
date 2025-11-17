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
  Platform,
  KeyboardAvoidingView
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
  const [product_name, setProduct_Name] = useState<string | null>(null);
  const [quantity_total, setQuantity_Total] = useState('');
  const [price_per_unit, setPrice_Per_Unit] = useState(''); 

  // --- 2. States for UI (Dropdown) ---
  const [open, setOpen] = useState(false); // ใช้ open สำหรับ Dropdown เดียว
  const [items, setItems] = useState<Array<{ label: string; value: string }>>([]);
  const [productsLoading, setProductsLoading] = useState(false); 
  
  // --- สถานะโหลดตอนกด "ยืนยัน" ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ดึงข้อมูลสินค้าสำหรับ Dropdown ---
  // --- ดึงข้อมูลสินค้าสำหรับ Dropdown ---
useEffect(() => {
  // 1. เช็คว่า useEffect ทำงานหรือไม่
  console.log("🟢 1. useEffect Triggered"); 
  console.log("   - Token:", token ? "มี Token" : "ไม่มี Token");
  console.log("   - AuthLoading:", authLoading);

  const fetchProductOptions = async () => {
    // 2. เช็คเงื่อนไขก่อน Return
    if (!token || authLoading) {
      console.log("🔴 2. ติดเงื่อนไข Token หรือ Loading -> จบการทำงาน");
      return;
    }

    console.log("🟡 3. กำลังเริ่มยิง API...");
    setProductsLoading(true);
    
    try {
      // ลองใส่ URL เต็มๆ เพื่อเช็คว่าไม่ได้ผิดที่ BaseURL (ถ้าจำเป็น)
      const response = await api.get(`/demands/products`); 
      
      console.log("🟢 4. API Response Success:", response.data); // <--- ข้อมูลต้องโผล่ตรงนี้

      const productList: string[] = response.data;
      const dropdownItems = productList.map(product => ({
        label: product,
        value: product,
      }));

      const fixedItems = [
      { label: 'ทุเรียน', value: 'ทุเรียน' },
      { label: 'มะม่วง', value: 'มะม่วง' },
      { label: 'องุ่น', value: 'องุ่น' },
      { label: 'มังคุด', value: 'มังคุด' },
    ];

    setItems(fixedItems);
    setProductsLoading(false);

    } catch (error: any) {
      console.error("🔴 5. API Error:", error); // <--- ถ้า Error จะโผล่ตรงนี้
      Alert.alert('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถดึงข้อมูลสินค้าได้');
    } finally {
      setProductsLoading(false);
      console.log("⚪ 6. Finished Loading");
    }
  };

  fetchProductOptions();
}, [token, authLoading]);

  // --- 3. ฟังก์ชันสำหรับปุ่ม ---
  const handleCancel = () => {
    // ป้องกันการทำงานขณะ Submit
    if (isSubmitting) return; 
    router.back();
  };

  const handleConfirm = async () => {
    // --- 4. ตรวจสอบข้อมูล ---
    if (!product_name || !quantity_total) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกสินค้าและระบุจำนวน');
      return;
    }

    if (isSubmitting || !token) return; // ป้องกันการกดย้ำ & ต้องมี Token
    setIsSubmitting(true); 

    try {
      await api.post(`/demands`, { 
        product_name: product_name,
        desired_quantity: parseFloat(quantity_total),
        desired_price: price_per_unit ? parseFloat(price_per_unit) : null,
        unit: 'กก.', 
      });

      Alert.alert('ส่งสำเร็จ', 'คำขอของคุณถูกบันทึกแล้ว');
      router.back();

      } catch (error: any) { 
      console.error('Create Demand Failed:', error);
      Alert.alert(
        'เกิดข้อผิดพลาด', 
        error.response?.data?.message || error.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: '' }} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Header Title แบบ Custom ตาม Design */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>ความต้องการ</Text>
          </View>

        <View style={styles.card}>
          {/* --- 1. สินค้า (Dropdown) --- */}
          <Text style={styles.label}>สินค้า</Text>
          <View style={{ zIndex: 2000 }}>
          <CustomDropdown
            open={open}
            setOpen={setOpen}
            value={product_name}
            items={items}
            setValue={setProduct_Name}
            setItems={setItems}
            placeholder="เลือกสินค้าที่ต้องการ"
            style={styles.dropdownStyle} 
            dropDownContainerStyle={styles.dropdownContainerStyle}
            loading={productsLoading}
            disabled={isSubmitting}
            // 🔴 แก้ตรงนี้: เปลี่ยนจาก SCROLLVIEW เป็น MODAL
            listMode="MODAL" 
            // (Optional) ปรับแต่งหัวข้อ Modal ได้
            modalTitle="เลือกสินค้า"
            modalAnimationType="slide"
          />
          </View>

          {/* --- 2. จำนวน (TextInput) --- */}
          <Text style={styles.label}>จำนวน (กิโลกรัม)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุจำนวนที่ต้องการ (กก.)"
            value={quantity_total}
            onChangeText={setQuantity_Total}
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center', // จัดให้อยู่กลางในแนวตั้ง
    paddingBottom: 40,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24, // ความโค้งมนของ Card
    paddingVertical: 40,
    paddingHorizontal: 24,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 30,
    marginTop: 60, // เผื่อพื้นที่ให้ Back Button ด้านบน
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0047AB', // สีน้ำเงินเข้ม (Cobalt Blue) ให้เหมือนรูป
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: '#EFF6FF', // สีฟ้าอ่อนจางๆ (Alice Blue / Light Blue)
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  dropdownStyle: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 0, // ลบขอบออกเพื่อให้เหมือน Input
  },
  dropdownContainerStyle: {
    backgroundColor: '#fff',
    borderColor: '#eee',
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