import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// เปลี่ยนกลับไปใช้ LineChart
import { LineChart } from 'react-native-chart-kit'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import BuyerNavbar from '../components/ui/BuyerNavbar'; 

// ----------------------------------------------------
// DUMMY DATA และ Constants
// ----------------------------------------------------
const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.9;

const productData = {
    id: 'mango-1',
    imageUrl: 'https://picsum.photos/id/66/600/600',
    sellerName: 'สบายดีฟาร์ม',
    postTime: 'โพสต์เมื่อ 3 ชั่วโมงที่แล้ว',
    price: 30,
    unit: 'กก.',
    productName: 'มะม่วง',
    quantity: 30,
    details: 'รายละเอียด: พันธุ์น้ำดอกไม้ผิวไม่สวย แต่เนื้อคุณภาพดี เหมาะสำหรับนำไปแปรรูป ทำน้ำมะม่วงกวน หรือมะม่วงกวน',
    pickupDeadline: '12/11/2568',
};

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

export default function ProductDetailScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('home');

    const handleBuy = () => {
        Alert.alert('ยืนยันการซื้อ', `คุณต้องการซื้อ ${productData.productName} ในราคานี้หรือไม่?`);
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') router.replace('/buyer/homeBuyer');
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'profile') router.replace('/buyer/buyerProfile');
        else if (tab === 'list') router.replace('/buyer/historyDemand');
        else if (tab === 'notify') router.replace('/buyer/notificationDemand');
    };

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
                            source={{ uri: productData.imageUrl }}
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
                                <Text style={styles.sellerName}>{productData.sellerName}</Text>
                                <Text style={styles.postTime}>{productData.postTime}</Text>
                            </View>
                            <Text style={styles.priceTag}>
                                {productData.price} บาท/{productData.unit}
                            </Text>
                        </View>

                        {/* Product Title */}
                        <Text style={styles.productTitle}>{productData.productName}</Text>

                        {/* Details */}
                        <Text style={styles.detailLabel}>
                            จำนวน: {productData.quantity} {productData.unit}
                        </Text>
                        <Text style={styles.detailDescription}>{productData.details}</Text>

                        {/* Pickup Deadline Badge */}
                        <View style={styles.deadlineBadge}>
                            <Text style={styles.deadlineText}>
                                ควรมารับก่อนวันที่ {productData.pickupDeadline}
                            </Text>
                        </View>

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
                            <Text style={styles.buyButtonText}>ซื้อ</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Placeholder for space above Navbar */}
                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* 5. Bottom Navbar */}
                <BuyerNavbar
                    onHomePress={() => handleNavPress('home')}
                    onListPress={() => handleNavPress('list')}
                    onAddPress={() => handleNavPress('add')}
                    onNotifyPress={() => handleNavPress('notify')}
                    onProfilePress={() => handleNavPress('profile')}
                    activeTab={activeTab}
                />
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
        top: Platform.OS === 'ios' ? 50 : 20,
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