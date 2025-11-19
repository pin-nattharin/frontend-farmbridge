// notification.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, StatusBar } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

import NavbarFarmer from '../../components/ui/FarmerNavbar';
import api from '../../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
    id: number;
    quantity_ordered: string;
    total_price: string;
    status: string; 
    pickup_slot: string; 
    created_at: string;
    Listing: {
        id: number;
        product_name: string;
    };
    Buyer: {
        id: number;
        fullname: string;
        phone?: string; 
    };
}

export default function SaleNotificationScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSalesHistory = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await api.get('/orders/history/sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setOrders(response.data);
        } catch (error) {
            console.error("Fetch Sales Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSalesHistory();
        }, [])
    );

    const handleCardPress = (item: OrderItem) => {
        router.push({
            pathname: '/farmer/verifyPickup',
            params: { orderId: item.id } 
        });
    };

    const handleCall = (phone?: string) => {
        if (phone) Linking.openURL(`tel:${phone}`);
    };
    
    const handleNavPress = (tab: 'home' | 'chart' | 'add' | 'notifications' | 'profile') => {
        if (tab === 'home') router.replace('/farmer/homeFarmer');
        else if (tab === 'add') router.push('/farmer/createPost');
        else if (tab === 'chart') router.replace('/farmer/dashboard');
        else if (tab === 'profile') router.push('/farmer/farmerProfile');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ⭐️ ปรับ Header ตรงนี้ให้ขยับลงมา */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                     <MaterialCommunityIcons name="arrow-left" size={28} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>การแจ้งเตือน</Text>
            </View>

            <View style={styles.contentWrapper}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0056b3" style={{marginTop: 20}}/>
                ) : (
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchSalesHistory();}} />}
                    >
                        {orders.length === 0 ? (
                            <Text style={{textAlign:'center', color:'#999', marginTop:20}}>ไม่มีรายการแจ้งเตือน</Text>
                        ) : (
                            orders.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={cardStyles.card}
                                    onPress={() => handleCardPress(item)}
                                    activeOpacity={0.9}
                                >
                                    <View style={cardStyles.leftBar} />
                                    
                                    <View style={cardStyles.content}>
                                        <View style={cardStyles.headerRow}>
                                            <Text style={cardStyles.titleText}>ขายได้แล้ว !</Text>
                                            <TouchableOpacity onPress={() => handleCall(item.Buyer?.phone)}>
                                                <MaterialCommunityIcons name="phone" size={24} color="#28a745" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={cardStyles.body}>
                                            <Text style={cardStyles.detailText}>
                                                <Text style={cardStyles.blueText}>{item.Buyer?.fullname || 'ลูกค้า'}</Text>
                                                {' '}ชำระค่า{item.Listing?.product_name}
                                            </Text>
                                            
                                            <Text style={cardStyles.detailText}>
                                                {parseFloat(item.quantity_ordered).toFixed(0)} กก. เป็นเงิน {parseFloat(item.total_price).toLocaleString()} บาทอยู่ในระบบ
                                            </Text>
                                            
                                            <Text style={cardStyles.subDetailText}>
                                                กรุณาเตรียมของก่อน {item.pickup_slot || new Date(item.created_at).toLocaleDateString('th-TH')}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                )}

                <NavbarFarmer
                   activeTab="notifications"
                   onHomePress={() => handleNavPress('home')}
                   onChartPress={() => handleNavPress('chart')}
                   onAddPress={() => handleNavPress('add')}
                   onNotificationsPress={() => {}}
                   onProfilePress={() => handleNavPress('profile')}
                />
            </View>
        </SafeAreaView>
    );
}

// ----------------------------------------------------
// Stylesheet
// ----------------------------------------------------

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        //backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        // ⭐️ เพิ่ม marginTop เพื่อขยับลงมาให้เหมือนรูป
        marginTop: 30, 
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        position: 'relative',
        paddingHorizontal: 16,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        padding: 5, // เพิ่มพื้นที่กดให้ง่ายขึ้น
    },
    pageTitle: {
        fontSize: 26, // เพิ่มขนาดตัวอักษรอีกนิดเพื่อให้ชัดเจน
        fontWeight: 'bold',
        color: '#0047ab', 
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    scrollContent: {
        paddingVertical: 15,
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
});

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minHeight: 100,
    },
    leftBar: {
        width: 10,
        backgroundColor: '#0047ab',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0047ab',
    },
    body: {
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 22,
    },
    blueText: {
        color: '#0047ab',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    subDetailText: {
        fontSize: 13,
        color: '#0047ab',
        marginTop: 4,
    }
});