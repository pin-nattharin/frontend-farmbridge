import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import SearchBar from '../components/ui/SearchBar';
import MarketingBanner from '../components/ui/MarketingBanner';
import CustomDropdown from '../components/ui/Dropdown';
import ProductCard from '../components/ui/ProductCard'; 
import BottomNavbar from '../components/ui/BottomNavbar'; // *** 1. Import Navbar ***

// ----------------------------------------------------
// ข้อมูลจำลอง (DUMMY DATA) - แก้ไข Type ของ value เป็น string
// ----------------------------------------------------

// 1. ข้อมูลสำหรับ Dropdown
const typeItems = [
    { label: 'ทุเรียน', value: 'durian' },
    { label: 'มะม่วง', value: 'mango' },
    { label: 'องุ่น', value: 'grape' },
    { label: 'มังคุด', value: 'mangosteen' },
];

const areaItems = [
    { label: '5 กม.', value: '5' },     
    { label: '20 กม.', value: '20' },    
    { label: '30 กม.', value: '30' },
    { label: '50 กม.', value: '50' },
];

const priceItems = [
    { label: 'ต่ำ-สูง', value: 'low-high' },
    { label: 'สูง-ต่ำ', value: 'high-low' },
];

// 2. ข้อมูลรายการสินค้า (ตามภาพ UI)
const dummyProducts = [
    { id: '1', productName: 'มะม่วงน้ำดอกไม้', price: 30, unit: 'กก.', grade: 'เกรด C', distance: '2.5 กม.', imageUrl: 'https://picsum.photos/id/66/300/200' },
    { id: '2', productName: 'ทุเรียนหมอนทอง', price: 95, unit: 'กก.', grade: 'เกรด C', distance: '10 กม.', imageUrl: 'https://picsum.photos/id/1080/300/200' },
    { id: '3', productName: 'องุ่นเขียวไร้เมล็ด', price: 90, unit: 'กก.', grade: 'เกรด C', distance: '23.2 กม.', imageUrl: 'https://picsum.photos/id/166/300/200' },
    { id: '4', productName: 'มะม่วงเขียวเสวย', price: 85, unit: 'กก.', grade: 'เกรด C', distance: '21.3 กม.', imageUrl: 'https://picsum.photos/id/1025/300/200' },
    { id: '5', productName: 'มังคุดเกรดพรีเมียม', price: 120, unit: 'กก.', grade: 'เกรด A', distance: '1.1 กม.', imageUrl: 'https://picsum.photos/id/237/300/200' },
    { id: '6', productName: 'เงาะโรงเรียน', price: 75, unit: 'กก.', grade: 'เกรด B', distance: '5.0 กม.', imageUrl: 'https://picsum.photos/id/145/300/200' },
];

// ----------------------------------------------------
// HOMESCREEN COMPONENT
// ----------------------------------------------------

const HomeScreen: React.FC = () => {

    const router = useRouter();

    // *** State สำหรับ Navbar ***
    const [activeTab, setActiveTab] = useState<'home' | 'add' | 'profile'>('home');

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
    const handleProductPress = (productName: string) => {
        Alert.alert("รายละเอียดสินค้า", `เปิดหน้า: ${productName}`);
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
             router.push('/farmer/RegisterSellerScreen');
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
                        data={dummyProducts}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ProductCard
                                productName={item.productName}
                                price={item.price}
                                unit={item.unit}
                                grade={item.grade}
                                distance={item.distance}
                                imageUrl={item.imageUrl}
                                onPress={() => handleProductPress(item.productName)}
                            />
                        )}
                        numColumns={2} 
                        contentContainerStyle={styles.productList}
                        scrollEnabled={false} 
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
        paddingHorizontal: 30, 
        justifyContent: 'space-between',
    },
});

export default HomeScreen;