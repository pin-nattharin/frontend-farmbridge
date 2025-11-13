import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router'; // ใช้ Stack เพื่อตั้งค่า Header

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
// 💡 Path เหล่านี้สมมติว่า HistoryDemandScreen อยู่ใน app/buyer/
import BuyerNavbar from '../../components/ui/BuyerNavbar'; 

// ----------------------------------------------------
// DUMMY DATA
// ----------------------------------------------------
const demandList = [
    { 
        id: '1', 
        productName: 'มะม่วง', 
        quantity: 30, 
        unit: 'กิโลกรัม', 
        imageUrl: 'https://picsum.photos/id/66/100/100',
    },
    { 
        id: '2', 
        productName: 'ทุเรียน', 
        quantity: 20, 
        unit: 'กิโลกรัม', 
        imageUrl: 'https://picsum.photos/id/1080/100/100',
    },
    { 
        id: '3', 
        productName: 'สับปะรด', 
        quantity: 50, 
        unit: 'ลูก', 
        imageUrl: 'https://picsum.photos/id/35/100/100',
    },
];

// ----------------------------------------------------
// Component Card (DemandCard - ถูกย้ายมาไว้ด้านในเพื่อความสมบูรณ์ของโค้ด)
// ----------------------------------------------------

interface DemandCardProps {
    id: string;
    productName: string;
    quantity: number;
    unit: string;
    imageUrl: string;
    onDelete: (id: string) => void;
}

const DemandCard: React.FC<DemandCardProps> = ({
    id,
    productName,
    quantity,
    unit,
    imageUrl,
    onDelete,
}) => {
    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.imageContainer}>
            {/* 1. รูปภาพ */}
            <Image
                source={{ uri: imageUrl }} 
                style={cardStyles.image}
                resizeMode="cover"
            />
        </View>
            
            {/* 2. รายละเอียดและปุ่ม */}
            <View style={cardStyles.infoContainer}>
                <View>
                    <Text style={cardStyles.productName}>{productName}</Text>
                    <Text style={cardStyles.details}>
                        จำนวน : {quantity} {unit}
                    </Text>
                </View>
                
                {/* ปุ่ม ลบ */}
                <TouchableOpacity 
                    style={cardStyles.deleteButton}
                    onPress={() => onDelete(id)}
                >
                    <Text style={cardStyles.deleteButtonText}>ลบ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


// ----------------------------------------------------
// 3. หน้าจอหลัก HistoryDemandScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

export default function HistoryDemandScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('list'); 
    const [demands, setDemands] = useState(demandList);

    const handleDelete = (id: string) => {
        Alert.alert(
            "ยืนยันการลบ",
            "คุณต้องการลบรายการนี้ใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                { 
                    text: "ลบ", 
                    onPress: () => {
                        setDemands(demands.filter(d => d.id !== id));
                        console.log(`Demand ${id} deleted.`);
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        // ใช้ Absolute Path ในการนำทาง
        if (tab === 'home') router.replace('/buyer/homeBuyer'); 
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'notify') router.replace('/buyer/notificationDemand');
        else if (tab === 'profile') router.replace('/buyer/buyerProfile');    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    // 1. แสดง Header ของ Stack Router และกำหนด Style
                    headerShown: true, 
                    title: 'ประวัติความต้องการ', 
                }} 
            />
            
            <View style={styles.contentWrapper}>
                <Text style={styles.pageTitle}>ประวัติความต้องการ</Text>
                
                {/* Body Content */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {demands.map(demand => (
                        <DemandCard
                            key={demand.id}
                            {...demand}
                            onDelete={handleDelete}
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
// 4. Stylesheet (สำหรับหน้าจอหลัก)
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
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollContent: {
        paddingVertical: 15,
        paddingBottom: 80, // เว้นที่ว่างให้ Navbar
    },
});


// ----------------------------------------------------
// 5. Stylesheet (สำหรับ Demand Card)
// ----------------------------------------------------

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        marginHorizontal: 16,
        paddingRight: 15, 
        alignItems: 'center',
    },
    imageContainer: {
        width: 100, 
        height: 100, 
        borderRadius: 8, 
        margin: 20, 
        overflow: 'hidden', 
        justifyContent: 'center', 
        alignItems: 'center',  
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    details: {
        fontSize: 16,
        color: '#555',
        marginBottom: 3,
    },
    deleteButton: {
        backgroundColor: '#0056b3', // สีน้ำเงินเข้ม
        borderRadius: 6,
        paddingHorizontal: 20,
        paddingVertical: 8,
        margin: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});