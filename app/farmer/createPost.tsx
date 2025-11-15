import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// 🟢 1. เปลี่ยน Imports
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Platform,
  ScrollView, // (Import ScrollView)
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 🟢 2. เพิ่ม Import ไอคอน
import { MaterialIcons } from '@expo/vector-icons'; 

// (Import Components และ api เหมือนเดิม)
import Button from '../../components/ui/Button';
import CustomDropdown from '../../components/ui/Dropdown';
import RoundedInput from '../../components/ui/RoundedInput';
import CustomModal from '../../components/ui/Modal';
import api from '../../services/api';

// (Data ทั้งหมดเหมือนเดิม)
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
const priceSuggestionData = {
  durian: '100-120',
  mango: '14-17', // (อ้างอิงจากรูป UI ของคุณ)
  mangosteen: '35-45',
  grape: '80-90',
};
const productLabels = {
  durian: 'ทุเรียน',
  mango: 'มะม่วง',
  mangosteen: 'มังคุด',
  grape: 'องุ่น',
};

export default function CreatePostScreen() {
  const router = useRouter();

  // (States ทั้งหมดเหมือนเดิม - ใช้ image_url ถูกต้องแล้ว)
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
  const [modalProduct, setModalProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // (useEffect, pickImage, onDateChange - เหมือนเดิม)
  useEffect(() => {
    if (product_name) {
      const newGrades = allGradesData[product_name as keyof typeof allGradesData] || [];
      setGradeItems(newGrades);
      const price = priceSuggestionData[product_name as keyof typeof priceSuggestionData];
      const label = productLabels[product_name as keyof typeof productLabels];
      if (price && label) {
        setModalProduct(label);
        setModalPrice(price);
        setModalVisible(true); 
      }
    } else {
      setGradeItems([]);
    }
    setGrade(null); 
  }, [product_name]);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'], 
        copyToCacheDirectory: false,
        multiple: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setImage_url(result.assets); //
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

  // 🟢 3. แก้ไข handlePost
  const handlePost = useCallback(async () => {
    if (isLoading) return;

    // (ตรวจสอบข้อมูล - ใช้ image_url ถูกต้อง)
    if (!product_name || !grade || !quantity_total || !price_per_unit || !image_url || image_url.length === 0 || !pickup_date) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลสำคัญ (รูป, ชื่อ, เกรด, จำนวน, ราคา, วันที่) ให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    // 🟢 4. (แก้ไข) เปลี่ยน .now() เป็น .name
    const simulated_image_url = image_url.map(file => {
        return `https://example.com/${file.name}`;
});
    // (postData และ ยิง API - เหมือนเดิม)
    const postData = {
      product_name: product_name,
      grade: grade,
      quantity_total: parseFloat(quantity_total),
      price_per_unit: parseFloat(price_per_unit),
      pickup_date: pickup_date.toISOString(),
      description: description,
      image_urls: simulated_image_url, 
      unit: 'กก.',
    };
    try {
      await api.post('/api/listings', postData); 
      setIsLoading(false);
      Alert.alert('โพสต์สำเร็จ!', 'ข้อมูลประกาศของคุณถูกบันทึกแล้ว');
      router.back(); 
    } catch (err: any) {
      setIsLoading(false);
      console.error('Post failed:', err.response?.data || err.message);
      Alert.alert(
        'โพสต์ไม่สำเร็จ',
        err.response?.data?.message || 'เกิดข้อผิดพลาด'
      );
    }
  }, [
    // (Dependencies - ใช้ image_url ถูกต้อง)
    isLoading, image_url, product_name, grade, 
    quantity_total, price_per_unit, pickup_date, 
    description, router, gradeItems 
  ]);


  return (
    <>
    <Stack.Screen
        options={{
          title: 'ฟีเจอร์ประกาศขาย',
          headerBackTitle: 'กลับ',
          headerRight: () => (
            <Button
              title={isLoading ? 'กำลังโพสต์...' : 'โพสต์'} 
              onPress={handlePost} 
              variant="default"
              style={{ 
                marginVertical: 0,
                marginRight: 10,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
              disabled={isLoading} 
            />
          ),
        }}
      />
      
      {/* 🟢 5. (สำคัญ) เพิ่ม ScrollView ห่อฟอร์ม */}
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* 🟢 6. (แก้ไข) UI ปุ่มเลือกรูป (เปลี่ยน selectedFile -> image_url) */}
        <View style={styles.uploadContainer}>
          <Text style={styles.label}>รูปภาพสินค้า</Text>
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={pickImage}
          >
            {image_url && image_url.length > 0 ? ( // 👈 แก้ไข
              <>
                <Text style={styles.fileNameText} numberOfLines={2}>
                  เลือกแล้ว: {image_url.length} รูป {/* 👈 แก้ไข */}
                </Text>
                <Text style={styles.uploadText}>
                  (คลิกเพื่อเปลี่ยนไฟล์)
                </Text>
              </>
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

        {/* (Dropdowns และ Inputs ที่เหลือเหมือนเดิม) */}
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
      
      {/* (Modal เหมือนเดิม) */}
      <CustomModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>คำแนะนำ</Text>
          <Text style={styles.modalText}>
            5 วันที่ผ่านมา {modalProduct} มีราคาอยู่ที่ {modalPrice} บาท/กิโลกรัม
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

// --- 4. Styles ---
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
  
  // 🟢 7. (Styles รูปภาพใหม่)
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

  // (Styles ที่เหลือเหมือนเดิม)
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