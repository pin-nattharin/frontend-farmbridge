import React, { useState, useEffect, useCallback } from 'react'; // 🟢 1. Import useEffect
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';
import FarmerNavbar from '../../components/ui/FarmerNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- (ลบ const farmerData ... ที่เป็นข้อมูลจำลองทิ้งไป) --- 

// --- (ฟังก์ชัน getInitials เหมือนเดิม) ---
const getInitials = (fullname: string): string => {
  if (!fullname) return '';
  const names = fullname.split(' ');
  const firstNameInitial = names[0] ? names[0][0] : '';
  const lastNameInitial = names[1] ? names[1][0] : '';
  return `${firstNameInitial}${lastNameInitial}`;
};

// --- (Helper Component: InfoField เหมือนเดิม) ---
const InfoField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoFieldContainer}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// --- 3. หน้าจอโปรไฟล์หลัก ---
const FarmerProfileScreen = () => {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'home' | 'chart' | 'add' | 'notifications' | 'profile'>('profile');
    
    // 🟢 2. สร้าง State มารับข้อมูลผู้ใช้ (เริ่มต้นเป็น null)
    const [farmerData, setFarmerData] = useState<any>(null);

    // 🟢 3. เปลี่ยนจาก useEffect เป็น useFocusEffect
    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const userData = JSON.parse(userString);
                    setFarmerData(userData);
                    console.log("Profile data loaded:", userData); // (ไว้ debug)
                } else {
                    Alert.alert("Error", "ไม่พบข้อมูลผู้ใช้, กรุณาเข้าสู่ระบบใหม่");
                    router.replace('/LoginScreen');
                }
            };
            loadUserData();
        }, []) // Dependency array ของ useCallback
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
                            await AsyncStorage.removeItem('token');
                            await AsyncStorage.removeItem('user');
                            console.log("User logged out, token cleared.");
                            router.replace('/LoginScreen');
                        } catch (e) {
                            console.error("Failed to clear async storage", e);
                            router.replace('/LoginScreen');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // 🟢 4. (ปรับปรุง) รวมฟังก์ชัน Navbar ให้กระชับขึ้น
    const handleNavPress = (tab: 'home' | 'chart' | 'add' | 'notifications' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'home') {
            router.replace('/farmer/homeFarmer');
        } else if (tab === 'chart') {
            router.push('/farmer/dashboard'); 
        } else if (tab === 'add') {
            router.push('/farmer/createPost'); 
        } else if (tab === 'notifications') {
            // router.push('/notifications'); 
        } else if (tab === 'profile') {
            // อยู่หน้าเดิม
        }
    };

    // 🟢 5. เพิ่ม Loading Screen
    if (!farmerData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>กำลังโหลดข้อมูล...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 🟢 6. (เหมือนเดิม) แต่ตอนนี้จะใช้ข้อมูลจริงจาก state
    const initials = getInitials(farmerData.fullname);
    const firstName = farmerData.fullname.split(' ')[0] || '';
    const lastName = farmerData.fullname.split(' ')[1] || '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.contentWrapper}>
                <ScrollView style={styles.container}>
                    {/* (ส่วน UI ทั้งหมดเหมือนเดิม แต่ตอนนี้จะแสดงข้อมูลจริง) */}
                    <View style={styles.headerBackground}>
                        <Text style={styles.headerTitle}>โปรไฟล์</Text>
                    </View>

                    <View style={styles.contentCard}>
                        <View style={styles.initialCircle}>
                            <Text style={styles.initialText}>{initials}</Text>
                        </View>

                        <Text style={styles.fullName}>{farmerData.fullname}</Text>
                        
                        {/* 🟢 7. API ของคุณไม่ได้ส่ง is_active มา แต่ถ้าส่งมา ก็ใช้ได้เลย */}
                        {/* {farmerData.is_active && ( ... )} */}
                        {/* หมายเหตุ: farmerData.is_active อาจไม่มีใน object ที่ได้จาก Login */}

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
                            <InfoField label="Email Address" value={farmerData.email} />
                            {/* 🟢 8. API login ยังไม่ส่ง phone มา ถ้าส่งมา ให้ลบคอมเมนต์ออก
                            <InfoField label="Phone" value={farmerData.phone} /> 
                            */}
                            {/* 🟢 แสดงเบอร์โทรที่อัปเดตแล้ว */}
                            <InfoField label="Phone" value={farmerData.phone} /> 
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                
                {/* 🟢 9. (ปรับปรุง) เรียกใช้ Navbar ที่รวมฟังก์ชันแล้ว */}
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

// --- (Styles ทั้งหมดเหมือนเดิม) ---
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
  headerBackground: {
    backgroundColor: '#0056b3',
    height: 180,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
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