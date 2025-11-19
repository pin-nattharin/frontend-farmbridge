import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; 
import * as Linking from 'expo-linking'; 

import BuyerNavbar from '../../components/ui/BuyerNavbar'; 
import api from '../../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Interface ให้ตรงกับข้อมูลจริงจาก API (order.controller.js)
interface OrderItem {
    id: number;
    quantity_ordered: string;
    total_price: string;
    status: string;
    confirmation_code: string;
    created_at: string;
    Listing?: {
        id: number;
        product_name: string;
        unit?: string;
        image_url?: string[];
    };
    Seller?: {
        fullname: string;
        phone: string;
        address?: string;
    };
}

const IMAGE_BASE_URL = 'http://10.0.2.2:3000'; // ปรับ IP ตามเครื่อง Server

// ----------------------------------------------------
// 2. Component: BuyHistoryCard
// ----------------------------------------------------
interface BuyHistoryCardProps {
    item: OrderItem;
    onPress: () => void;
}

const BuyHistoryCard: React.FC<BuyHistoryCardProps> = ({ item, onPress }) => {
    // ดึงข้อมูลมาแสดง (กัน Null)
    const listing = item.Listing;
    const seller = item.Seller;
    
    const productName = listing?.product_name || 'สินค้าไม่ระบุ';
    const quantity = parseFloat(item.quantity_ordered);
    const totalPrice = parseFloat(item.total_price);
    const unit = listing?.unit || 'หน่วย'; // ถ้าใน listing มี unit ให้ดึงมาใช้ (ถ้า API ส่งมา)
    
    // จัดการรูปภาพ
    let imageUrl = 'https://via.placeholder.com/150?text=No+Image';
    
    if (listing?.image_url && listing.image_url.length > 0) {
        let imagePath = listing.image_url[0];
        
        // ลบเครื่องหมายคำพูดและ Backslash ออก
        imagePath = imagePath.replace(/['"]+/g, '').replace(/\\/g, '/');

        if (imagePath.startsWith('content://') || imagePath.startsWith('file://')) {
            imageUrl = imagePath;
        } else if (imagePath.startsWith('http')) {
            imageUrl = imagePath;
        } else {
            // ถ้าเป็น path บน server
            const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            if (cleanPath.startsWith('uploads/')) {
                imageUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
            } else {
                imageUrl = `${IMAGE_BASE_URL}/uploads/${cleanPath}`;
            }
        }
    }

    const handleCall = () => {
        if (seller?.phone) Linking.openURL(`tel:${seller.phone}`);
        else Alert.alert("ไม่พบเบอร์โทรศัพท์");
    };

    // แปลงวันที่
    const dateStr = new Date(item.created_at).toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: '2-digit'
    });

    return (
        <TouchableOpacity style={cardStyles.touchable} onPress={onPress} activeOpacity={0.9}>
            <View style={cardStyles.card}>
                {/* รูปภาพ */}
                <Image source={{ uri: imageUrl }} style={cardStyles.image} resizeMode="cover" />
                
                {/* รายละเอียด */}
                <View style={cardStyles.infoContainer}>
                    
                    {/* Header: ชื่อสินค้า + ปุ่มโทร */}
                    <View style={cardStyles.headerRow}>
                        <Text style={cardStyles.productName} numberOfLines={1}>{productName}</Text>
                        <TouchableOpacity onPress={handleCall} style={{padding: 5}}>
                             <MaterialIcons name="phone" size={22} color="#28a745" />
                        </TouchableOpacity>
                    </View>

                    {/* รายละเอียด Order */}
                    <Text style={cardStyles.details}>
                        ซื้อเมื่อ: {dateStr} | รหัส: <Text style={{fontWeight:'bold'}}>{item.confirmation_code}</Text>
                    </Text>
                    <Text style={cardStyles.details}>
                        สถานะ: <Text style={{color: item.status === 'Completed' ? 'green' : 'orange'}}>{item.status}</Text>
                    </Text>
                    
                    {/* ที่อยู่ผู้ขาย (ถ้ามี) */}
                    <View style={cardStyles.locationRow}>
                        <MaterialIcons name="store" size={16} color="#0056b3" />
                        <Text style={cardStyles.locationText} numberOfLines={1}>
                            {seller?.fullname || 'ร้านค้า'}
                        </Text>
                    </View>

                    {/* ยอดรวม */}
                    <View style={cardStyles.totalRow}>
                        <Text style={cardStyles.totalLabel}>{quantity} {unit}</Text>
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
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile'); 
    
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ ดึงข้อมูลจาก API
    const fetchHistory = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            // เรียก API ที่เตรียมไว้ใน order.controller.js
            const response = await api.get('/orders/history/purchase', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setOrders(response.data);

        } catch (error) {
            console.error("Fetch History Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // โหลดทุกครั้งที่เข้าหน้า
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchHistory();
        }, [])
    );

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') router.replace('/buyer/homeBuyer');
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'list') router.replace('/buyer/historyDemand');
        else if (tab === 'notify') router.replace('/buyer/notificationDemand');
        else if (tab === 'profile') router.replace('/buyer/buyerProfile');
    };
    
    // กดแล้วไปหน้า Product Detail ของสินค้านั้น
    const handleCardPress = (listingId: number) => {
        if (listingId) {
            router.push({
                pathname: '/productDetail',
                params: { id: listingId }
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.contentWrapper}>
                {/* ปุ่มย้อนกลับ */}
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0056b3" />
                </TouchableOpacity>

                <Text style={styles.pageTitle}>ประวัติการสั่งซื้อ</Text> 
                
                {loading ? (
                    <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color="#0056b3"/></View>
                ) : (
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchHistory();}} />}
                    >
                        {orders.length === 0 ? (
                            <View style={{alignItems:'center', marginTop: 50}}>
                                <Text style={{color:'#999', fontSize: 16}}>ยังไม่มีประวัติการสั่งซื้อ</Text>
                            </View>
                        ) : (
                            orders.map(item => (
                                <BuyHistoryCard 
                                    key={item.id} 
                                    item={item} 
                                    onPress={() => handleCardPress(item.Listing?.id || 0)} 
                                />
                            ))
                        )}
                        <View style={{ height: 20 }} /> 
                    </ScrollView>
                )}
                
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
        marginTop: 70,
        marginBottom: 20,
        textAlign: 'center',
    },
    scrollContent: {
        paddingVertical: 5, 
        paddingBottom: 80, 
    },
    backButton: {
        position: 'absolute', 
        top: 50, 
        left: 15,
        zIndex: 10, 
        padding: 5,
    },
});

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
        backgroundColor: '#FFF'
    },
    card: {
        flexDirection: 'row',
        padding: 12, 
        alignItems: 'flex-start',
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#eee'
    },
    infoContainer: {
        flex: 1,
        paddingLeft: 12,
        justifyContent: 'space-between',
        minHeight: 90
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    details: {
        fontSize: 12,
        color: '#555',
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 6,
    },
    locationText: {
        fontSize: 12,
        color: '#777',
        marginLeft: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 6,
        marginTop: 2,
    },
    totalLabel: {
        fontSize: 13,
        color: '#333',
    },
    totalPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0056b3', 
    },
});