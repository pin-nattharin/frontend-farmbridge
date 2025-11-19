import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from 'react-native';

import { Stack, useRouter, useFocusEffect } from 'expo-router';
import BuyerNavbar from '../../components/ui/BuyerNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

const getInitials = (fullname: string): string => {
    if (!fullname) return '';
    const names = fullname.split(' ');
    const firstNameInitial = names[0] ? names[0][0] : '';
    const lastNameInitial = names[1] ? names[1][0] : '';
    return `${firstNameInitial}${lastNameInitial}`;
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoFieldContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const BuyerProfileScreen = () => {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    const [buyerData, setBuyerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                setLoading(true);
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    
                    if (!token) {
                        Alert.alert("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนใช้งาน");
                        router.replace('/LoginScreen');
                        return;
                    }

                    const response = await api.get('/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    setBuyerData(response.data);

                } catch (error: any) {
                    console.error("Failed to load buyer data:", error);
                    if (error.response && error.response.status === 401) {
                        Alert.alert("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่");
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('userData');
                        router.replace('/LoginScreen');
                    } else {
                        Alert.alert("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
                    }
                } finally {
                    setLoading(false);
                }
            };
            loadUserData();
        }, [])
    );

    const handleEditProfile = () => {
        router.push('/editProfile');
    };

    const handleHistoryBuy = () => {
        router.push('/buyer/historyBuy');
    }

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบหรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ออกจากระบบ",
                    onPress: async () => { 
                        console.log("🟢 [Logout Step 1] User confirmed logout");
                       try {
                            const token = await AsyncStorage.getItem('userToken');
                            console.log("🔵 [Logout Step 2] Current Token found:", token ? "Yes" : "No");
                            if (token) {
                                console.log("🟡 [Logout Step 3] Calling API /auth/logout...");
                                await api.post('/auth/logout', {}, {
                                    headers: { Authorization: `Bearer ${token}` }
                                })
                                .then(() => console.log("✅ [Logout Step 4] API Logout Success"))
                                .catch((err) => console.log("⚠️ [Logout Step 4] API Logout Failed (Network or Token invalid):", err.message));
                            }
                            await AsyncStorage.removeItem('userToken');
                            await AsyncStorage.removeItem('userData');
                            router.replace('/LoginScreen');
                        } catch (e) {
                             console.error("🔴 [Logout Error] Process failed:", e);
                        } finally {
                            console.log("🟠 [Logout Step 5] Clearing AsyncStorage...");
                            // ⭐️ บังคับล้าง Token ในเครื่องเสมอ ไม่ว่าจะยิง API สำเร็จหรือไม่
                            await AsyncStorage.removeItem('userToken');
                            await AsyncStorage.removeItem('userData');
                            
                            console.log("⚫ [Logout Step 6] Storage cleared. Navigating to LoginScreen.");
                            router.replace('./index');
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
        } else if (tab === 'list') {
            router.replace('/buyer/historyDemand');
        } else if (tab === 'notify') {
            router.replace('/buyer/notificationDemand');
        }
    };

    // ✅ 1. เช็ค Loading ก่อน (สำคัญมาก ห้ามเอาไว้หลัง const initials)
    if (loading) {
        return (
            <SafeAreaView style={styles.fullscreen}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0056b3" />
                    <Text style={{ marginTop: 10, color: '#666' }}>กำลังโหลดข้อมูล...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ✅ 2. เช็คว่ามีข้อมูลจริงหรือไม่
    if (!buyerData) {
        return null; 
    }

    // ✅ 3. คำนวณค่าต่างๆ หลังจากมั่นใจว่ามีข้อมูลแล้วเท่านั้น
    const initials = getInitials(buyerData.fullname);
    const firstName = buyerData.fullname ? buyerData.fullname.split(' ')[0] : '';
    const lastName = buyerData.fullname && buyerData.fullname.split(' ').length > 1 ? buyerData.fullname.split(' ')[1] : '';

    return (
        <SafeAreaView style={styles.fullscreen}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.contentWrapper}>
                <ScrollView style={styles.container}>
                    <View style={styles.headerBackground}>
                        <Text style={styles.headerTitle}>โปรไฟล์</Text>
                    </View>

                    <View style={styles.contentCard}>
                        <View style={styles.initialCircle}>
                            <Text style={styles.initialText}>{initials}</Text>
                        </View>

                        <Text style={styles.fullName}>{buyerData.fullname}</Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.buttonOutline} onPress={handleEditProfile}>
                                <Text style={styles.buttonOutlineText}>แก้ไขโปรไฟล์</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonSolid} onPress={handleHistoryBuy}>
                                <Text style={styles.buttonSolidText}>ประวัติการซื้อ</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxTitle}>ข้อมูลส่วนตัว</Text>
                            <InfoField label="First Name" value={firstName} />
                            <InfoField label="Last Name" value={lastName} />
                            <InfoField label="Email Address" value={buyerData.email || '-'} />
                            <InfoField label="Phone" value={buyerData.phone || '-'} />
                            {/* แสดงที่อยู่ถ้ามี */}
                            <InfoField label="Address" value={buyerData.address || '-'} />
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>

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
};

// --- (Styles ทั้งหมดเหมือนเดิม) ---
const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    contentWrapper: {
        flex: 1,
    },
    container: {
        flex: 1, 
        backgroundColor: '#f4f4f4',
    },
    headerBackground: {
        backgroundColor: '#0056b3',
        height: 220,
        paddingTop: 60,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 25,
    },
    contentCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingTop: 80,
    },
    initialCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: -60,
        borderWidth: 4,
        borderColor: 'white',
    },
    initialText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#555',
    },
    fullName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    verifiedBadge: {
        backgroundColor: '#e6f7eb',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginTop: 8,
    },
    verifiedText: {
        color: '#28a745',
        fontWeight: 'bold',
        fontSize: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 24,
    },
    buttonOutline: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#0056b3',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    buttonOutlineText: {
        color: '#0056b3',
        fontWeight: 'bold',
    },
    buttonSolid: {
        flex: 1,
        backgroundColor: '#28a745',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginLeft: 8,
    },
    buttonSolidText: {
        color: 'white',
        fontWeight: 'bold',
    },
    infoBox: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        marginTop: 24,
        padding: 16,
    },
    infoBoxTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0056b3',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 8,
        marginBottom: 12,
    },
    infoFieldContainer: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#888',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginTop: 4,
    },
    logoutButton: {
        width: '100%',
        backgroundColor: '#E53E3E',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default BuyerProfileScreen;