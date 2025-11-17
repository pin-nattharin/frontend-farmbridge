import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking'; // สำหรับการโทรออก

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import NavbarFarmer from '../../components/ui/FarmerNavbar';

// ----------------------------------------------------
// 1. DUMMY DATA
// ----------------------------------------------------

interface SaleNotificationItem {
    id: string;
    buyerName: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    pickupDeadline: string;
    buyerPhone: string;
}

const saleNotificationList: SaleNotificationItem[] = [
    {
        id: '1',
        buyerName: 'ณัฐรินทร์',
        productName: 'มะม่วง',
        quantity: 30,
        totalPrice: 900,
        pickupDeadline: '7/11/2568',
        buyerPhone: '0981112222',
    },
    {
        id: '2',
        buyerName: 'วริศรา',
        productName: 'ทุเรียน',
        quantity: 20,
        totalPrice: 2400,
        pickupDeadline: '10/11/2568',
        buyerPhone: '0993334444',
    },
];

// ----------------------------------------------------
// 2. Component: SaleNotificationCard
// ----------------------------------------------------

interface SaleCardProps extends SaleNotificationItem {
    onPressCall: () => void;
    onPressCard: () => void;
}

const SaleNotificationCard: React.FC<SaleCardProps> = ({
    buyerName,
    productName,
    quantity,
    totalPrice,
    pickupDeadline,
    buyerPhone,
    onPressCall,
    onPressCard,
}) => {
    return (

        <TouchableOpacity
            style={cardStyles.card}
            onPress={onPressCard}
            activeOpacity={0.8}
        >

            {/* แถบสีน้ำเงินด้านซ้าย (Indicator) */}
            <View style={cardStyles.indicator} />

            <View style={cardStyles.content}>

                <View style={cardStyles.headerRow}>
                    <Text style={cardStyles.statusText}>ขายได้แล้ว !</Text>

                    <TouchableOpacity onPress={onPressCall}>
                        <MaterialCommunityIcons name="phone" size={24} color="#28a745" />
                    </TouchableOpacity>
                </View>

                {/* Main Message */}
                <Text style={cardStyles.messageLine}>
                    <Text style={cardStyles.buyerNameText}>{buyerName} </Text>
                    ชำระค่า{productName} {quantity} กก. เป็นเงิน {totalPrice} บาทอยู่ในระบบ
                </Text>

                {/* Deadline */}
                <Text style={cardStyles.deadlineText}>
                    กรุณาเตรียมของก่อน {pickupDeadline}
                </Text>
            </View>
        </TouchableOpacity>
    );
};


// ----------------------------------------------------
// 3. หน้าจอหลัก SaleNotificationScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'chart' | 'add' | 'notifications' | 'profile';

export default function SaleNotificationScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('notifications');

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleBack = () => {
        router.back();
    };

    const handleCardPress = (id: string) => {
        router.push(`/farmer/verifyPickup?id=${id}`);
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        // ⚠️ โค้ดจริง: ใช้ router.replace/push ตามโครงสร้าง App ของคุณ
        if (tab === 'home') router.replace('/farmer/homeFarmer');
        else if (tab === 'add') router.push('/farmer/createPost');
        else if (tab === 'profile') router.replace('/farmer/farmerProfile');
        else if (tab === 'chart') router.replace('/farmer/dashboard');
        // Notifications อยู่หน้าเดิม
    };

    return (
        <SafeAreaView style={styles.safeArea}>

            {/* 🆕 ADD: ปุ่มย้อนกลับ (จัดวางให้ลอยอยู่เหนือเนื้อหา) */}
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#0056b3" />
            </TouchableOpacity>

            <View style={styles.contentWrapper}>

                <Text style={styles.pageTitle}>การแจ้งเตือน</Text>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {saleNotificationList.map((item) => (
                        <SaleNotificationCard
                            key={item.id}
                            {...item}
                            onPressCall={() => handleCall(item.buyerPhone)}
                            onPressCard={() => handleCardPress(item.id)}
                        />
                    ))}
                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* 5. Bottom Navbar */}
                <NavbarFarmer
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
}

// ----------------------------------------------------
// 4. Stylesheet
// ----------------------------------------------------

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute', // ทำให้ปุ่มลอย
        top: 50, // ปรับตำแหน่งให้เหมาะสมกับ SafeAreaView
        left: 15,
        zIndex: 10, // ให้อยู่ด้านบนสุด
        padding: 5,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    contentWrapper: {
        flex: 1,
    },
    stackHeaderTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        marginHorizontal: 16,
        marginTop: 70,
        marginBottom: 20,
        textAlign: 'center',
    },
    scrollContent: {
        paddingVertical: 5,
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
});


const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
        minHeight: 100, // กำหนดความสูงขั้นต่ำ
    },
    indicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 8,
        backgroundColor: '#0056b3', // สีน้ำเงินหลัก
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    content: {
        flex: 1,
        paddingLeft: 15, // เว้นระยะห่างจากแถบสีน้ำเงิน
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    messageLine: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 5,
        paddingRight: 40,
    },
    buyerNameText: {
        fontWeight: 'bold',
    },
    deadlineText: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
    },
});