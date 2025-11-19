// notificationDemand.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

import BuyerNavbar from '../../components/ui/BuyerNavbar'; 
import api from '../../services/api';
import { useAuth } from '../context/AuthContext';

// Interface สำหรับข้อมูลที่ได้จาก API
interface NotificationItem {
    id: number;
    type: string;
    message: string; 
    related_id: number | null; 
    is_read: boolean;
    distance: number | null; 
    created_at: string;
}

// ----------------------------------------------------
// Component: NotificationCard
// ----------------------------------------------------
interface NotificationCardProps {
    title: string;
    detail: string;
    message: string;
    isNew: boolean;
    onPress: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    title,
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
            {/* Indicator สีน้ำเงินสำหรับรายการที่ยังไม่ได้อ่าน */}
            {!isNew && <View style={cardStyles.readIndicator} />} 
            {isNew && <View style={cardStyles.newIndicator} />}

            <View style={cardStyles.content}>
                <View style={cardStyles.headerRow}>
                    <Text style={cardStyles.productName}>
                        {title}
                    </Text>
                    {detail ? <Text style={cardStyles.detailText}>{detail}</Text> : null}
                </View>
                <Text style={cardStyles.messageText} numberOfLines={3}>
                    {message}
                </Text>
                <Text style={cardStyles.clickText}>คลิกเพื่อดูรายละเอียด</Text>
            </View>
        </TouchableOpacity>
    );
};

// ----------------------------------------------------
// หน้าจอหลัก NotificationScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

export default function NotificationScreen() {
    const router = useRouter();
    const { token } = useAuth(); 
    const [activeTab, setActiveTab] = useState<ActiveTab>('notify'); 
    
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ฟังก์ชันดึงข้อมูลแจ้งเตือน
    const fetchNotifications = async () => {
        if (!token) return;
        try {
        const response = await api.get('/notifications');
        
        // 1️⃣ เพิ่มบรรทัดนี้เพื่อดูข้อมูลดิบใน Terminal หรือ Debugger
        console.log("Raw Notifications form API:", JSON.stringify(response.data, null, 2));

        // 2️⃣ ลอง Comment บรรทัด Filter ออกชั่วคราว เพื่อดูว่ามีข้อมูลมาไหม (ไม่สน Type)
        // const matchNotifications = response.data.filter((item: NotificationItem) => item.type === 'match');
        
        // 3️⃣ ถ้า Backend ส่ง type มาไม่ตรงเป๊ะ (เช่น 'Match' หรือ 'demand_match') ให้แก้เงื่อนไข หรือรับทั้งหมดไปก่อนเพื่อเทส
        // ตัวอย่างการแก้ให้ยืดหยุ่นขึ้น (เช็คทั้งตัวเล็กตัวใหญ่)
        const matchNotifications = response.data.filter((item: NotificationItem) => 
            item.type && item.type.toLowerCase() === 'match'
        );

        // ถ้าต้องการแสดงทั้งหมดเพื่อเทส UI ให้ใช้บรรทัดนี้แทน:
        // setNotifications(response.data); 
        
        setNotifications(matchNotifications);

    } catch (error) {
        console.error("Fetch Notifications Error:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};
    // โหลดข้อมูลใหม่ทุกครั้งที่เข้ามาที่หน้านี้
    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [token])
    );

    const handleBack = () => {
        router.back();
    };
    
    // จัดการเมื่อกดที่การ์ด
    const handleCardPress = async (item: NotificationItem) => {
        // 1. ทำเครื่องหมายว่าอ่านแล้ว
        try {
            if (!item.is_read) {
                await api.post(`/notifications/${item.id}/read`);
                setNotifications(prev => 
                    prev.map(n => n.id === item.id ? { ...n, is_read: true } : n)
                );
            }
        } catch (err) {
            console.log("Mark read error:", err);
        }

        // 2. นำทางไปยังหน้า Product Detail
        if (item.related_id) {
            router.push({
                pathname: '/productDetail',
                params: { id: item.related_id }
            });
        } else {
            Alert.alert("แจ้งเตือน", "ไม่พบข้อมูลสินค้าสำหรับรายการนี้");
        }
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') router.replace('/buyer/homeBuyer');
        else if (tab === 'add') router.push('/buyer/createDemand');
        else if (tab === 'list') router.replace('/buyer/historyDemand');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ปุ่มย้อนกลับ */}
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#0056b3" />
            </TouchableOpacity>
                        
            <View style={styles.contentWrapper}>
                <Text style={styles.pageTitle}>การแจ้งเตือน</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />
                ) : (
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />
                        }
                    >
                        {notifications.length === 0 ? (
                            <Text style={styles.emptyText}>ยังไม่พบสินค้าที่คุณต้องการ</Text>
                        ) : (
                            notifications.map((item) => {
                                // ⭐️ กำหนดหัวข้อให้ชัดเจนว่าเป็นสินค้าที่ตรงกับ Demand
                                const title = "เจอสินค้าที่คุณตามหา!"; 
                                
                                const distanceDetail = item.distance 
                                    ? `(ห่าง ${item.distance.toFixed(1)} กม.)` 
                                    : '';

                                return (
                                    <NotificationCard
                                        key={item.id}
                                        title={title}
                                        detail={distanceDetail}
                                        message={item.message} 
                                        isNew={!item.is_read}
                                        onPress={() => handleCardPress(item)}
                                    />
                                );
                            })
                        )}
                        <View style={{ height: 20 }} /> 
                    </ScrollView>
                )}
                
                <BuyerNavbar
                    onHomePress={() => handleNavPress('home')}
                    onListPress={() => handleNavPress('list')}
                    onAddPress={() => handleNavPress('add')}
                    onNotifyPress={() => handleNavPress('notify')}
                    onProfilePress={() => setActiveTab('profile')}
                    activeTab={activeTab}
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
        backgroundColor: '#f4f4f4',
    },
    contentWrapper: {
        flex: 1,
    },
    backButton: {
        position: 'absolute', 
        top: 50, 
        left: 15,
        zIndex: 10, 
        padding: 5,
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
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
        fontSize: 16,
    }
});

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'flex-start', 
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        minHeight: 100,
    },
    cardNew: {
        backgroundColor: '#F0F8FF', 
    },
    newIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 6, 
        backgroundColor: '#0056b3', 
    },
    readIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 6, 
        backgroundColor: '#E0E0E0', 
    },
    content: {
        flex: 1,
        paddingLeft: 12, 
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap'
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    detailText: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#28a745', 
    },
    messageText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
        marginBottom: 8,
    },
    clickText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        alignSelf: 'flex-end'
    }
});