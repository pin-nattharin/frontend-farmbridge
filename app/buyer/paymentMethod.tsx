import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import api from '../../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_OPTIONS = [
    { 
        id: 'bank_transfer', 
        name: 'ตัดผ่านบัญชีธนาคาร', 
        icon: 'bank',
        description: 'ชำระเงินด้วยการโอนเงินผ่านบัญชีธนาคาร',
        disabled: false, 
    },
];

type PaymentMethodId = 'bank_transfer'; 

// Loading Overlay
interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = 'กำลังดำเนินการ...' }) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isVisible}
            onRequestClose={() => {}} 
        >
            <View style={overlayStyles.overlay}>
                <View style={overlayStyles.contentBox}>
                    <ActivityIndicator size="large" color="#074E9F" />
                    <Text style={overlayStyles.messageText}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const overlayStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    contentBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 25,
        minWidth: 180,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    messageText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});


// Payment Option Component
interface PaymentOptionProps {
    option: typeof PAYMENT_OPTIONS[0]; 
    isSelected: boolean;
    onSelect: (id: PaymentMethodId) => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({ option, isSelected, onSelect }) => {
    return (
        <TouchableOpacity
            style={[styles.optionContainer, option.disabled && styles.optionDisabled]} 
            onPress={() => !option.disabled && onSelect(option.id as PaymentMethodId)}
            activeOpacity={0.7}
            disabled={option.disabled}
        >
            <View style={styles.radioContainer}>
                <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioDot} />}
                </View>
                <MaterialCommunityIcons 
                    name={option.icon as any} 
                    size={28} 
                    color={option.disabled ? '#CCC' : '#333'} 
                    style={styles.optionIcon} 
                />
                <View style={styles.optionTextWrapper}>
                    <Text style={[styles.optionName, option.disabled && { color: '#AAA' }]}>
                        {option.name}
                    </Text>
                    <Text style={styles.optionDescription}>
                        {option.description}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Main Screen
export default function PaymentMethodScreen() {
    const router = useRouter();
    const { listing_id, quantity, total_amount, pickup_date } = useLocalSearchParams();

    const totalPrice = parseFloat(total_amount as string) || 0;
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('bank_transfer'); 
    const [isLoading, setIsLoading] = useState(false); 

    const handleConfirmPayment = async () => {
        if (isLoading) return;
        setIsLoading(true); 
        
        try {
            // 1. แปลงข้อมูลให้เป็น Number ชัวร์ๆ (ป้องกันการส่ง String ไป)
            const numListingId = Number(listing_id);
            const numQuantity = Number(quantity);

            if (!numListingId || isNaN(numListingId) || !numQuantity || isNaN(numQuantity)) {
                throw new Error("ข้อมูลสินค้าไม่ถูกต้อง (Listing ID หรือ จำนวน)");
            }

            // 2. หน่วงเวลาเล็กน้อย (UX)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error("กรุณาเข้าสู่ระบบใหม่");

            // 3. เตรียม Payload
            const payload = {
                listing_id: numListingId,
                quantity: numQuantity,
                pickup_slot: pickup_date // ส่งเป็น string
            };
            
            console.log("🚀 Sending Payload:", payload);

            // 4. ยิง API
            const response = await api.post('/orders', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const order = response.data.order; 

            // 5. ไปหน้าสำเร็จ
            router.replace({
                pathname: '/buyer/paymentSuccess',
                params: {
                    pickup_code: order.confirmation_code, 
                    pickup_date: pickup_date,
                    total_amount: total_amount
                }
            });

        } catch (error: any) {
            console.error("Order Failed:", error);
            const msg = error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการสั่งซื้อ";
            Alert.alert("ล้มเหลว", msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#0056b3" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>วิธีการชำระเงิน</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView}>
                <Text style={styles.sectionTitle}>เลือกช่องทางการชำระเงิน</Text>

                {PAYMENT_OPTIONS.map((option) => (
                    <PaymentOption
                        key={option.id}
                        option={option as any}
                        isSelected={selectedMethod === option.id}
                        onSelect={setSelectedMethod}
                    />
                ))}

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotalLabel}>ยอดที่ต้องชำระ:</Text>
                            <Text style={styles.summaryTotalValue}>{totalPrice.toLocaleString()} บาท</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.confirmButtonInBody, isLoading && { backgroundColor: '#AAA' }]} 
                        onPress={handleConfirmPayment}
                        disabled={isLoading} 
                    >
                        <Text style={styles.confirmButtonText}>
                            {isLoading ? 'กำลังดำเนินการ...' : `ยืนยันชำระเงิน (${totalPrice.toLocaleString()} บาท)`}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 20 }} /> 
            </ScrollView>
            
            <LoadingOverlay isVisible={isLoading} message="กำลังทำรายการ..." />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        paddingBottom: 20,
        paddingTop: 70,
    },
    scrollView: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 15,
    },
    optionContainer: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#074E9F', 
    },
    optionDisabled: { 
        opacity: 0.6,
        backgroundColor: '#FAFAFA',
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        marginHorizontal: 15,
    },
    optionTextWrapper: {
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    optionDescription: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
    },
    radioCircle: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#074E9F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#074E9F',
    },
    summaryContainer: {
        marginTop: 20,
        marginBottom: 20, 
    },
    summaryBox: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20, 
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
    },
    confirmButtonInBody: {
        backgroundColor: '#28a745',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});