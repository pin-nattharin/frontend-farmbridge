import React, { ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CustomModalProps {
  isVisible: boolean; // state ที่บอกว่า modal เปิดหรือปิด
  onClose: () => void; // ฟังก์ชันที่จะรันเมื่อกดปิด
  children: ReactNode; // เนื้อหาที่จะแสดงข้างใน
  title?: string; // (Optional) หัวข้อ
}

const CustomModal = ({ isVisible, onClose, children, title }: CustomModalProps) => {
  return (
    <Modal
      transparent={true} // ***สำคัญมาก: ต้องเป็น true เพื่อให้เราสร้าง backdrop เองได้
      visible={isVisible}
      animationType="slide" // หรือ "fade"
      onRequestClose={onClose} // สำหรับปุ่ม Back ของ Android
    >
      {/* 1. Backdrop (พื้นที่สีเทาๆ ด้านหลัง) */}
      <View style={styles.backdrop}>
        {/* 2. Modal Content (กล่องสีขาวตรงกลาง) */}
        <View style={styles.modalContainer}>
          {/* (Optional) Title Bar */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* (Optional) Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          {/* 3. เนื้อหาหลักที่ส่งเข้ามา */}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // สีดำโปร่งแสง 50%
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  content: {
    marginTop: 10,
  },
});

export default CustomModal;