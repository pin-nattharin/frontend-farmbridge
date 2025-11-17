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

import { useRouter, useFocusEffect } from 'expo-router';
import FarmerNavbar from '../../components/ui/FarmerNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api'; 

// --- ฟังก์ชัน Helper ---
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

const FarmerProfileScreen = () => {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'home' | 'chart' | 'add' | 'notifications' | 'profile'>('profile');
    
    const [farmerData, setFarmerData] = useState<any>(null);
    const [loading, setLoading] = useState(true); 

    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                setLoading(true);
                try {
                    // 1. ดึง Token (ใช้ชื่อ userToken ตาม AuthContext)
                    const token = await AsyncStorage.getItem('userToken');
                    
                    if (!token) {
                        Alert.alert("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนใช้งาน");
                        router.replace('/LoginScreen');
                        return;
                    }

                    // 2. ยิง API ดึงข้อมูลสด
                    const response = await api.get('/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // 3. แสดงผลทันที (❌ ไม่มีการบันทึก setItem ลงเครื่อง)
                    setFarmerData(response.data);

                } catch (error: any) {
                    console.error("Failed to load user data:", error);
                    
                    if (error.response && error.response.status === 401) {
                        Alert.alert("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่");
                    } else {
                        Alert.alert("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
                    }
                    
                    // ล้างข้อมูลและกลับหน้า Login
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('userData');
                    router.replace('/LoginScreen');
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

    const handleHistorySale = () => {
        router.push('/farmer/historySale');
    };

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบหรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ออกจากระบบ",
                    onPress: async () => { 
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (token) {
                                await api.post('/auth/logout', {}, {
                                    headers: { Authorization: `Bearer ${token}` }
                                }).catch(() => {});
                            }
                            // ล้าง Token ออกจากเครื่อง
                            await AsyncStorage.removeItem('userToken');
                            await AsyncStorage.removeItem('userData');
                            router.replace('/LoginScreen');
                        } catch (e) {
                            await AsyncStorage.clear();
                            router.replace('/LoginScreen');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleNavPress = (tab: 'home' | 'chart' | 'add' | 'notifications' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'home') router.push('/farmer/homeFarmer');
        else if (tab === 'chart') router.push('/farmer/dashboard'); 
        else if (tab === 'add') router.push('/farmer/createPost'); 
        else if (tab === 'notifications') router.push('/farmer/notification'); 
    };

    // 1. เช็ค Loading ก่อน
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0056b3" />
                    <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 2. เช็คว่ามีข้อมูลหรือไม่ (ป้องกันจอขาว)
    if (!farmerData) {
        return null; 
    }

    // 3. คำนวณค่าต่างๆ หลังจากมั่นใจว่ามีข้อมูลแล้ว
    const initials = getInitials(farmerData.fullname);
    const firstName = farmerData.fullname ? farmerData.fullname.split(' ')[0] : '-';
    const lastName = farmerData.fullname && farmerData.fullname.split(' ').length > 1 ? farmerData.fullname.split(' ')[1] : '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.contentWrapper}>
                <ScrollView style={styles.container}>
                    
                    <View style={styles.headerBackground}>
                        <Text style={styles.headerTitle}>โปรไฟล์</Text>
                    </View>

                    <View style={styles.contentCard}>
                        <View style={styles.initialCircle}>
                            <Text style={styles.initialText}>{initials}</Text>
                        </View>

                        <Text style={styles.fullName}>{farmerData.fullname}</Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.buttonOutline} onPress={handleEditProfile}>
                                <Text style={styles.buttonOutlineText}>แก้ไขโปรไฟล์</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonSolid} onPress={handleHistorySale}>
                                <Text style={styles.buttonSolidText}>ประวัติการโพสต์ขาย</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxTitle}>ข้อมูลส่วนตัว</Text>
                            <InfoField label="First Name" value={firstName} />
                            <InfoField label="Last Name" value={lastName} />
                            <InfoField label="Email Address" value={farmerData.email || '-'} />
                            <InfoField label="Phone" value={farmerData.phone || '-'} /> 
                            <InfoField label="Address" value={farmerData.address || '-'} />
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                
                <FarmerNavbar
                    activeTab={activeTab}
                    onHomePress={() => handleNavPress('home')}
                    onChartPress={() => handleNavPress('chart')}
                    onAddPress={() => handleNavPress('add')}
                    onNotificationsPress={() => handleNavPress('notifications')}
                    onProfilePress={() => handleNavPress('profile')}
                />
            </View>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  contentWrapper: {
      flex: 1,
  },
  container: {
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  headerBackground: {
    backgroundColor: '#0056b3',
    height: 240,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 60,
  },
  contentCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40, 
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
    marginBottom: 24, 
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
    marginTop: 20, 
    marginBottom: 40, 
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FarmerProfileScreen;