import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import ListingCard from '../../components/ui/ListingCard';

// --- Mock Data (ข้อมูลจำลอง) ---
const mockListings = [
  {
    id: 1,
    productName: 'มะม่วง',
    quantity: 30,
    unit: 'กิโลกรัม',
    price: 30,
    imageUrl: 'https://i.imgur.com/g8I4mN8.jpeg',
    locationText: 'สหกรณ์ฟาร์ม อ.ฝาง, จ.เชียงใหม่',
  },
  {
    id: 2,
    productName: 'ทุเรียน',
    quantity: 20,
    unit: 'กิโลกรัม',
    price: 120,
    imageUrl: 'https://i.imgur.com/k6a2m0e.jpeg',
    locationText: 'แฮปปี้ฟาร์ม อ.ดอยหล่อ, จ.เชียงใหม่',
  },
];

export default function MarketHomeScreen() {
  const [listings, setListings] = useState(mockListings);

  // (ในแอปจริง: ให้ใช้ useEffect fetch ข้อมูลจาก /api/listings)

  return (
    <>
      <Stack.Screen options={{ title: 'ประวัติการโพสต์ขาย' }} />
      <FlatList
        style={styles.container}
        data={listings}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>ประวัติการโพสต์ขาย</Text>
        )}
        renderItem={({ item }) => (
          <ListingCard
            productName={item.productName}
            quantity={item.quantity}
            unit={item.unit}
            price={item.price}
            locationText={item.locationText}
            imageUrl={item.imageUrl} 
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
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#074E9F',
    marginTop: 30,
    marginBottom: 50,
    marginLeft: 110,
  },
});