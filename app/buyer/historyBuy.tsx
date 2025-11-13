import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ScrollView, 
    TouchableOpacity, // 🆕 Import TouchableOpacity
    Image, 
    Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; 
import * as Linking from 'expo-linking'; 

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import BuyerNavbar from '../../components/ui/BuyerNavbar'; 

// ----------------------------------------------------
// 1. DUMMY DATA
// ----------------------------------------------------

interface BuyHistoryItem {
    id: string; // 🆕 เพิ่ม id สำหรับการนำทาง
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number; 
    totalPrice: number; 
    sellerLocation: string;
    sellerPhone: string;
    imageUrl: string;
}

const historyList: BuyHistoryItem[] = [
    { 
        id: '1', 
        productName: 'มะม่วง', 
        quantity: 30, 
        unit: 'กิโลกรัม', 
        pricePerUnit: 30,
        totalPrice: 900,
        sellerLocation: 'สบายดีฟาร์ม อ.ฝาง, จ.เชียงใหม่',
        sellerPhone: '0981234567',
        imageUrl: 'https://picsum.photos/id/66/100/100',
    },
    { 
        id: '2', 
        productName: 'ทุเรียน', 
        quantity: 20, 
        unit: 'กก.', 
        pricePerUnit: 120,
        totalPrice: 2400,
        sellerLocation: 'แฮปปี้ฟาร์ม อ.ดอยหล่อ, จ.เชียงใหม่',
        sellerPhone: '0997654321',
        imageUrl: 'https://picsum.photos/id/1080/100/100',
    },
];

// ----------------------------------------------------
// 2. Component: BuyHistoryCard
// ----------------------------------------------------

interface BuyHistoryCardProps extends BuyHistoryItem {
    onPress: () => void; // เพิ่ม Prop สำหรับการคลิก
}

const BuyHistoryCard: React.FC<BuyHistoryCardProps> = ({
    onPress, // รับ onPress
    productName,
    quantity,
    unit,
    pricePerUnit,
    totalPrice,
    sellerLocation,
    sellerPhone,
    imageUrl,
}) => {
    // ฟังก์ชันสำหรับโทรออก
    const handleCall = () => {
        // ต้องหยุดการแพร่เหตุการณ์เพื่อไม่ให้เรียก onPress ของการ์ด
        // e.stopPropagation(); 
        Linking.openURL(`tel:${sellerPhone}`);
    };

    return (
        // 🆕 ใช้ TouchableOpacity ครอบ View ทั้งหมด เพื่อให้คลิกได้
        <TouchableOpacity style={cardStyles.touchable} onPress={onPress}>
            <View style={cardStyles.card}>
                {/* 1. รูปภาพ */}
                <Image
                    source={{ uri: imageUrl }} 
                    style={cardStyles.image}
                    resizeMode="cover"
                />
                
                {/* 2. รายละเอียด */}
                <View style={cardStyles.infoContainer}>
                    
                    {/* Product Name และ Call Button */}
                    <View style={cardStyles.headerRow}>
                        <Text style={cardStyles.productName}>{productName}</Text>
                        <TouchableOpacity 
                            onPress={handleCall} 
                            // 💡 หากต้องการให้ปุ่มโทรออกทำงานเท่านั้น
                            // และไม่ให้เรียก onPress ของการ์ด ให้เพิ่ม:
                            // onPress={(e) => { e.stopPropagation(); handleCall(); }} 
                        >
                            <MaterialIcons name="call" size={24} color="#28a745" />
                        </TouchableOpacity>
                    </View>

                    {/* รายละเอียดสินค้า */}
                    <Text style={cardStyles.details}>
                        จำนวน : {quantity} {unit}
                    </Text>
                    <Text style={cardStyles.details}>
                        ในราคา {pricePerUnit} บาท/{unit}
                    </Text>
                    
                    {/* พิกัดผู้ขาย */}
                    <View style={cardStyles.locationRow}>
                        <MaterialIcons name="location-pin" size={16} color="#0056b3" />
                        <Text style={cardStyles.locationText} numberOfLines={1}>
                            {sellerLocation}
                        </Text>
                    </View>

                    {/* ยอดรวม */}
                    <View style={cardStyles.totalRow}>
                        <Text style={cardStyles.totalLabel}>ยอดชำระเงินทั้งหมด</Text>
                        <Text style={cardStyles.totalPrice}>
                            ฿ {totalPrice.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ----------------------------------------------------
// 3. หน้าจอหลัก HistoryBuyScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

export default function HistoryBuyScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('list'); 
    
    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') router.replace('/buyer/homeBuyer'); 
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'profile') router.replace('/buyer/buyerProfile'); 
        else if (tab === 'notify') router.replace('/buyer/notificationDemand');
    };
    
    // ฟังก์ชันสำหรับส่งไปยังหน้า ProductDetailScreen
    const handleCardPress = (id: string) => {
        // ใช้ router.push เพื่อนำทางไปยังหน้า ProductDetailScreen
        // และส่ง product id ไปเป็น query parameter
        router.push(`/productDetail?id=${id}`); 
        // หากไฟล์ ProductDetailScreen.tsx อยู่ที่ /app/productDetail.tsx
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    headerShown: true, 
                    title: 'ประวัติการซื้อ', 
                }} 
            />
            
            <View style={styles.contentWrapper}>
                
                <Text style={styles.pageTitle}>ประวัติการซื้อ</Text> 
                
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {historyList.map(item => (
                        <BuyHistoryCard 
                            key={item.id} 
                            {...item} 
                            onPress={() => handleCardPress(item.id)} // ส่งฟังก์ชัน onPress ไป
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
    headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#0056b3', 
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
        marginBottom: 20,
        textAlign: 'center',
    },
    scrollContent: {
        paddingVertical: 5, 
        paddingBottom: 80, 
    },
});


// ----------------------------------------------------
// 5. Stylesheet (สำหรับ BuyHistoryCard)
// ----------------------------------------------------

const cardStyles = StyleSheet.create({
    touchable: {
        marginHorizontal: 16,
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        padding: 10, 
        alignItems: 'flex-start',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
        paddingLeft: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    details: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    locationText: {
        fontSize: 12,
        color: '#555',
        marginLeft: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 14,
        color: '#333',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0056b3', 
    },
});