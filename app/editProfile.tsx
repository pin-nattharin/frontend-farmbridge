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
//import { Ionicons } from '@expo-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RoundedInput from '../components/ui/RoundedInput';
import Button from '../components/ui/Button';
import { registerBaseStyles } from './farmer/RegisterSellerScreen'; 

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

        // (จำลอง API Call)
        setTimeout(async () => { // 🟢 3. ทำให้ setTimeout เป็น async
            setIsLoading(false);

            // 🟢 4. อัปเดตข้อมูลใน AsyncStorage
            try {
                const userString = await AsyncStorage.getItem('user');
                // ดึงข้อมูลเก่า (ที่มี id, email, role)
                const oldUser = userString ? JSON.parse(userString) : {}; 
                
                // สร้าง object ใหม่ทับข้อมูลเดิม
                const updatedUser = {
                    ...oldUser,
                    fullname: fullname,
                    phone: phone
                };

                // บันทึกทับของเดิม
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            } catch (e) {
                console.error("Failed to update user in AsyncStorage", e);
            }
            
            // 🟢 5. แจ้งเตือนหลังบันทึก AsyncStorage สำเร็จ
            Alert.alert(
                "บันทึกสำเร็จ", 
                "ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว",
                [{ text: "ตกลง", onPress: () => router.back() }] //
            );
        }, 1000); //
    };

    // (JSX ทั้งหมดเหมือนเดิม)
    return (
        <View style={styles.fullScreen}>
            <LinearGradient
                colors={['#074E9F', '#22AB67']} 
                style={styles.background}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 1, y: 1 }}
            />
            <SafeAreaView style={styles.safeAreaContent}>

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
        position: 'absolute',
        top: '15%', 
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
    },
    header: {
        fontSize: 32, 
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    card: {
        ...registerBaseStyles.card, 
        width: '100%',
        padding: 30, 
        paddingTop: 40,
        marginTop: '30%', 
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