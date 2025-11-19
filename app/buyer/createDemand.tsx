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

// Component UI
import CustomDropdown from '../../components/ui/Dropdown';
import CustomModal from '../../components/ui/Modal'; 

import api from '../../services/api';
import { useAuth } from '../context/AuthContext'; 

const CreateDemandScreen = () => {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth(); 

  // --- States for Form Data ---
  const [product_name, setProduct_Name] = useState<string | null>(null);
  const [quantity_total, setQuantity_Total] = useState('');
  const [price_per_unit, setPrice_Per_Unit] = useState(''); 

  // --- States for UI ---
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ label: string; value: string }>>([]);
  const [productsLoading, setProductsLoading] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State สำหรับ Modal แนะนำราคา ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalPrice, setModalPrice] = useState('');     // ราคาต่ำสุด - สูงสุด
  const [modalAvg, setModalAvg] = useState('');         // ✅ เพิ่ม State ราคาเฉลี่ย
  const [modalProduct, setModalProduct] = useState('');
  const [fetchingPrice, setFetchingPrice] = useState(false);

  // ✅ Effect 1: ดึงราคาตลาดจริง (Min, Max, Avg)
  useEffect(() => {
    const fetchMarketPrice = async () => {
      if (!product_name || !token) return;

      setFetchingPrice(true);
      try {
        const response = await api.get('/prices/real-market', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allPrices = response.data;
        const productPrices = allPrices.filter((p: any) => p.product_name === product_name);

        if (productPrices.length > 0) {
          // ดึงราคาออกมาเป็น Array
          const prices = productPrices.map((p: any) => parseFloat(p.average_price));
          
          // 1. หา Min/Max
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);

          // 2. ✅ หาค่าเฉลี่ย (Average)
          const sumPrice = prices.reduce((a: number, b: number) => a + b, 0);
          const avgPrice = (sumPrice / prices.length).toFixed(2); // ทศนิยม 2 ตำแหน่ง

          setModalProduct(product_name);
          setModalAvg(avgPrice); // เซ็ตค่าเฉลี่ย
          
          if (minPrice === maxPrice) {
            setModalPrice(`${minPrice}`);
          } else {
            setModalPrice(`${minPrice} - ${maxPrice}`);
          }
          
          setModalVisible(true);
        } else {
          console.log(`ยังไม่มีประวัติราคาซื้อขายสำเร็จของ ${product_name}`);
        }

      } catch (error) {
        console.error("Failed to fetch market price:", error);
      } finally {
        setFetchingPrice(false);
      }
    };

    fetchMarketPrice();
  }, [product_name, token]);

  // --- Effect 2: ดึงตัวเลือกสินค้า ---
  useEffect(() => {
    const fetchProductOptions = async () => {
      if (!token || authLoading) return;
      setProductsLoading(true);
      try {
        const fixedItems = [
          { label: 'ทุเรียน', value: 'ทุเรียน' },
          { label: 'มะม่วง', value: 'มะม่วง' },
          { label: 'องุ่น', value: 'องุ่น' },
          { label: 'มังคุด', value: 'มังคุด' },
        ];
        setItems(fixedItems);
      } catch (error: any) {
        console.error("API Error:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProductOptions();
  }, [token, authLoading]);

  // --- ฟังก์ชันปุ่ม ---
  const handleCancel = () => {
    if (isSubmitting) return; 
    router.back();
  };

  const handleConfirm = async () => {
    if (!product_name || !quantity_total) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกสินค้าและระบุจำนวน');
      return;
    }

    const qty = parseFloat(quantity_total);
    const price = price_per_unit ? parseFloat(price_per_unit) : 0; 

    if (isNaN(qty)) {
      Alert.alert('ข้อมูลผิดพลาด', 'กรุณาระบุจำนวนเป็นตัวเลขเท่านั้น');
      return;
    }

    if (isSubmitting) return;
    if (!token) {
      Alert.alert('ผิดพลาด', 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setIsSubmitting(true); 

    try {
      const payload = { 
        product_name: product_name,
        desired_quantity: qty,
        desired_price: price,
        unit: 'กก.', 
      };

      await api.post(`/demands`, payload, {
        headers: { Authorization: `Bearer ${token}` } 
      });

      Alert.alert('สำเร็จ', 'คำขอของคุณถูกบันทึกแล้ว', [
        { text: 'ตกลง', onPress: () => router.replace('/buyer/homeBuyer') }
      ]);

    } catch (error: any) { 
      console.error('Create Demand Failed:', error);
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      Alert.alert('เกิดข้อผิดพลาด', serverMessage || 'เซิร์ฟเวอร์ขัดข้อง (500)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: '' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitle}>ความต้องการ</Text>
        </View>

        <View style={styles.card}>
          {/* --- 1. สินค้า --- */}
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
              listMode="MODAL" 
              modalTitle="เลือกสินค้า"
              modalAnimationType="slide"
            />
          </View>

          {/* --- 2. จำนวน --- */}
          <Text style={styles.label}>จำนวน (กิโลกรัม)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุจำนวนที่ต้องการ (กก.)"
            value={quantity_total}
            onChangeText={setQuantity_Total}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          {/* --- 3. ราคาเสนอซื้อ --- */}
          <Text style={styles.label}>เสนอราคา (บาท/กก.)</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="ระบุราคาที่ต้องการ"
            value={price_per_unit}
            onChangeText={setPrice_Per_Unit}
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

      {/* ✅ Modal แสดงราคาตลาด + ราคาเฉลี่ย */}
      <CustomModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>คำแนะนำราคาตลาด</Text>
          <Text style={styles.modalText}>
            อ้างอิงจากการซื้อขายจริงของ{"\n"}
            {modalProduct} มีราคาอยู่ที่{"\n"}
            <Text style={{ fontWeight: 'bold', color: '#28a745', fontSize: 22 }}>
               {modalPrice} บาท/กก.
            </Text>
            {"\n\n"}
            {/* ✅ แสดงราคาเฉลี่ย */}
            <Text style={{ fontSize: 16, color: '#555' }}>
                (ราคาเฉลี่ย: <Text style={{ fontWeight: 'bold', color: '#0056b3' }}>{modalAvg}</Text> บาท)
            </Text>
          </Text>

          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>รับทราบ</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

    </SafeAreaView>
  );
};

// --- Stylesheet ---
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
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 30,
    marginTop: 60,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: '#EFF6FF',
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
    borderWidth: 0,
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
  modalContentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0056b3', 
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#28a745', 
    borderRadius: 25, 
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateDemandScreen;