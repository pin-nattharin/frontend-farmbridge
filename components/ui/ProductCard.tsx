import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
// Platform ต้องถูก Import เพื่อใช้สำหรับเงา (Shadow/Elevation)
import { MaterialIcons } from '@expo/vector-icons'; // ใช้สำหรับไอคอนตำแหน่ง

// 1. กำหนด Interface สำหรับ Props
interface ProductCardProps {
  productName: string;
  price: number;
  unit: string; // เช่น 'กก.'
  grade: string; // เช่น 'เกรด C'
  distance: string; // เช่น '2.5 กม.'
  imageUrl: string; // URL ของรูปภาพสินค้า
  onPress: () => void; // ฟังก์ชันที่จะทำงานเมื่อกดที่การ์ด
  style?: ViewStyle;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productName,
  price,
  unit,
  grade,
  distance,
  imageUrl,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {/* ส่วนแสดงรูปภาพสินค้า */}
      <View style={styles.imageContainer}>
        {/* ใช้ Image.source.uri สำหรับรูปภาพจาก URL */}
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.productImage} 
        />
        {/* แถบเกรดสินค้า */}
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>{grade}</Text>
        </View>
      </View>

      {/* ส่วนแสดงรายละเอียดสินค้า */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {productName}
        </Text>
        
        {/* ราคาและระยะทาง */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            <Text style={styles.priceValue}>{price}</Text> บาท/{unit}
          </Text>
          
          <View style={styles.distanceContainer}>
            <MaterialIcons name="place" size={14} color="#074E9F" />
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 2. กำหนด Styles
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#074E9F', // สีขอบตามภาพ
    borderWidth: 1,
    overflow: 'hidden', 
    margin: 8, // Margin รอบการ์ดแต่ละใบ
    width: 160, // กำหนดความกว้างคงที่
    height: 160, // เพิ่มความสูงรวมเล็กน้อยเพื่อให้รายละเอียดไม่เบียดกันมาก
    // เงาพื้นฐาน
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 100, // ความสูงของรูปภาพ
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: "100%",
    resizeMode: 'cover',
  },
  gradeBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38A169', // สีเขียว
  },
  detailsContainer: {
    padding: 10, // เพิ่ม padding เล็กน้อย
    flex: 1, // ให้ส่วนนี้ขยายเต็มพื้นที่ที่เหลือ
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceText: {
    fontSize: 12,
    color: '#718096',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#074E9F', // สีเข้ม
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 2,
  },
  distanceText: {
    fontSize: 10,
    color: '#074E9F',
    marginLeft: 2,
    
  },
});

export default ProductCard;