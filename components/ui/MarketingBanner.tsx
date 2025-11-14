import React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType } from 'react-native';import { Image } from 'react-native';

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import Button from './Button'; 

interface MarketingBannerProps {
  onPress: () => void; // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม "ขายเลย ตอนนี้!"
  imageSource: ImageSourcePropType; // URL รูปภาพพื้นหลัง (ไร่นา/เกษตรกร)
}

const MarketingBanner: React.FC<MarketingBannerProps> = ({ 
  onPress, 
  imageSource
}) => {
  return (
    <View style={styles.bannerArea}>
      
      {/* 1. รูปภาพพื้นหลัง */}
      <Image
        source={imageSource} 
        style={styles.bannerImage}
        resizeMode="cover"
      />
      
      {/* 2. ส่วน Content (ข้อความและปุ่ม) */}
      <View style={styles.bannerContent}>
        <Text style={styles.bannerText}>พืชผลยังดี ต้องมีคนเห็น</Text>
        
        {/* ใช้ Button component ที่มี variant='banner' */}
        <Button 
          title="ขายเลย ตอนนี้!" 
          onPress={onPress} 
          variant="banner" 
          style={styles.bannerButton}
          textStyle={styles.bannerButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerArea: {
    height: 190,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    // เงาอ่อนๆ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Overlay สีดำจางๆ เพื่อให้ข้อความอ่านง่าย
  },
  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginRight: 150,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerButton: {
    // Override marginVertical เริ่มต้นของ Button
    marginVertical: 0, 
    marginRight: 220,
    height: 40,
    width: 120,
    // ใช้สไตล์ของ variant='banner' ที่กำหนดใน Button.tsx
  },
  bannerButtonText: {
    fontSize: 12, 
    fontWeight: 'bold',
    margin: -10,
  },
});

export default MarketingBanner;