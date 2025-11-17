import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้อง ***
import BuyerNavbar from '../../components/ui/BuyerNavbar'; 

// ----------------------------------------------------
// 1. DUMMY DATA (คงเดิม)
// ----------------------------------------------------
const notificationList = [
    { 
        id: '1', 
        product: 'มะม่วง พร้อมส่ง', 
        detail: '(ใกล้แค่ 2.5 กม.)', 
        message: 'สบายดีฟาร์มเพิ่งลงขายสินค้าที่คุณมองหา คลิกดูเลยก่อนของหมด!',
        isNew: true, 
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
// 2. Component: NotificationCard (คงเดิม)
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
// 3. หน้าจอหลัก NotificationScreen (แก้ไขการนำทาง)
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

export default function NotificationScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('notify'); 

    // 🆕 NEW: ฟังก์ชันสำหรับปุ่มย้อนกลับ
    const handleBack = () => {
        router.back();
    };
    
    // 🆕 แก้ไข: นำทางไปยังหน้า productdetail พร้อมส่ง ID
    const handleCardPress = (item: typeof notificationList[0]) => {
        // ใช้ router.push เพื่อนำทางไปยัง /productdetail?id={item.id}
        router.push(`/productDetail?id=${item.id}`);
        console.log(`Navigating to productdetail for ID: ${item.id}`);
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') router.replace('/buyer/homeBuyer'); 
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'profile') router.replace('/buyer/buyerProfile');
        else if (tab === 'list') router.replace('/buyer/historyDemand');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
        
        {/* 🆕 ADD: ปุ่มย้อนกลับ (จัดวางให้ลอยอยู่เหนือเนื้อหา) */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#0056b3" />
                        </TouchableOpacity>
                        
            <View style={styles.contentWrapper}>
                
                {/* Custom Title (อยู่ใต้ Stack Header) */}
                <Text style={styles.pageTitle}>การแจ้งเตือน</Text>
                
                {/* Body Content */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {notificationList.map((item) => (
                        <NotificationCard
                            key={item.id}
                            // 🆕 ใช้ \n ใน message เพื่อให้ขึ้นบรรทัดใหม่ตามภาพตัวอย่าง
                            product={item.product}
                            detail={item.detail}
                            message={item.message.replace(' คลิกดูเลยก่อนของหมด!', '\nคลิกดูเลยก่อนของหมด!')}
                            isNew={item.isNew}
                            onPress={() => handleCardPress(item)}
                        />
                    ))}
                    <View style={{ height: 20 }} /> 
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
// 4. Stylesheet (ปรับปรุง)
// ----------------------------------------------------

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    contentWrapper: {
        flex: 1,
    },
    //  Style สำหรับปุ่มย้อนกลับ
    backButton: {
        position: 'absolute', // ทำให้ปุ่มลอย
        top: 50, // ปรับตำแหน่งให้เหมาะสมกับ SafeAreaView
        left: 15,
        zIndex: 10, // ให้อยู่ด้านบนสุด
        padding: 5,
    },
    // 🆕 Style สำหรับ Stack Header Title
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
        textAlign: 'center', // จัดให้อยู่ตรงกลางตามภาพตัวอย่าง
    },
    scrollContent: {
        paddingVertical: 5,
        paddingHorizontal: 16,
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
        overflow: 'hidden', 
    },
    cardNew: {
        // ...
    },
    newIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 8, 
        backgroundColor: '#0056b3', 
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    content: {
        flex: 1,
        // ปรับ paddingLeft เนื่องจากแถบสีน้ำเงินอยู่ด้านซ้าย
        paddingLeft: 5, 
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