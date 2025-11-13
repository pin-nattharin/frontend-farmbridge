import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// 1. Import คอมโพเนนต์ที่เราสร้างเอง
// (เราถอยหลัง 1 ชั้นจาก `app` เพื่อไปหา `components`)
import Button from '../components/ui/Button';
import Customdropdown from '../components/ui/Dropdown';
import CustomModal from '../components/ui/Modal';

// 2. Import Dropdown จาก Library
//import DropDownPicker from 'react-native-dropdown-picker';

export default function TestComponentsScreen() {
  // --- State สำหรับ Modal ---
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- State สำหรับ Dropdown ---
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null); // ค่าที่ถูกเลือก
  const [items, setItems] = useState([
    { label: 'ตัวเลือก 1 (เกษตรกร)', value: 'farmer' },
    { label: 'ตัวเลือก 2 (ผู้ซื้อ)', value: 'buyer' },
    { label: 'ตัวเลือก 3 (อื่นๆ)', value: 'other' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>หน้าทดสอบ UI Components</Text>

      {/* --- 1. ทดสอบ Button --- */}
      <Text style={styles.subtitle}>ทดสอบ Button</Text>
      <Button
        title="เปิด Modal"
        onPress={() => setIsModalVisible(true)} // กดเพื่อเปิด Modal
        variant="default" // ลองเปลี่ยนเป็น 'outline' หรือ 'ghost'
      />
      <Button
        title="ปุ่มแบบ Outline"
        onPress={() => alert('Pressed Outline!')}
        variant="cancel"
      />
      <Button
        title="banner"
        onPress={() => alert('Pressed Outline!')}
        variant="banner"
      />

      {/* --- 2. ทดสอบ Dropdown --- */}
      <Text style={styles.subtitle}>ทดสอบ Dropdown</Text>
      {/* สำคัญ: Dropdown มักจะต้องอยู่บนสุด
        เราจึงใช้ zIndex: 1000 เพื่อให้มันลอยทับ Button
      */}
      <Customdropdown
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="กราฟราคา"
        containerStyle={{ zIndex: 1000 }} // ส่ง zIndex ผ่าน containerStyle
      />

      {/* --- 3. ทดสอบ Modal --- */}
      <CustomModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)} // ส่งฟังก์ชันปิดไป
        title="นี่คือ Modal"
      >
        {/* นี่คือ {children} ที่จะไปแสดงใน Modal */}
        <Text>คุณสามารถใส่เนื้อหาอะไรก็ได้ในนี้</Text>
        <Text>เช่น ข้อตกลง, แบบฟอร์ม, หรือคำยืนยัน</Text>
        <Button
          title="ปิด"
          onPress={() => setIsModalVisible(false)}
          variant="default"
          style={{ marginTop: 20 }}
        />
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
});