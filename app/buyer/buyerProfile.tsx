//buyerProfile
import React, { useState } from 'react'; // 🆕 ต้องเพิ่ม useState เข้ามา
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';

import { useRouter } from 'expo-router';

// *** ตรวจสอบ Path การ Import ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ ***
import BuyerNavbar from '../../components/ui/BuyerNavbar';
// --- (จำลอง) ข้อมูลที่ดึงมาจาก API/Database ---
const farmerData = {
    id: 1,
    fullname: 'ณัฐรินทร์ อาณัติธนันท์กุล',
    email: 'pin@gmail.com',
    phone: '0925568246',
    is_active: true,
};

// กำหนด Type สำหรับ Active Tab (ต้องทำซ้ำ หรือนำเข้าจากที่อื่น)
type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

/**
 * 1. ฟังก์ชันสร้างชื่อย่อ (Initials)
 */
const getInitials = (fullname: string): string => {
    if (!fullname) return '';
    const names = fullname.split(' ');
    const firstNameInitial = names[0] ? names[0][0] : '';
    const lastNameInitial = names[1] ? names[1][0] : '';
    return `${firstNameInitial}${lastNameInitial}`;
};

/**
 * 2. Helper Component สำหรับแสดงข้อมูล
 */
const InfoField = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoFieldContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

// --- 3. หน้าจอโปรไฟล์หลัก ---
const FarmerProfileScreen = () => {

    const router = useRouter();
    // *** 🆕 State สำหรับ Navbar ***
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

    const handleEditProfile = () => {
        router.push('/editProfile');
    };

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบหรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                { 
                    text: "ออกจากระบบ", 
                    onPress: () => {
                        console.log("User logged out");
                        router.replace('../loginScreen'); 
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // *** 🆕 ฟังก์ชันสำหรับ Navbar Navigation ***
    const handleNavPress = (tab: ActiveTab) => {
        setActiveTab(tab);
        // กำหนดเส้นทางนำทางหลักที่นี่
        if (tab === 'home') {
            router.replace('/buyer/homeBuyer'); // ไปหน้าแรก
        } else if (tab === 'add') {
            router.push('/buyer/createDemand'); // ไปหน้าสร้างโพสต์
        } else if (tab === 'list') {
            router.replace('/buyer/historyDemand'); // ไปหน้าประวัติการขอซื้อ
        } else if (tab === 'notify') {
            router.replace('/buyer/notificationDemand'); // ไปหน้าการแจ้งเตือน
        } else if (tab === 'profile') {
            //router.replace('./buyerProfile'); // อยู่หน้าเดิม (แต่ทำ replace เพื่อให้แน่ใจ)
        }
    };
    // ------------------------------------


    const initials = getInitials(farmerData.fullname);
    const firstName = farmerData.fullname.split(' ')[0] || '';
    const lastName = farmerData.fullname.split(' ')[1] || '';

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 🆕 ห่อหุ้ม ScrollView และ Navbar ด้วย View */}
            <View style={styles.contentWrapper}> 
                <ScrollView style={styles.container}>
                    {/* --- 1. ส่วนหัวสีน้ำเงิน --- */}
                    <View style={styles.headerBackground}>
                        <Text style={styles.headerTitle}>โปรไฟล์</Text>
                    </View>

                    {/* --- 2. การ์ดสีขาวที่ลอยทับ --- */}
                    <View style={styles.contentCard}>
                        {/* --- 3. วงกลมชื่อย่อ (ที่ลอยทับกึ่งกลาง) --- */}
                        <View style={styles.initialCircle}>
                            <Text style={styles.initialText}>{initials}</Text>
                        </View>

                        {/* --- ชื่อและ Badge --- */}
                        <Text style={styles.fullName}>{farmerData.fullname}</Text>

                        {/* --- ปุ่ม --- */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.buttonOutline}
                                onPress={handleEditProfile}
                            >
                                <Text style={styles.buttonOutlineText}>แก้ไขโปรไฟล์</Text>
                            </TouchableOpacity>
                        </View>

                        {/* --- กล่องข้อมูลส่วนตัว --- */}
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxTitle}>ข้อมูลส่วนตัว</Text>
                            <InfoField label="First Name" value={firstName} />
                            <InfoField label="Last Name" value={lastName} />
                            <InfoField label="Email Address" value={farmerData.email} />
                            <InfoField label="Phone" value={farmerData.phone} />
                        </View>
                        
                        {/* ปุ่ม Logout */}
                        <TouchableOpacity 
                            style={styles.logoutButton} 
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
                
                {/* *** 🆕 Bottom Navbar Component (อยู่ด้านล่างสุด) *** */}
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
};

// --- 4. Stylesheet ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    // 🆕 ต้องเพิ่ม contentWrapper เพื่อให้ Navbar ติดอยู่ด้านล่าง
    contentWrapper: {
        flex: 1, 
    },
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    // ... (Styles อื่น ๆ ยังคงเดิม)

    // 1. ส่วนหัวสีน้ำเงิน
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
    // 2. การ์ดสีขาว
    contentCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingTop: 80,
    },
    // 3. วงกลมชื่อย่อ
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

export default FarmerProfileScreen;