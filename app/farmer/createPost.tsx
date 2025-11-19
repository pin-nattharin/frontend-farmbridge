import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/ui/Button';
import CustomDropdown from '../../components/ui/Dropdown';
import RoundedInput from '../../components/ui/RoundedInput';
import CustomModal from '../../components/ui/Modal';
import api from '../../services/api';
// ✅ 1. เพิ่ม Import useAuth
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const allGradesData = {
  ทุเรียน: [
    { label: 'เกรด B (ทรงปกติ เปลือกไม่ช้ำมาก)', value: 'เกรด B' },
    { label: 'เกรด C (รูปทรงปกติ มีรอยช้ำเล็กน้อย)', value: 'เกรด C' },
    { label: 'ต่ำกว่าเกรด C (บิดเบี้ยว หนามหัก เปลือกช้ำ)', value: 'เกรดต่ำกว่า C-' },
  ],
  มะม่วง: [
    { label: 'เกรด B (รูปร่างสวย ไม่มีช้ำมาก)', value: 'เกรด B' },
    { label: 'เกรด C (มีรอยช้ำเล็กน้อย)', value: 'เกรด C' },
    { label: 'ต่ำกว่าเกรด C (ช้ำ บิดเบี้ยว)', value: 'เกรดต่ำกว่า C-' },
  ],
  มังคุด: [
    { label: 'เกรด B (เปลือกเรียบ ช้ำเล็กน้อย)', value: 'เกรด B' },
    { label: 'เกรด C (มีรอยช้ำเล็กน้อย)', value: 'เกรด C' },
    { label: 'ต่ำกว่าเกรด C (ช้ำ บิดเบี้ยว)', value: 'เกรดต่ำกว่า C-' },
  ],
  องุ่น: [
    { label: 'เกรด B (ผิวเรียบ มีรอยช้ำเล็กน้อย)', value: 'เกรด B' },
    { label: 'เกรด C (มีรอยช้ำเล็กน้อย)', value: 'เกรด C' },
    { label: 'ต่ำกว่าเกรด C (ช้ำ บิดเบี้ยว)', value: 'เกรดต่ำกว่า C-' },
  ],
};

// (ลบ marketPriceData ออกแล้ว เพราะใช้ API จริงแทน)

export default function CreatePostScreen() {
  const router = useRouter();
  // ✅ 2. ดึง Token มาใช้
  const { token } = useAuth();

  const [image_url, setImage_url] = useState<DocumentPicker.DocumentPickerAsset[] | null>(null);
  const [product_name, setProduct_Name] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [quantity_total, setQuantity_Total] = useState('');
  const [price_per_unit, setPrice_Per_Unit] = useState('');
  const [pickup_date, setPickup_Date] = useState(new Date());
  const [description, setDescription] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [productItems, setProductItems] = useState([
    { label: 'ทุเรียน', value: 'ทุเรียน' },
    { label: 'มะม่วง', value: 'มะม่วง' },
    { label: 'มังคุด', value: 'มังคุด' },
    { label: 'องุ่น', value: 'องุ่น' },
  ]);
  const [gradeItems, setGradeItems] = useState<Array<{label: string, value: string}>>([]);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalPrice, setModalPrice] = useState('');
  const [modalAvg, setModalAvg] = useState(''); // ✅ 3. เพิ่ม State ราคาเฉลี่ย
  const [modalProduct, setModalProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 4. ปรับ Logic การดึงราคาใน useEffect
  useEffect(() => {
    if (product_name) {
      // 4.1 อัปเดตตัวเลือกเกรดสินค้า
      const newGrades = allGradesData[product_name as keyof typeof allGradesData] || [];
      setGradeItems(newGrades);

      // 4.2 ดึงราคาตลาดจริงจาก API
      const fetchMarketPrice = async () => {
        try {
          // ส่ง Token ไปด้วย (ถ้า API ต้องการ)
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const response = await api.get('/prices/real-market', { headers });
          const allPrices = response.data;

          // กรองเฉพาะสินค้าที่เลือก
          const productPrices = allPrices.filter((p: any) => p.product_name === product_name);

          if (productPrices.length > 0) {
            const prices = productPrices.map((p: any) => parseFloat(p.average_price));
            
            // หา Min/Max
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // หาค่าเฉลี่ย
            const sumPrice = prices.reduce((a: number, b: number) => a + b, 0);
            const avgPrice = (sumPrice / prices.length).toFixed(2);

            setModalProduct(product_name);
            setModalAvg(avgPrice); // เซ็ตค่าเฉลี่ย

            if (minPrice === maxPrice) {
              setModalPrice(`${minPrice}`);
            } else {
              setModalPrice(`${minPrice} - ${maxPrice}`);
            }
            
            setModalVisible(true);
          }
        } catch (error) {
          console.log("Failed to fetch market price:", error);
        }
      };

      fetchMarketPrice();

    } else {
      setGradeItems([]);
    }
    setGrade(null); 
  }, [product_name, token]);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'], 
        copyToCacheDirectory: false,
        multiple: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setImage_url(result.assets); 
      } else {
        setImage_url(null); 
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || pickup_date;
    setShowDatePicker(Platform.OS === 'ios'); 
    setPickup_Date(currentDate);
  };

  const handleBack = () => {
        router.back();
    };

  const handlePost = useCallback(async () => {
    if (isLoading) return;

    if (!product_name || !grade || !quantity_total || !price_per_unit || !image_url || image_url.length === 0 || !pickup_date) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลสำคัญ (รูป, ชื่อ, เกรด, จำนวน, ราคา, วันที่) ให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append('product_name', product_name!);
      formData.append('grade', grade!);
      formData.append('quantity_total', quantity_total);
      formData.append('price_per_unit', price_per_unit);
      formData.append('pickup_date', pickup_date.toISOString());
      formData.append('description', description);
      formData.append('unit', 'กก.');

      if (image_url) {
        image_url.forEach((file, index) => {
            const fileType = file.mimeType || 'image/jpeg';
            const fileName = file.name || `photo_${index}.jpg`;

            formData.append('images', {
                uri: file.uri,
                name: fileName,
                type: fileType,
            } as any); 
        });
      }

      await api.post('/listings', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              ...(token ? { Authorization: `Bearer ${token}` } : {}), // เพิ่ม Token ถ้ามี
          },
      });

      setIsLoading(false);
      Alert.alert('โพสต์สำเร็จ!', 'ข้อมูลประกาศของคุณถูกบันทึกแล้ว');
      router.back();

    } catch (err: any) {
      setIsLoading(false);
      console.error('Post failed:', err.response?.data || err.message);
      Alert.alert('โพสต์ไม่สำเร็จ', err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  }, [
    isLoading, image_url, product_name, grade, 
    quantity_total, price_per_unit, pickup_date, 
    description, router, gradeItems, token
  ]);


  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0056b3" />
        </TouchableOpacity>

        <View style={styles.uploadContainer}>

          <Button
              title={isLoading ? 'กำลังโพสต์...' : 'โพสต์'} 
              onPress={handlePost} 
              variant="default"
              style={{ 
                marginTop: 30,
                marginVertical: 20,
                marginRight: 10,
                paddingVertical: 8,
                paddingHorizontal: 16,
                width: 100,
                alignSelf: 'flex-end',
              }}
              disabled={isLoading} 
            />

          <Text style={styles.label}>รูปภาพสินค้า</Text>
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={pickImage}
          >
            {image_url && image_url.length > 0 ? (
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="check-circle" size={40} color="#28a745" />
                <Text style={styles.fileNameText} numberOfLines={1}>
                  {image_url.length} รูปที่เลือก
                </Text>
                <Text style={styles.uploadText}>(คลิกเพื่อเปลี่ยน)</Text>
              </View>
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={36} color="#A0AEC0" />
                <Text style={styles.uploadText}>
                  คลิกเพื่ออัปโหลดรูปภาพ
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>ชื่อสินค้า</Text>
        <CustomDropdown
          open={openDropdown === 'product'}
          setOpen={(isOpen) => setOpenDropdown(isOpen ? 'product' : null)}
          value={product_name}
          items={productItems}
          setValue={setProduct_Name}
          setItems={setProductItems}
          placeholder="เลือกชื่อสินค้า"
          containerStyle={{ zIndex: 1000, marginVertical: 8 }} 
        />

        <Text style={styles.label}>เกรดสินค้า</Text>
        <CustomDropdown
          open={openDropdown === 'grade'}
          setOpen={(isOpen) => setOpenDropdown(isOpen ? 'grade' : null)}
          value={grade} 
          items={gradeItems}
          setValue={setGrade}
          setItems={setGradeItems}
          placeholder="เลือกเกรดสินค้า"
          containerStyle={{ zIndex: 900, marginVertical: 8 }}
          disabled={!product_name} 
          disabledStyle={{ backgroundColor: '#F0F0F0' }}
        />

        <RoundedInput
          label="จำนวน (กิโลกรัม)"
          placeholder="ระบุจำนวน"
          value={quantity_total}
          onChangeText={setQuantity_Total}
          keyboardType="numeric"
        />

        <RoundedInput
        label="ราคา/กิโลกรัม (บาท)"
          placeholder="ระบุราคา"
          value={price_per_unit}
          onChangeText={setPrice_Per_Unit}
          keyboardType="numeric"
        />

        <Text style={styles.label}>วันที่สะดวกให้ผู้ซื้อมารับ</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>
            {pickup_date.toLocaleDateString('th-TH')}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={pickup_date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}

        <RoundedInput
          label="รายละเอียดเพิ่มเติม"
          placeholder="เช่น สถานที่รับ, เวลา..."
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 16 }}
        />

      </ScrollView>
      
      {/* ✅ 5. ปรับปรุง Modal แสดงราคาตลาดจริง + ค่าเฉลี่ย */}
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
            (ราคาเฉลี่ย: <Text style={{ fontWeight: 'bold', color: '#0056b3' }}>{modalAvg}</Text> บาท)
          </Text>
          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>ตกลง</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4', 
  },
  contentContainer: {
    padding: 20,
    backgroundColor: 'white', 
    margin: 16,
    borderRadius: 12,
  },
  backButton: {
        position: 'absolute',
        top: 50,
        left: 15,
        zIndex: 10,
        padding: 5,
    },
  
  uploadContainer: {
    marginBottom: 20, 
  },
  uploadBox: {
    height: 120,
    borderWidth: 1,
    borderColor: '#A0AEC0',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 5, 
  },
  fileNameText: {
      fontSize: 14,
      color: '#2D3748',
      fontWeight: 'bold',
      textAlign: 'center',
      paddingHorizontal: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10, 
    marginBottom: 4, 
  },
  datePickerButton: {
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#0052CC',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
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