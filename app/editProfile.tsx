import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // 🟢 1. ไม่จำเป็นต้องใช้ ScrollView ที่นี่
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RoundedInput from '../components/ui/RoundedInput';
import Button from '../components/ui/Button';
import { registerBaseStyles } from './farmer/RegisterSellerScreen';
import api from '../services/api'; 

const EditProfileScreen = () => {

    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                setUserId(user.id);
                const names = user.fullname ? user.fullname.split(' ') : ['', ''];
                setFirstName(names[0] || '');
                setLastName(names.slice(1).join(' ') || '');
                // 🟢 2. ดึงเบอร์โทรเก่ามาแสดงด้วย (ถ้ามี)
                setPhone(user.phone || ''); 
            }
        };
        loadUserData();
    }, []);

    const handleBack = () => {
        router.back();
    };

    const handleSave = async () => {
        if (isLoading) return;
        const fullname = `${firstName} ${lastName}`.trim();

        // (ตรวจสอบแค่ชื่อ ไม่ต้องบังคับเบอร์โทร)
        if (!fullname) { 
             Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อ-นามสกุล");
             return;
        }

        setIsLoading(true);
        console.log("Saving Data:", { userId, fullname, phone });

        try {
            // ยิง API (ตรงกับ auth.routes.js)
            const response = await api.put('/api/auth/profile', {
                fullname: fullname,
                phone: phone
                // (Back-end ของคุณยังรองรับ 'address' ด้วย ถ้ามีช่อง Input ก็เพิ่มได้เลย)
            });

            const updatedUser = response.data.user;
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            setIsLoading(false);
            Alert.alert(
                "บันทึกสำเร็จ", 
                "ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว",
                [{ text: "ตกลง", onPress: () => router.back() }]
            );
            } catch (err: any) {
            // 🟢 7. จัดการ Error
            setIsLoading(false);
            console.error("Update failed:", err.response?.data || err.message);
            Alert.alert(
                "บันทึกไม่สำเร็จ", 
                err.response?.data?.message || "เกิดข้อผิดพลาด"
            );
        }
    };

    // (JSX ทั้งหมดเหมือนเดิม)
    return (
        <View style={styles.fullScreen}>
            
            <SafeAreaView style={styles.safeAreaContent}>

                {/* 🟢 8. เพิ่มปุ่ม Back ที่หายไป */}
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#074E9F" />
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <Text style={styles.header}>แก้ไขโปรไฟล์</Text>
                </View>
                <View style={styles.card}>
                    <RoundedInput
                        label="ชื่อ"
                        placeholder="" 
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <RoundedInput
                        label="นามสกุล"
                        placeholder="" 
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    <RoundedInput
                        label="เบอร์โทรศัพท์"
                        placeholder="" 
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    <Button
                        title={isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                        onPress={handleSave}
                        disabled={isLoading}
                        style={styles.saveButton}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

// (Styles ทั้งหมดเหมือนเดิม)
const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    safeAreaContent: {
        flex: 1,
        justifyContent: 'center', 
        paddingHorizontal: 20,
    },
    headerContainer: {
        alignItems: 'center',
        alignSelf: 'center',
    },
    header: {
    ...registerBaseStyles.header,
    color: '#074E9F', 
    fontSize: 30, 
    marginBottom: 20,
  },
    card: {
        ...registerBaseStyles.card,
      marginBottom: 0, 
      alignSelf: 'center',
    },
    saveButton: {
        ...registerBaseStyles.registerButton, 
        backgroundColor: '#28a745', 
        borderColor: '#28a745', 
        paddingVertical: 12, 
        borderRadius: 10, 
        marginTop: 30,
    },
    backButton: { //
        position: 'absolute',
        top: 45, 
        left: 20,
        zIndex: 10,
        padding: 5,
    },
});

export default EditProfileScreen;