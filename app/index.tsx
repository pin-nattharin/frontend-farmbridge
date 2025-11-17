import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import SearchBar from '../components/ui/SearchBar';
import MarketingBanner from '../components/ui/MarketingBanner';
import CustomDropdown from '../components/ui/Dropdown';
import ProductCard from '../components/ui/ProductCard'; 
import BottomNavbar from '../components/ui/BottomNavbar'; // *** 1. Import Navbar ***

import api from '../services/api'; 
import { useAuth } from './context/AuthContext'; 

interface Listing {
    id: string;
    product_name: string;
    price_per_unit: number;
    unit: string;
    grade: string | null;
    image_url: string[] | null;
    seller: {
        fullname: string;
        address: string;
    };
    distance_km: number | null;
}

// 1. ข้อมูลสำหรับ Dropdown
const typeItems = [
    { label: 'ทุกประเภท', value: 'all' },
    { label: 'ทุเรียน', value: 'ทุเรียน' },
    { label: 'มะม่วง', value: 'มะม่วง' },
    { label: 'องุ่น', value: 'องุ่น' },
    { label: 'มังคุด', value: 'มังคุด' },
];

const areaItems = [
    { label: 'ทุกพื้นที่', value: 'all' },
    { label: '5 กม.', value: '5' },     
    { label: '20 กม.', value: '20' },    
    { label: '30 กม.', value: '30' },
    { label: '50 กม.', value: '50' },
];

const priceItems = [
    { label: 'ราคา', value: 'all' },
    { label: 'ต่ำ-สูง', value: 'price_asc' },
    { label: 'สูง-ต่ำ', value: 'price_desc' },
];


// ----------------------------------------------------
// HOMESCREEN COMPONENT
// ----------------------------------------------------

const HomeScreen: React.FC = () => {

    const router = useRouter();
    const { token, user } = useAuth();

    // *** State สำหรับ Navbar ***
    const [activeTab, setActiveTab] = useState<'home' | 'add' | 'profile'>('home');
    const [listings, setListings] = useState<Listing[]>([]); 
    const [isFetching, setIsFetching] = useState(true);

    // State สำหรับจัดการ Dropdown (ใช้ string)
    const [typeOpen, setTypeOpen] = useState(false);
    const [typeValue, setTypeValue] = useState<string | null>('all');
    const [typeItemsState, setTypeItemsState] = useState(typeItems);

    const [areaOpen, setAreaOpen] = useState(false);
    const [areaValue, setAreaValue] = useState<string | null>('all');
    const [areaItemsState, setAreaItemsState] = useState(areaItems);

    const [priceOpen, setPriceOpen] = useState(false);
    const [priceValue, setPriceValue] = useState<string | null>('all');
    const [priceItemsState, setPriceItemsState] = useState(priceItems);

    const [distanceOpen, setDistanceOpen] = useState(false);

    const IMAGE_BASE_URL = 'http://10.0.2.2:3000'; 

    // 🚨 [NEW FUNCTION] ดึงรายการสินค้าทั้งหมด (Public Route: /listings)
    const fetchListings = useCallback(async () => {
        setIsFetching(true);
        try {
            const params: { product_name?: string, status?: string, distance?: string } = {
                status: 'available'
            };
            
            if (typeValue && typeValue !== 'all') {
                params.product_name = typeValue;
            }
            const response = await api.get('/listings/all', { params }); 
            let data: Listing[] = response.data;

            // 🚨 เพิ่มการส่ง distance 
            if (areaValue && areaValue !== 'all') {
                const maxDistance = parseInt(areaValue);
                data = data.filter(item => {
                    // กรองเฉพาะที่มี distance_km และน้อยกว่าระยะที่กำหนด
                    return item.distance_km !== null && item.distance_km <= maxDistance;
                });
            }

            if (priceValue && priceValue !== 'all') {
                if (priceValue === 'price_asc') {
                    // เรียงจากน้อยไปมาก
                    data.sort((a, b) => a.price_per_unit - b.price_per_unit);
                } else if (priceValue === 'price_desc') {
                    // เรียงจากมากไปน้อย
                    data.sort((a, b) => b.price_per_unit - a.price_per_unit);
                }
            }
            setListings(data);
            
        } catch (error: any) {
            console.error("Failed to fetch public listings:", error);
            Alert.alert('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถดึงรายการสินค้าได้');
        } finally {
            setIsFetching(false);
        }
    }, [typeValue, areaValue, priceValue]); // เพิ่ม dependencies ให้ครบ

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // ฟังก์ชันทดสอบการค้นหา
    const handleSearch = (query: string) => {
        Alert.alert("ค้นหาสำเร็จ", `คุณค้นหา: "${query}"`);
        console.log("User searched for:", query);
    };

    // ฟังก์ชันทดสอบการกดปุ่ม Banner (Navigation)
    const handleBannerPress = () => {
        router.push('/farmer/RegisterSellerScreen'); 
    };

    // ฟังก์ชันทดสอบการกด Product Card
    const handleProductPress = (listingId: string) => {
        router.push({
            pathname: './productDetail',
            params: { id: listingId }
        });
    };

    // ฟังก์ชันสำหรับควบคุมการเปิด-ปิด Dropdown เพื่อให้เปิดได้ทีละตัว
    const onOpenType = () => {
        setAreaOpen(false); setPriceOpen(false); setDistanceOpen(false);
        setTypeOpen(true);
    };

    const onOpenArea = () => {
        setTypeOpen(false); setPriceOpen(false); setDistanceOpen(false);
        setAreaOpen(true);
    };

    const onOpenPrice = () => {
        setTypeOpen(false); setAreaOpen(false); setDistanceOpen(false);
        setPriceOpen(true);
    };
    
    // *** ฟังก์ชันสำหรับ Navbar ***
    const handleNavPress = (tab: 'home' | 'add' | 'profile') => {
        setActiveTab(tab);
        // สามารถเพิ่ม logic การ navigate ได้ที่นี่
        if (tab === 'home') {
        } else if (tab === 'add') {
             router.push('/LoginScreen');
        } else if (tab === 'profile') {
             router.push('/LoginScreen');;
        }
    };


    return (
        <SafeAreaView style={styles.fullScreen}>
            {/* View หลักที่ใช้ Flex 1 เพื่อห่อหุ้ม ScrollView และ Navbar */}
            <View style={styles.contentWrapper}> 
                
                {/* ScrollView สำหรับเนื้อหาส่วนบน (Flex 1) */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    // ปิด Dropdown เมื่อเลื่อนหน้าจอ
                    onScrollBeginDrag={() => {
                        setTypeOpen(false);
                        setAreaOpen(false);
                        setPriceOpen(false);
                    }}
                >

                    {/* --- 1. Search Bar Component --- */}
                    <View style={styles.componentContainer}>
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="ลองค้นหาสินค้าที่นี่..."
                        />
                    </View>

                    {/* --- 2. Marketing Banner Component --- */}
                    <View style={styles.componentContainer}>
                        <MarketingBanner
                            onPress={handleBannerPress}
                            imageSource={require('../assets/images/banner.png')}
                        />
                    </View>

                    {/* --- 3. Filter/Dropdown Row --- */}
                    <View style={styles.filterContainer}>
                        {/* Dropdown 1: ประเภท - zIndex สูงสุด */}
                        <CustomDropdown
                            containerStyle={[styles.dropdownWrapper, { zIndex: 4000 }]}
                            placeholder="ประเภท"
                            open={typeOpen}
                            value={typeValue}
                            items={typeItemsState}
                            setOpen={setTypeOpen}
                            setValue={setTypeValue}
                            setItems={setTypeItemsState}
                            onOpen={onOpenType}
                        />

                        {/* Dropdown 2: พื้นที่ - zIndex รองลงมา */}
                        <CustomDropdown
                            containerStyle={[styles.dropdownWrapper, { zIndex: 3000 }]}
                            placeholder="พื้นที่"
                            open={areaOpen}
                            value={areaValue}
                            items={areaItemsState}
                            setOpen={setAreaOpen}
                            setValue={setAreaValue}
                            setItems={setAreaItemsState}
                            onOpen={onOpenArea}
                        />

                        {/* Dropdown 3: ราคา/ปริมาณ - zIndex ต่ำกว่า */}
                        <CustomDropdown
                            containerStyle={[styles.dropdownWrapper, { zIndex: 2000 }]}
                            placeholder="ราคา"
                            open={priceOpen}
                            value={priceValue}
                            items={priceItemsState}
                            setOpen={setPriceOpen}
                            setValue={setPriceValue}
                            setItems={setPriceItemsState}
                            onOpen={onOpenPrice}
                        />
                    </View>

                    {/* --- 4. Product List Header --- */}
                    <Text style={styles.listHeader}>รายการแนะนำ</Text>


                    {/* --- 5. Product List Grid --- */}
                    <FlatList
                        data={listings}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            const imagePath = (item.image_url && item.image_url.length > 0) ? item.image_url[0] : null;
                            let fullImageUrl = 'https://via.placeholder.com/300';

                            if (imagePath) {
                                if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
                                    // เป็น URL เต็มแล้ว ใช้ได้เลย
                                    fullImageUrl = imagePath;
                                } else {
                                    // เป็น Path ย่อ ต้องต่อ Base URL
                                    fullImageUrl = `${IMAGE_BASE_URL}${imagePath}`;
                                }
                            }

                                return ( 
                                <ProductCard
                                productName={item.product_name}
                                price={item.price_per_unit ?? 0}
                                unit={item.unit}
                                grade={item.grade}
                                distance={typeof item.distance_km === 'number' 
                                        ? `${item.distance_km.toFixed(1)} กม.` 
                                        : 'ไม่ระบุ'}
                                imageUrl={fullImageUrl}
                                onPress={() => handleProductPress(item.id)}
                            />
                                );
                            }}
                        numColumns={2} 
                        contentContainerStyle={styles.productList}
                        scrollEnabled={false} 
                        ListEmptyComponent={() => (
                                <Text style={styles.noDataText}>ไม่พบรายการสินค้าที่พร้อมจำหน่าย</Text>
                            )}
                    />

                </ScrollView>
                
                {/* --- 6. Bottom Navbar Component (อยู่ล่างสุด) --- */}
                <BottomNavbar
                    onHomePress={() => handleNavPress('home')}
                    onAddPress={() => handleNavPress('add')}
                    onProfilePress={() => handleNavPress('profile')}
                    activeTab={activeTab}
                />
            
            </View>
        </SafeAreaView>
    );
};

// ----------------------------------------------------
// Styles สำหรับหน้าจอทดสอบ
const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    // View ที่ห่อหุ้มเนื้อหาทั้งหมด (ScrollView + Navbar)
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 10,
        // เพิ่ม paddingBottom เพื่อให้เนื้อหาส่วนล่างไม่ถูก Navbar บัง
        paddingBottom: 60, 
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 10,
    },
    componentContainer: {
        marginBottom: 15,
    },
    componentHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#38A169',
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    note: {
        fontSize: 12,
        color: '#A0AEC0',
        marginTop: 5,
        paddingHorizontal: 20,
    },
    
    // --- Styles for Filter ---
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: 15,
    },
    dropdownWrapper: {
        flex: 1, 
        marginHorizontal: 4,
        minHeight: 50, 
    },
    listHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 5,
    },
    productList: {
        paddingHorizontal: 30, 
        justifyContent: 'space-between',
    },
    noDataText: {
        textAlign: 'center',
        color: '#A0AEC0',
        paddingVertical: 40,
        fontSize: 16,
    },
});

export default HomeScreen;