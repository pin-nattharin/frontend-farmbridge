import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import ListingCard from '../../components/ui/ListingCard';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';


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
          const response = await api.get('/api/listings/my-listings'); 
          setListings(response.data);
        } catch (err: any) {
          console.error("Failed to fetch listings:", err.response?.data || err.message);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดประวัติการโพสต์ได้");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMyListings();
    }, []) // Dependency array ของ useCallback
  );

  //สร้างฟังก์ชันสำหรับปุ่มย้อนกลับ
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

  // (ในแอปจริง: ให้ใช้ useEffect fetch ข้อมูลจาก /api/listings)

  return (
    <>
      <Stack.Screen options={{ title: '',
        headerTransparent: true,
      }} />

      {/* 🟢 3. เพิ่มปุ่มย้อนกลับและ Text Header เอง */}
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#074E9F" /> 
      </TouchableOpacity>

      <FlatList
        style={styles.container}
        data={listings}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>ประวัติการโพสต์ขาย</Text>
        )}
        // 🟢 8. (ตัวเลือก) UI ตอนไม่มีข้อมูล
        ListEmptyComponent={() => (
            <View style={styles.center}>
                <Text style={styles.emptyText}>คุณยังไม่มีรายการที่โพสต์ขาย</Text>
            </View>
        )}
        renderItem={({ item }) => (
          <ListingCard
            productName={item.product_name}
            quantity={item.quantity_total}
            unit={item.unit}
            price={item.price_per_unit}
            locationText={item.seller?.address || 'ไม่ระบุที่อยู่'}
            imageUrl={item.image_url && item.image_url.length > 0 ? item.image_url[0] : null} 
          />
        )}
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
      top: 150, // ปรับตำแหน่งให้เหมาะสม
      width: '100%',
      alignItems: 'center',
      alignSelf: 'center',
      zIndex: 5, // ให้ Header อยู่ด้านบนกว่า List
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
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 110,
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