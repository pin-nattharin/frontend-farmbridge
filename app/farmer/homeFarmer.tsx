import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import SearchBar from '../../components/ui/SearchBar'; 
import MarketingBanner from '../../components/ui/MarketingBanner'; 
import CustomDropdown from '../../components/ui/Dropdown'; 
import ProductCard from '../../components/ui/ProductCard'; 
import FarmerNavbar from '../../components/ui/FarmerNavbar'; // แก้ Import เป็น BuyerNavbar
import api from '../../services/api';

// Interface สำหรับข้อมูลสินค้า
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

// ----------------------------------------------------
// ข้อมูลจำลอง (DUMMY DATA) 
// ----------------------------------------------------
const typeItems = [
    { label: 'ทุกประเภท', value: 'ทั้งหมด' },
    { label: 'ทุเรียน', value: 'ทุเรียน' },
    { label: 'มะม่วง', value: 'มะม่วง' },
    { label: 'องุ่น', value: 'องุ่น' },
    { label: 'มังคุด', value: 'มังคุด' },
];

const areaItems = [
    { label: 'ทุกพื้นที่', value: 'ทุกพื้นที่' },
    { label: '5 กม.', value: '5' },     
    { label: '20 กม.', value: '20' },    
    { label: '30 กม.', value: '30' },
    { label: '50 กม.', value: '50' },
];

const priceItems = [
    { label: 'ราคา', value: 'ราคาทั้งหมด' },
    { label: 'ต่ำ-สูง', value: 'ต่ำ-สูง' },
    { label: 'สูง-ต่ำ', value: 'สูง-ต่ำ' },
];


// ----------------------------------------------------
// HOMESCREEN COMPONENT
// ----------------------------------------------------

const HomeScreen: React.FC = () => {

    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'home' | 'chart' | 'add' | 'notifications' | 'profile'>('home');

    // --- State สำหรับข้อมูลจริง ---
    const [listings, setListings] = useState<Listing[]>([]); 
    const [isFetching, setIsFetching] = useState(true);
    const IMAGE_BASE_URL = 'http://10.0.2.2:3000';

    // Dropdown States
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

    // --- ฟังก์ชันดึงข้อมูล (เหมือน index.tsx) ---
    const fetchListings = useCallback(async () => {
        setIsFetching(true);
        try {
            const params: any = { status: 'available' };
            
            if (typeValue && typeValue !== 'all') {
                params.product_name = typeValue;
            }
            // ถ้าจะใส่ logic distance เพิ่มภายหลัง ให้ใส่ตรงนี้

            const response = await api.get('/listings/all', { params }); 
            setListings(response.data);
            
        } catch (error: any) {
            console.error("Failed to fetch listings:", error);
        } finally {
            setIsFetching(false);
        }
    }, [typeValue]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleSearch = (query: string) => {
        Alert.alert("ค้นหาสำเร็จ", `คุณค้นหา: "${query}"`);
    };

    const handleBannerPress = () => {
        router.push('/farmer/RegisterSellerScreen'); 
    };

    // --- 1. แก้ไขฟังก์ชันนี้ ---
    const handleProductPress = (productId: string) => {
        router.push({
            pathname: '/productDetail', 
            params: { id: productId }
        });
    };

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
    const handleNavPress = (tab: 'home' | 'chart' | 'add' | 'notifications' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'home') {
            //หน้าเดิม
        } else if (tab === 'chart') {
             router.push('/farmer/dashboard'); // ผู้ซื้อสร้าง Demand
        } else if (tab === 'add') {
             router.push('/farmer/createPost'); 
        }
        else if (tab === 'notifications') {
             router.push('/farmer/notification'); 
        }
        else if (tab === 'profile') {
             router.push('/farmer/farmerProfile'); 
        }
    };


    return (
        <SafeAreaView style={styles.fullScreen}>
            <View style={styles.contentWrapper}> 
                
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    onScrollBeginDrag={() => {
                        setTypeOpen(false);
                        setAreaOpen(false);
                        setPriceOpen(false);
                    }}
                >

                    {/* --- 1. Search Bar Component --- */}
                    <View style={[styles.componentContainer, { paddingHorizontal: 15 }]}>
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="ลองค้นหาสินค้าที่นี่..."
                        />
                    </View>

                    {/* --- 2. Marketing Banner Component --- */}
                    <View style={styles.componentContainer}>
                        <MarketingBanner
                            onPress={handleBannerPress}
                            imageSource={require('../../assets/images/banner.png')}
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

                            const imagePath = item.image_url ? item.image_url[0] : null;
                            const fullImageUrl = imagePath ? `${IMAGE_BASE_URL}${imagePath}` : 'https://via.placeholder.com/300';
                            return (
                            <ProductCard
                                productName={item.product_name}
                                price={item.price_per_unit}
                                unit={item.unit}
                                grade={item.grade}
                                distance={typeof item.distance_km === 'number' ? `${item.distance_km.toFixed(1)} กม.` : 'ไม่ระบุ'}
                                    imageUrl={fullImageUrl}
                                    onPress={() => handleProductPress(item.id)}
                            />
                            );
                        }}
                        numColumns={2} 
                        contentContainerStyle={styles.productList}
                        scrollEnabled={false} 
                    />

                </ScrollView>
                
                {/* --- 6. Bottom Navbar Component (เรียกใช้ FarmerNavbar) --- */}
                <FarmerNavbar
                    onHomePress={() => handleNavPress('home')}
                    onChartPress={() => handleNavPress('chart')} 
                    onAddPress={() => handleNavPress('add')}
                    onNotificationsPress={() => handleNavPress('notifications')}
                    onProfilePress={() => handleNavPress('profile')}
                    activeTab={activeTab}
                />
        
            </View>
        </SafeAreaView>
    );
};

// ----------------------------------------------------
// Styles (คงเดิม)
const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 10,
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
});

export default HomeScreen;