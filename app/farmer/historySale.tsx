import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import ListingCard from '../../components/ui/ListingCard';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

// 🟢 กำหนด Base URL (Emulator ใช้ 10.0.2.2)
const IMAGE_BASE_URL = 'http://10.0.2.2:3000'; 

export default function HistorySaleScreen() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchMyListings = async () => {
        try {
          setIsLoading(true);
          // (เรียก API ที่ถูกต้องจาก listing.routes.js)
          const response = await api.get('/listings/my-listings'); 
          setListings(response.data);
        } catch (err: any) {
          console.error("Failed to fetch listings:", err.response?.data || err.message);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดประวัติการโพสต์ได้");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMyListings();
    }, []) 
  );

  const handleBack = () => {
      router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#074E9F" />
        <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true }} />

      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#074E9F" /> 
      </TouchableOpacity>

      <FlatList
        style={styles.container}
        data={listings}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>ประวัติการโพสต์ขาย</Text>
        )}
        ListEmptyComponent={() => (
            <View style={styles.center}>
                <Text style={styles.emptyText}>คุณยังไม่มีรายการที่โพสต์ขาย</Text>
            </View>
        )}
        renderItem={({ item }) => {
            // 🟢 Logic จัดการรูปภาพ
            let imagePath = (item.image_url && item.image_url.length > 0) ? item.image_url[0] : null;
            let fullImageUrl = 'https://via.placeholder.com/300?text=No+Image'; 

            if (imagePath) {
                // ลบเครื่องหมายคำพูดและ Backslash
                imagePath = imagePath.replace(/['"]+/g, '').replace(/\\/g, '/');

                if (imagePath.startsWith('content://') || imagePath.startsWith('file://')) {
                    fullImageUrl = imagePath;
                } else if (imagePath.startsWith('http')) {
                    fullImageUrl = imagePath;
                } else {
                    // ถ้าเป็น path บน server
                    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
                    // เช็คว่ามี uploads/ หรือยัง
                    if (cleanPath.startsWith('uploads/')) {
                        fullImageUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
                    } else {
                        fullImageUrl = `${IMAGE_BASE_URL}/uploads/${cleanPath}`; 
                    }
                }
            }

            return (
              <ListingCard
                productName={item.product_name}
                quantity={item.quantity_total}
                unit={item.unit}
                price={item.price_per_unit}
                locationText={item.seller?.address || 'ไม่ระบุที่อยู่'}
                imageUrl={fullImageUrl} // 🟢 ส่ง URL ที่ถูกต้องไปแสดง
              />
            );
        }}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  listContainer: {
    paddingBottom: 24,
    paddingTop: 70,
  },
  backButton: {
    position: 'absolute',
    top: 80, 
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  headerTitleContainer: {
      position: 'absolute',
      top: 150, 
      width: '100%',
      alignItems: 'center',
      alignSelf: 'center',
      zIndex: 5, 
  },
  headerTitle: {
      fontSize: 32, 
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#074E9F',
    marginTop: 70,
    marginBottom: 20,
    marginLeft: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  }
});