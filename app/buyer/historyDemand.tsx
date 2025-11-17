import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 

import BuyerNavbar from '../../components/ui/BuyerNavbar'; 
import api from '../../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface ให้ตรงกับ Model Demands
interface DemandItem {
    id: number;
    product_name: string;
    desired_quantity: string;
    unit: string;
    created_at: string;
    // (อาจจะมี field อื่นๆ เพิ่มเติม)
}

// ----------------------------------------------------
// Component Card
// ----------------------------------------------------
interface DemandCardProps {
    id: number;
    productName: string;
    quantity: string;
    unit: string;
    onDelete: (id: number) => void;
}
    
const DemandCard: React.FC<DemandCardProps> = ({
    id,
    productName,
    quantity,
    unit,
    onDelete,
}) => {
    // เลือกรูปภาพตามชื่อสินค้า (หรือใช้ Default)
    let imageUrl = 'https://via.placeholder.com/100';
    if (productName.includes('มะม่วง')) imageUrl = 'https://picsum.photos/id/66/100/100'; // ตัวอย่าง
    else if (productName.includes('ทุเรียน')) imageUrl = 'https://picsum.photos/id/1080/100/100';

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }} 
                    style={cardStyles.image}
                    resizeMode="cover"
                />
            </View>
            
            <View style={cardStyles.infoContainer}>
                <View>
                    <Text style={cardStyles.productName}>{productName}</Text>
                    <Text style={cardStyles.details}>
                        จำนวน : {quantity} {unit}
                    </Text>
                </View>
                
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
// หน้าจอหลัก HistoryDemandScreen
// ----------------------------------------------------

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

export default function HistoryDemandScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('list'); 
    
    const [demands, setDemands] = useState<DemandItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchDemands = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await api.get('/demands', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setDemands(response.data);
        } catch (error) {
            console.error("Fetch Demands Error:", error);
            // Alert.alert("ผิดพลาด", "ไม่สามารถดึงข้อมูลประวัติได้");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // เรียกใช้เมื่อหน้าจอถูกโฟกัส (เปิดเข้ามา)
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchDemands();
        }, [])
    );

    const handleBack = () => {
        router.back();
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "ยืนยันการลบ",
            "คุณต้องการลบรายการนี้ใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                { 
                    text: "ลบ", 
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            // ยิง API ลบ
                            await api.delete(`/demands/${id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            
                            // อัปเดตหน้าจอโดยไม่ต้องโหลดใหม่ทั้งหมด
                            setDemands(prev => prev.filter(d => d.id !== id));
                            Alert.alert("สำเร็จ", "ลบรายการเรียบร้อยแล้ว");
                        } catch (error) {
                            console.error("Delete Error:", error);
                            Alert.alert("ล้มเหลว", "ไม่สามารถลบรายการได้");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'home') {
            router.replace('/buyer/homeBuyer');
        } else if (tab === 'add') {
            router.push('/buyer/createDemand');
        } else if (tab === 'notify') {
            router.replace('/buyer/notificationDemand');
        } else if (tab === 'profile') {
            router.push('/buyer/buyerProfile');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#0056b3" />
            </TouchableOpacity>
            
            <View style={styles.contentWrapper}>
                <Text style={styles.pageTitle}>ประวัติความต้องการ</Text>
                
                {loading ? (
                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size="large" color="#0056b3" />
                    </View>
                ) : (
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchDemands();}} />
                        }
                    >
                        {demands.length === 0 ? (
                            <View style={{marginTop: 50, alignItems: 'center'}}>
                                <Text style={{color: '#999', fontSize: 16}}>ไม่มีประวัติความต้องการ</Text>
                            </View>
                        ) : (
                            demands.map(demand => (
                                <DemandCard
                                    key={demand.id}
                                    id={demand.id}
                                    productName={demand.product_name}
                                    quantity={demand.desired_quantity}
                                    unit={demand.unit}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                        <View style={{ height: 20 }} /> 
                    </ScrollView>
                )}
                
                <BuyerNavbar
                    onHomePress={() => handleNavPress('home')}
                    onListPress={() => {}} // อยู่หน้านี้อยู่แล้ว
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
// 5. Stylesheet (สำหรับ Demand Card)
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
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollContent: {
        paddingVertical: 15,
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