import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

import NavbarFarmer from '../../components/ui/FarmerNavbar';
import api from '../../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationItem {
    id: number;
    type: string;
    message: string;
    related_id: number;
    created_at: string;
    is_read: boolean;
    OrderInfo?: {
        total_price: string;
        quantity_ordered: string;
        Buyer?: {
            fullname: string;
            phone: string;
        };
    };
}

export default function SaleNotificationScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await api.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Fetch Noti Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const handleCardPress = (item: NotificationItem) => {
        //if (item.type === 'sale' && item.related_id) {
            // ✅ พาไปหน้า verifyPickup พร้อมส่ง orderId
            router.push({
                pathname: '/farmer/verifyPickup',
                params: { orderId: item.related_id } 
            });
        //} else {
            //Alert.alert("แจ้งเตือน", item.message);
        //}
    };

    const handleCall = (phone: string) => {
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
            <View style={styles.contentWrapper}>
                <Text style={styles.pageTitle}>การแจ้งเตือน</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0056b3" style={{marginTop: 20}}/>
                ) : (
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchNotifications();}} />}
                    >
                        {notifications.length === 0 ? (
                            <Text style={{textAlign:'center', color:'#999', marginTop:20}}>ไม่มีการแจ้งเตือน</Text>
                        ) : (
                            notifications.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[cardStyles.card, !item.is_read && { backgroundColor: '#e6f7ff' }]}
                                    onPress={() => handleCardPress(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={cardStyles.indicator} />
                                    <View style={cardStyles.content}>
                                        <View style={cardStyles.headerRow}>
                                            <Text style={cardStyles.statusText}>
                                                {item.type === 'sale' ? '📦 ขายได้แล้ว!' : '🔔 แจ้งเตือน'}
                                            </Text>
                                            {item.OrderInfo?.Buyer?.phone && (
                                                <TouchableOpacity onPress={() => handleCall(item.OrderInfo!.Buyer!.phone)}>
                                                    <MaterialCommunityIcons name="phone" size={24} color="#28a745" />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        <Text style={cardStyles.messageLine} numberOfLines={2}>
                                            {item.message}
                                        </Text>
                                        
                                        <Text style={cardStyles.dateText}>
                                            {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                        </Text>
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
    dateText: { 
        fontSize: 12, 
        color: '#888', 
        marginTop: 5, 
        textAlign: 'right' 
    },
});