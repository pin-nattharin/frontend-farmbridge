import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import Components ที่เราสร้างไว้
import Button from '../../components/ui/Button';
import CustomDropdown from '../../components/ui/Dropdown';
import RoundedInput from '../../components/ui/RoundedInput';
import CustomModal from '../../components/ui/Modal';

const allGradesData = {
  durian: [
    { label: 'เกรด B (ทรงปกติ เปลือกไม่ช้ำมาก)', value: 'B' },
    { label: 'เกรด C (รูปทรงปกติ มีรอยช้ำเล็กน้อย)', value: 'C' },
    { label: 'ต่ำกว่าเกรด C (บิดเบี้ยว หนามหัก เปลือกช้ำ)', value: 'C-' },
  ],
  mango: [
    { label: 'เกรด B (รูปร่างสวย ไม่มีช้ำมาก)', value: 'B' },
    { label: 'เกรด C (มีรอยช้ำเล็กน้อย)', value: 'C' },
    { label: 'ต่ำกว่าเกรด C (ช้ำ บิดเบี้ยว)', value: 'C-' },
  ],
  mangosteen: [
    { label: 'เกรด B (เปลือกเรียบ ช้ำเล็กน้อย)', value: 'B' },
    { label: 'เกรด C (มีรอยช้ำเล็กน้อย)', value: 'C' },
    { label: 'ต่ำกว่าเกรด C (ช้ำ บิดเบี้ยว)', value: 'C-' },
  ],
  grape: [
    { label: 'เกรด B (ผิวเรียบ มีรอยช้ำเล็กน้อย)', value: 'B' },
    { label: 'เกรด C (มีรอยช้ำเล็กน้อย)', value: 'C' },
    { label: 'ต่ำกว่าเกรด C (ช้ำ บิดเบี้ยว)', value: 'C-' },
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

  // --- States for Form Data ---
  const [image_url, setImage_Url] = useState<string | null>(null);
  const [product_name, setProduct_Name] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [quantity_total, setQuantity_Total] = useState('');
  const [price_per_unit, setPrice_Per_Unit] = useState('');
  const [pickup_date, setPickup_Date] = useState(new Date());
  const [description, setDescription] = useState('');
  //const [allowNegotiation, setAllowNegotiation] = useState(false);

  // --- States for UI (Dropdowns, DatePicker) ---
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Dropdown Items (ตัวอย่าง) ---
  const [productItems, setProductItems] = useState([
    { label: 'ทุเรียน', value: 'durian' },
    { label: 'มะม่วง', value: 'mango' },
    { label: 'มังคุด', value: 'mangosteen' },
    { label: 'องุ่น', value: 'grape' },
  ]);
  const [gradeItems, setGradeItems] = useState<Array<{label: string, value: string}>>([]);

  // 4. (ใหม่) เพิ่ม State สำหรับ Modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalPrice, setModalPrice] = useState('');
  const [modalProduct, setModalProduct] = useState('');

  useEffect(() => {
    if (product_name) {
      const newGrades = allGradesData[product_name as keyof typeof allGradesData] || [];
      setGradeItems(newGrades);

      // --- ส่วนที่เพิ่มเข้ามาสำหรับ Modal ---
      const price = priceSuggestionData[product_name as keyof typeof priceSuggestionData];
      const label = productLabels[product_name as keyof typeof productLabels];

      if (price && label) {
        setModalProduct(label);
        setModalPrice(price);
        setModalVisible(true); // <-- สั่งให้ Modal แสดง!
      }

    } else {
      setGradeItems([]);
    }

    setGrade(null); 

  }, [product_name]);

  // --- Function: เลือกรูปภาพ ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage_Url(result.assets[0].uri);
    }
  };

  // --- Function: เลือกวันที่ ---
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || pickup_date;
    setShowDatePicker(Platform.OS === 'ios'); // บน iOS ปิดทันที
    setPickup_Date(currentDate);
  };

  // --- Function: กดโพสต์ ---
  const handlePost = () => {
    // รวบรวมข้อมูลทั้งหมด
    const postData = {
      image_url,
      product_name,
      grade,
      quantity_total,
      price_per_unit,
      pickupDate: pickup_date.toISOString(),
      description,
      //allowNegotiation,
    };
    console.log('Post Data:', postData);
    Alert.alert('โพสต์สำเร็จ!', 'ข้อมูลประกาศของคุณถูกบันทึกแล้ว');
    router.back(); // กลับไปหน้าก่อนหน้า
  };

/*   const handleOpenProductDropdown = React.useCallback(
  (isOpen: boolean) => {
    setOpenDropdown(isOpen ? 'product' : null);
  },
  []
);

  const handleOpenGradeDropdown = React.useCallback(
  (isOpen: boolean) => {
    setOpenDropdown(isOpen ? 'grade' : null);
  },
  []
); */

  return (
    <>
      {/* 1. ส่วน Header (จัดการโดย Expo Router) */}
      <Stack.Screen
        options={{
          title: 'ฟีเจอร์ประกาศขาย',
          headerBackTitle: 'กลับ',
          headerRight: () => (
            <Button
              title="โพสต์"
              onPress={handlePost}
              variant="default"
              style={{ 
                marginVertical: 0,
                marginRight: 10,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
              />
          ),
        }}
      />
      
      {/* 2. ส่วน Form */}
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* --- เลือกรูปภาพ --- */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image_url ? (
            <Image source={{ uri: image_url }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>+ เพิ่มรูปภาพสินค้า</Text>
          )}
        </TouchableOpacity>

        {/* --- ชื่อสินค้า (Dropdown) --- */}
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

        {/* --- เกรดสินค้า (Dropdown) --- */}
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
         // ⬇️ 8. (สำคัญ) ปิดการใช้งาน Dropdown นี้ ถ้ายังไม่เลือกสินค้า
          disabled={!product_name} 
          disabledStyle={{ backgroundColor: '#F0F0F0' }}
        />

        {/* --- จำนวน --- */}
        <RoundedInput
          label="จำนวน (กิโลกรัม)"
          placeholder="ระบุจำนวน"
          value={quantity_total}
          onChangeText={setQuantity_Total}
          keyboardType="numeric"
        />

        {/* --- ราคา/กิโลกรัม --- */}
        <RoundedInput
        label="ราคา/กิโลกรัม (บาท)"
          placeholder="ระบุราคา"
          value={price_per_unit}
          onChangeText={setPrice_Per_Unit}
          keyboardType="numeric"
        />

        {/* --- วันที่สะดวก --- */}
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

        {/* --- รายละเอียดเพิ่มเติม --- */}
        <RoundedInput
          label="รายละเอียดเพิ่มเติม"
          placeholder="เช่น สถานที่รับ, เวลา..."
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 16 }}
        />

        {/* --- Checkbox ต่อรองราคา --- */}
        {/* <View style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={allowNegotiation}
            onValueChange={setAllowNegotiation}
            color={allowNegotiation ? '#28A745' : undefined}
          />
          <Text style={styles.checkboxLabel}>เปิดต่อรองราคา</Text>
        </View> */}

      </ScrollView>
      {/* 6. (ใหม่) เพิ่ม Modal เข้ามาที่นี่ */}
      <CustomModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)}
      >
        {/* นี่คือเนื้อหาที่จะแสดงใน Modal (Children) */}
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
    backgroundColor: '#F4F4F4', // พื้นหลังสีเทาอ่อนแบบในรูป
  },
  contentContainer: {
    padding: 20,
    backgroundColor: 'white', // พื้นที่ฟอร์มสีขาว
    margin: 16,
    borderRadius: 12,
  },
  // Image Picker
  imagePicker: {
    height: 200,
    width: '100%',
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden', // กันรูปทะลุขอบ
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: '#0052CC',
    fontSize: 16,
  },
  // Form Labels
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10, // ระยะห่างบน
    marginBottom: 4, // ระยะห่างล่าง (ก่อน input)
  },
  // Date Picker
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
  // Checkbox
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
    color: '#0056b3', // (สีน้ำเงินตาม UI)
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
    backgroundColor: '#28a745', // (สีเขียวตาม UI)
    borderRadius: 25, // (ทำให้ขอบมน)
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});