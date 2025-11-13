import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import ไอคอน (ต้องติดตั้ง @expo/vector-icons)

// 1. กำหนด Interface สำหรับ Props ที่การ์ดนี้จะรับ
export interface ListingCardProps {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  locationText: string;
  imageUrl: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
  productName,
  quantity,
  unit,
  price,
  locationText,
  imageUrl,
}) => {
  return (
    <View style={styles.card}>
      {/* 1. รูปภาพ */}
      <Image
        source={{ uri: imageUrl }} 
        style={styles.image}
      />
      
      {/* 2. รายละเอียด */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{productName}</Text>
        
        <Text style={styles.details} numberOfLines={1}>
          จำนวน : {quantity} {unit}
        </Text>
        
        <Text style={styles.details} numberOfLines={1}>
          ในราคา {price} บาท/{unit}
        </Text>
        
        {/* 3. พิกัด */}
        <View style={styles.locationRow}>
          <MaterialIcons name="location-pin" size={16} color="#074E9F" />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
      </View>
    </View>
  );
};

// 3. Stylesheet ที่ออกแบบตามรูป
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 16,
  },
  image: {
    width: 110,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  infoContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#074E9F',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#074E9F',
    marginLeft: 4,
    flex: 1, 
  },
});

export default ListingCard;