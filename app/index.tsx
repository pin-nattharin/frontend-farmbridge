import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import SearchBar from '../components/ui/SearchBar'; 
import MarketingBanner from '../components/ui/MarketingBanner'; 
import CustomDropdown from '../components/ui/Dropdown'; 
import ProductCard from '../components/ui/ProductCard'; 
import BottomNavbar from '../components/ui/BottomNavbar'; 
import api from '../services/api';
import { useAuth } from './context/AuthContext';

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
    location_geom?: {
        type: string;
        coordinates: number[]; // [lng, lat]
    };
    distance?: number | null;
}

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // รัศมีโลก (กม.)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const HomeScreen: React.FC = () => {
    const { user } = useAuth();

    const userLocation = user?.coordinates 
        ? { lat: user.coordinates.lat, lng: user.coordinates.lng }
        : { lat: 18.7883, lng: 98.9853 };

    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'home' | 'add' | 'profile'>('home');

    // --- State สำหรับข้อมูลจริง ---
    const [listings, setListings] = useState<Listing[]>([]); 
    const [isFetching, setIsFetching] = useState(true);
    
    // 🟢 ใช้ IP สำหรับ Emulator (ถ้าใช้เครื่องจริง ให้เปลี่ยนเป็น IP เครื่องคอมฯ เช่น 192.168.1.xxx)
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

    // --- ฟังก์ชันดึงข้อมูล ---
    const formatListingsResponse = (payload: any): Listing[] => {
        if (Array.isArray(payload)) return payload;
        if (payload?.items && Array.isArray(payload.items)) return payload.items;
        return [];
    };

    const handleFetchError = (error: any) => {
        const status = error?.response?.status;
        const backendMessage = error?.response?.data?.message;
        const fallbackMessage = backendMessage || (status ? `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (${status})` : 'ไม่สามารถดึงรายการสินค้าได้');
        console.error('Failed to fetch listings:', {
            status,
            data: error?.response?.data,
            message: error?.message
        });
        // Alert.alert('ผิดพลาด', fallbackMessage); // ปิด Alert รบกวนถ้าต้องการ
    };

    const fetchListings = useCallback(async () => {
        setIsFetching(true);
        try {
            const params: { product_name?: string; status?: string } = {
                status: 'available'
            };

            if (typeValue && typeValue !== 'all') {
                params.product_name = typeValue;
            }
            const response = await api.get('/listings', { params });
            let data: Listing[] = formatListingsResponse(response.data);

            data = data.map(item => {
                // ถ้า Backend ส่ง location_geom มา (geoJSON: [lng, lat])
                if (item.location_geom && item.location_geom.coordinates) {
                    const [lon, lat] = item.location_geom.coordinates;
                    const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lon);
                    return { ...item, distance: dist }; // เพิ่ม field distance ที่คำนวณแล้ว
                }
                return { ...item, distance: null };
            });

            if (areaValue && areaValue !== 'all') {
                const maxDistance = parseInt(areaValue, 10);
                data = data.filter(item => item.distance !== null && item.distance <= maxDistance);
            }

            if (priceValue && priceValue !== 'all') {
                if (priceValue === 'price_asc') {
                    data = [...data].sort((a, b) => a.price_per_unit - b.price_per_unit);
                } else if (priceValue === 'price_desc') {
                    data = [...data].sort((a, b) => b.price_per_unit - a.price_per_unit);
                }
            }
            setListings(data);
        } catch (error: any) {
            handleFetchError(error);
        } finally {
            setIsFetching(false);
        }
    }, [typeValue, areaValue, priceValue]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleSearch = (query: string) => {
        Alert.alert("ค้นหาสำเร็จ", `คุณค้นหา: "${query}"`);
    };

    const handleBannerPress = () => {
        router.push('/farmer/RegisterSellerScreen'); 
    };

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
    const handleNavPress = (tab: 'home' |'add' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'home') {
            return; // อยู่หน้า Home แล้ว
        } else if (tab === 'add') {
            router.push('/LoginScreen');
        } else if (tab === 'profile') {
            router.push('/LoginScreen');
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
                            imageSource={require('../assets/images/banner.png')}
                        />
                    </View>

                    {/* --- 3. Filter/Dropdown Row --- */}
                    <View style={styles.filterContainer}>
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
                            
                            // 🔍 DEBUG LOGS: เช็คค่า URL
                            console.log(`\n📦 Product ID: ${item.id} (${item.product_name})`);
                            // console.log("   RAW image_url:", item.image_url);

                            // ดึงชื่อไฟล์จาก Array
                            let imagePath = (item.image_url && item.image_url.length > 0) ? item.image_url[0] : null;
                            
                            // รูป Default
                            let fullImageUrl = 'https://via.placeholder.com/300?text=No+Image'; 

                            if (imagePath) {
                                // 1. ลบเครื่องหมายคำพูด " ออก และแปลง Backslash
                                imagePath = imagePath.replace(/['"]+/g, '').replace(/\\/g, '/');

                                // 2. ตรวจสอบประเภทของ Path
                                if (imagePath.startsWith('content://') || imagePath.startsWith('file://')) {
                                    fullImageUrl = imagePath;
                                    console.log("   Type: Local URI");
                                } else if (imagePath.startsWith('http')) {
                                    fullImageUrl = imagePath;
                                    console.log("   Type: Full URL");
                                } else {
                                    // รูปบน Server -> ต่อ Base URL
                                    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
                                    // เช็คว่า cleanPath มีคำว่า uploads หรือยัง
                                    if (cleanPath.startsWith('uploads/')) {
                                        fullImageUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
                                    } else {
                                        fullImageUrl = `${IMAGE_BASE_URL}/uploads/${cleanPath}`; 
                                    }
                                    console.log("   Type: Server Path");
                                }
                            }
                            const distanceText = (item.distance !== undefined && item.distance !== null)
                                ? `${item.distance.toFixed(1)} กม.` 
                                : 'ไม่ระบุ';

                            // 🏁 DEBUG LOGS: ค่าสุดท้าย
                            console.log("   🚀 FINAL URL:", fullImageUrl);
                            console.log("------------------------------------------------");

                            return (
                                <ProductCard
                                    productName={item.product_name}
                                    price={item.price_per_unit}
                                    unit={item.unit}
                                    grade={item.grade || '-'}
                                    distance={typeof item.distance === 'number' 
                                        ? `${item.distance.toFixed(1)} กม.` 
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
                            <Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>ไม่พบสินค้า</Text>
                        )}
                    />

                </ScrollView>
                
                {/* --- 6. Bottom Navbar Component --- */}
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
// Styles
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
        paddingTop: 50,
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
        paddingHorizontal: 20, 
        justifyContent: 'center', 
        paddingBottom: 80, // เพิ่ม padding ล่างกัน Navbar บัง
    },
});

export default HomeScreen;