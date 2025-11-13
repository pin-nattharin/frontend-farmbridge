import React from 'react';
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

// กำหนด Types สำหรับ Props ที่จะรับเข้ามา
interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>; // Style สำหรับตัวปุ่ม
  textStyle?: StyleProp<TextStyle>; // Style สำหรับตัวหนังสือ
  // <<< แก้ไข: เพิ่ม 'confirm' และ 'cancel' เข้าไปใน type
  variant?: 'default' | 'ghost' | 'cancel' | 'banner';
  disabled?: boolean;
}

const Button = ({ title, onPress, style, textStyle, variant = 'default' }: ButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        styles[variant], // ใช้ style ตาม variant
        pressed && styles.pressed, // เมื่อถูกกด
        style, // Style ที่ส่งมาจากข้างนอก
      ]}
      onPress={onPress}
    >
      {/* * สำคัญ: ถ้า variant เป็น 'default' แต่ไม่มี styles.text_default
        * มันจะ error ครับ เราต้องแก้ให้ครบ
      */}
      <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7, // ทำให้จางลง 70% เมื่อกด
  },

  // --- Styles for Variants ---

  // <<< แก้ไข: เพิ่ม 'default' styles ที่หายไปกลับเข้ามา
  default: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
  },
  text_default: {
    color: '#FFFFFF',
  },
  // ---------------------------------------------

  cancel: {
    backgroundColor: 'transparent',
    borderColor: '#22AB67', // ขอบสีเขียวเหมือนปุ่มยืนยัน
  },
  text_cancel: {
    color: '#22AB67', // ข้อความสีเขียว
  },

  banner: {
    backgroundColor: '#074E9F',
    borderColor: '#074E9F',
    borderRadius: 50,
  },
  text_banner: {
    color: '#ffffffff',
  },

  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  text_ghost: {
    color: '#22AB67',
  },
});

export default Button;