import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 

// ----------------------------------------------------
// DUMMY DATA และ Types
// ----------------------------------------------------
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

// ----------------------------------------------------
// 1. Component ย่อย: LoadingOverlay
// ----------------------------------------------------
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
                    <ActivityIndicator 
                        size="large" 
                        color="#074E9F" 
                    />
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


// ----------------------------------------------------
// 2. Component ย่อย: PaymentOption (Radio Button)
// ----------------------------------------------------
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
                {/* 🟢 Radio Button Circle */}
                <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioDot} />}
                </View>

                {/* Icon และรายละเอียด */}
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


// ----------------------------------------------------
// 3. หน้าจอหลัก PaymentMethodScreen
// ----------------------------------------------------

export default function PaymentMethodScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('bank_transfer'); 
    const [isLoading, setIsLoading] = useState(false); 

    const totalPrice = 450; 

    const handleConfirmPayment = () => {
        setIsLoading(true); 
        
        setTimeout(() => {
            setIsLoading(false); 
            router.push('/buyer/paymentSuccess');
        }, 3000); 
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
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

                {/* 🟢 Summary และ ปุ่ม (รวมอยู่ใน ScrollView) */}
                <View style={styles.summaryContainer}>
    
                    {/* 1. Summary Box */}
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotalLabel}>ยอดที่ต้องชำระ:</Text>
                            <Text style={styles.summaryTotalValue}>{totalPrice.toFixed(2)} บาท</Text>
                        </View>
                    </View>

                    {/* 2. ปุ่มยืนยันชำระเงิน (ขยับขึ้นมา) */}
                    <TouchableOpacity 
                        style={[styles.confirmButtonInBody, isLoading && { backgroundColor: '#AAA' }]} 
                        onPress={handleConfirmPayment}
                        disabled={isLoading} 
                    >
                        <Text style={styles.confirmButtonText}>
                            {isLoading ? 'กำลังดำเนินการ...' : `ยืนยันชำระเงิน (${totalPrice} บาท)`}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {/* Space at bottom */}
                <View style={{ height: 20 }} /> 
            </ScrollView>
            
            {/* 🟢 Loading Overlay */}
            <LoadingOverlay 
                isVisible={isLoading} 
                message="กำลังตรวจสอบรายการ..." 
            />
            
        </SafeAreaView>
    );
}

// ----------------------------------------------------
// 4. Stylesheet
// ----------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    // Header
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
    // Main Content
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
    // Payment Option Card
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
    // Radio Button Styles
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
    // Summary Container and Button Placement
    summaryContainer: {
        marginTop: 20,
        marginBottom: 20, 
    },
    summaryBox: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20, // 🟢 ระยะห่างระหว่าง Summary Box และปุ่ม
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
    // 🟢 ปุ่มยืนยันชำระเงินที่ถูกย้ายเข้า ScrollView
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
    // 🔴 ลบ Styles ที่ไม่จำเป็น
    bottomBar: { display: 'none' }, 
});