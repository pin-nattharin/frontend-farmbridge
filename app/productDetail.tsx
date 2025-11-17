import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
// --- 1. Import useLocalSearchParams เพิ่ม ---
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// เปลี่ยนกลับไปใช้ LineChart
import { LineChart } from 'react-native-chart-kit';
import api from '../services/api'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------------------------
// DUMMY DATA และ Constants
// ----------------------------------------------------
const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.9;
const IMAGE_BASE_URL = 'http://10.0.2.2:3000';

interface ListingDetail {
    id: number;
    product_name: string;
    price_per_unit: string; // API ส่งมาเป็น string (Decimal)
    unit: string;
    quantity_available: string;
    description: string;
    pickup_date: string;
    image_url: string[] | null;
    created_at: string;
    seller: {
        fullname: string;
        phone: string;
        address: string;
    };
}


// Data Structure สำหรับ react-native-chart-kit
const priceGraphData = {
    labels: ["ม.ค.", "มี.ค.", "พ.ค.", "ก.ค.", "ก.ย.", "พ.ย."],
    datasets: [
        {
            data: [25, 27, 30, 28, 26, 30], // ข้อมูลราคาจำลอง
            color: (opacity = 1) => `rgba(0, 86, 179, ${opacity})`, // สีน้ำเงิน
        }
    ]
};

// Config สำหรับ LineChart
const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 86, 179, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: "#0056b3"
    },
    // ปรับให้กราฟแสดงเต็มพื้นที่
    paddingRight: 0, 
    paddingLeft: 0,
};

// ----------------------------------------------------
// 3. หน้าจอหลัก ProductDetailScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('th-TH', { month: 'long' });
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${day} ${month} ${year}`;
};

const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInMs = now.getTime() - posted.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `โพสต์เมื่อ ${diffInHours} ชั่วโมงที่แล้ว`;
    return `โพสต์เมื่อ ${Math.floor(diffInHours / 24)} วันที่แล้ว`;
};

export default function ProductDetailScreen() {
    const router = useRouter();
    
    // --- 2. รับค่า id ที่ถูกส่งมา ---
    const { id } = useLocalSearchParams<{ id: string }>();

    const [activeTab, setActiveTab] = useState<ActiveTab>('home');

    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // [ทดสอบ] แสดง ID ที่ได้รับใน console
    console.log("Received Product ID:", id);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                // เรียก API /listings/:id (ตรงกับ listing.routes.js)
                const response = await api.get(`/listings/${id}`);
                setListing(response.data);
            } catch (error) {
                console.error("Fetch Error:", error);
                Alert.alert("ผิดพลาด", "ไม่สามารถโหลดข้อมูลสินค้าได้");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetail();
        }
    }, [id]);

    const handleBuy = async () => {
        if (!listing) return;

        // 1. ตรวจสอบ Token ในเครื่อง
        const token = await AsyncStorage.getItem('userToken');
        console.log("Current Token:", token);
        
        if (!token) {
            // 2. ถ้าไม่มี Token ให้แจ้งเตือนและไปหน้า Login
            Alert.alert(
                "กรุณาเข้าสู่ระบบ",
                "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสั่งซื้อสินค้าได้",
                [
                    { text: "ยกเลิก", style: "cancel" },
                    { 
                        text: "เข้าสู่ระบบ", 
                        onPress: () => router.push('/LoginScreen') 
                    }
                ]
            );
            return;
        }

        // 3. ถ้ามี Token (Login แล้ว) ให้ไปหน้าชำระเงินตามปกติ
        const imagePath = listing.image_url?.[0];
        let fullImageUrl = '';
        if (imagePath) {
            if (imagePath.startsWith('http')) fullImageUrl = imagePath;
            else fullImageUrl = `${IMAGE_BASE_URL}${imagePath}`;
        }

        // ส่งข้อมูลไปหน้า Payment
        router.push({
            pathname: '/buyer/payment',
            params: {
                listing_id: listing.id,
                product_name: listing.product_name,
                price_per_unit: listing.price_per_unit,
                unit: listing.unit,
                seller_location: listing.seller?.address || 'ไม่ระบุ',
                image_url: fullImageUrl,
                pickup_date: listing.pickup_date // ส่งวันที่นัดรับไปด้วย
            }
        });
    };

    /* const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') {
            router.replace('/buyer/homeBuyer');
        } else if (tab === 'add') {
            router.push('/buyer/createDemand');
        } else if (tab === 'list') {
            router.replace('/buyer/historyDemand');
        } else if (tab === 'notify') {
            router.replace('/buyer/notificationDemand');
        } else if (tab === 'profile') {
            return;
        }
    }; */

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                 <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                    <ActivityIndicator size="large" color="#0056b3" />
                 </View>
            </SafeAreaView>
        );
    }

    // 2. ถ้าโหลดเสร็จแล้ว แต่ listing ยังเป็น null (หาไม่เจอ/Error)
    if (!listing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                 <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontSize: 18, color: '#666', marginBottom: 20}}>ไม่พบข้อมูลสินค้า</Text>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.buyButton, {marginTop: 0, paddingHorizontal: 40}]}>
                        <Text style={styles.buyButtonText}>ย้อนกลับ</Text>
                    </TouchableOpacity>
                 </View>
            </SafeAreaView>
        );
    }

    const imagePath = listing?.image_url?.[0];
    
    let fullImageUrl = 'https://via.placeholder.com/600'; 
    if (imagePath) {
        if (imagePath.startsWith('http')) fullImageUrl = imagePath;
        else fullImageUrl = `${IMAGE_BASE_URL}${imagePath}`;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View style={styles.contentWrapper}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* 1. Parallax Image Area */}
                    <View style={styles.imageArea}>
                        <Image
                            source={{ uri: fullImageUrl }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                        {/* Back Button (ลอยทับ) */}
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. Detail Card Content */}
                    <View style={styles.detailCard}>
                        {/* Seller Info & Price */}
                        <View style={styles.sellerRow}>
                            <View style={styles.avatarCircle} />
                            <View style={styles.sellerInfo}>
                               {/* แสดงชื่อผู้ขายจริง */}
                                <Text style={styles.sellerName}>{listing?.seller?.fullname || 'ไม่ระบุชื่อ'}</Text>
                                {/* แสดงเวลาโพสต์จริง */}
                                <Text style={styles.postTime}>{getTimeAgo(listing?.created_at)}</Text>
                            </View>
                            <Text style={styles.priceTag}>
                                {parseFloat(listing.price_per_unit).toLocaleString()} บาท/{listing.unit}
                            </Text>
                        </View>

                        {/* Product Title & ID */}
                        <Text style={styles.productTitle}>
                            {listing.product_name}
                        </Text>

                        {/* Quantity */}
                        <Text style={styles.detailLabel}>
                            มีสินค้า: {listing.quantity_available} {listing.unit}
                        </Text>

                        {/* Description */}
                        <Text style={styles.detailDescription}>
                            {listing.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                        </Text>

                        {/* Pickup Deadline */}
                        {listing.pickup_date && (
                            <View style={styles.deadlineBadge}>
                                <Text style={styles.deadlineText}>
                                    ควรมารับก่อนวันที่ {formatDate(listing.pickup_date)}
                                </Text>
                            </View>
                        )}

                        {/* 3. Price Graph Area */}
                        <Text style={styles.graphTitle}>กราฟราคา</Text>
                        <View style={styles.chartContainer}>
                            {/* LineChart Rendering */}
                            <LineChart
                                data={priceGraphData}
                                width={width - 40} // หัก padding ซ้าย-ขวา
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                        

                        {/* 4. Buy Button */}
                        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                            <Text style={styles.buyButtonText}>ซื้อสินค้า</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Placeholder for space above Navbar */}
                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* 5. Bottom Navbar */}
                {/* <BuyerNavbar
                    onHomePress={() => handleNavPress('home')}
                    onListPress={() => handleNavPress('list')}
                    onAddPress={() => handleNavPress('add')}
                    onNotifyPress={() => handleNavPress('notify')}
                    onProfilePress={() => setActiveTab('profile')}
                    activeTab={activeTab}
                /> */}
            </View>
        </SafeAreaView>
    )
}

// ----------------------------------------------------
// 4. Stylesheet (คงเดิม)
// ----------------------------------------------------

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    // 1. Image Area
    imageArea: {
        height: IMAGE_HEIGHT,
        width: width,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 40,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // 2. Detail Card Content
    detailCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        minHeight: 500,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e0e0e0',
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    postTime: {
        fontSize: 12,
        color: '#888',
    },
    priceTag: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    detailDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 15,
    },
    deadlineBadge: {
        backgroundColor: '#f9d7d7ff',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    deadlineText: {
        color: 'red',
        fontSize: 14,
        fontWeight: '600',
    },
    // 3. Price Graph Area
    graphTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    // 🆕 Container สำหรับ LineChart
    chartContainer: {
        overflow: 'hidden', 
        marginVertical: 10,
        backgroundColor: 'white',
        borderRadius: 16,
        // ลบ alignItems: 'center' ออกถ้า LineChart กินพื้นที่เต็ม
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chart: {
        // LineChart มี Style ในตัวเอง 
        borderRadius: 16,
    },
    // 4. Buy Button
    buyButton: {
        backgroundColor: '#28a745',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 25,
    },
    buyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});