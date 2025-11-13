import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import BuyerNavbar from '../../components/ui/BuyerNavbar'; // 💡 สมมติว่า BuyerNavbar อยู่ใน components/ui

// ----------------------------------------------------
// 1. DUMMY DATA
// ----------------------------------------------------
const notificationList = [
    { 
        id: '1', 
        product: 'มะม่วง พร้อมส่ง', 
        detail: '(ใกล้แค่ 2.5 กม.)', 
        message: 'สบายดีฟาร์มเพิ่งลงขายสินค้าที่คุณมองหา คลิกดูเลยก่อนของหมด!',
        isNew: true, // สำหรับแถบสีน้ำเงินด้านข้าง
    },
    { 
        id: '2', 
        product: 'ทุเรียน พร้อมส่ง', 
        detail: '(ใกล้แค่ 5 กม.)', 
        message: 'แฮปปี้ฟาร์มเพิ่งลงขายสินค้าที่คุณมองหา คลิกดูเลยก่อนของหมด!',
        isNew: false, 
    },
];

// ----------------------------------------------------
// 2. Component: NotificationCard (แทน ListingCard ในบริบทนี้)
// ----------------------------------------------------

interface NotificationCardProps {
    product: string;
    detail: string;
    message: string;
    isNew: boolean;
    onPress: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    product,
    detail,
    message,
    isNew,
    onPress,
}) => {
    return (
        <TouchableOpacity 
            style={[cardStyles.card, isNew && cardStyles.cardNew]} 
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* แถบสีน้ำเงินด้านซ้าย (Blue Indicator) */}
            {isNew && <View style={cardStyles.newIndicator} />}

            <View style={cardStyles.content}>
                <Text style={cardStyles.productName}>
                    {product} <Text style={cardStyles.detailText}>{detail}</Text>
                </Text>
                <Text style={cardStyles.messageText}>
                    {message}
                </Text>
            </View>
        </TouchableOpacity>
    );
};


// ----------------------------------------------------
// 3. หน้าจอหลัก NotificationScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

export default function NotificationScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('notify'); 

    const handleCardPress = (item: typeof notificationList[0]) => {
        Alert.alert('เปิดรายการ', `คุณต้องการดูสินค้า: ${item.product} หรือไม่?`);
        // router.push(`/product/${item.id}`);
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        // ⚠️ โค้ดจริง: ใช้ router.replace/push ตามโครงสร้าง App ของคุณ
        if (tab === 'home') router.replace('/buyer/homeBuyer'); 
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'profile') router.replace('/buyer/buyerProfile');
        else if (tab === 'list') router.replace('/buyer/historyDemand');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    // 1. แสดง Header ของ Stack Router และกำหนด Style
                    headerShown: true, 
                    title: 'การแจ้งเตือน', 
                }} 
            />
            
            <View style={styles.contentWrapper}>
                
                {/* Custom Header (ตามภาพ) */}
            <View style={styles.contentWrapper}>
                    <Text style={styles.pageTitle}>การแจ้งเตือน</Text>
                </View>

                {/* Body Content */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {notificationList.map((item) => (
                        <NotificationCard
                            key={item.id}
                            {...item}
                            onPress={() => handleCardPress(item)}
                        />
                    ))}
                    <View style={{ height: 200 }} /> 
                </ScrollView>
                
                {/* Bottom Navbar */}
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
    );
}

// ----------------------------------------------------
// 4. Stylesheet
// ----------------------------------------------------

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    contentWrapper: {
        flex: 1,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        marginHorizontal: 16,
        marginTop: 40,
        marginBottom: 10,
        textAlign: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingTop: 50, // เผื่อพื้นที่ด้านบนสุด
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 15,
    },
    scrollContent: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        paddingBottom: 80, // เว้นที่ว่างให้ Navbar
    },
});


const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden', // สำคัญสำหรับแถบสีด้านซ้าย
    },
    cardNew: {
        // อาจจะเพิ่ม border สีฟ้าอ่อนถ้าต้องการ
    },
    newIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 8, // ความหนาของแถบสี
        backgroundColor: '#0056b3', // สีน้ำเงินเข้ม
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    content: {
        flex: 1,
        paddingLeft: 5, // เว้นระยะห่างจากแถบสีน้ำเงิน (ถ้ามี)
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0056b3',
        marginBottom: 5,
    },
    detailText: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#555',
    },
    messageText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});