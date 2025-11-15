// hooks/useNotificationListener.ts

import { useEffect } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Hook สำหรับจัดการ Listener ของ Firebase Cloud Messaging
 */
export const useNotificationListener = () => {
    const router = useRouter();

    interface NotificationDataPayload {
    listing_id: string;
    distance_km: string; 
    market_price: string;
    seller_price: string;
    navigation_id: string;
}

    /**
     * ฟังก์ชันหลักในการประมวลผลข้อมูลแจ้งเตือนและนำทาง
     */
    const handleNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        const data = remoteMessage.data as unknown as NotificationDataPayload;
        const listingId = data?.listing_id;
        const navigationId = data?.navigation_id; 

        // ตรวจสอบเงื่อนไขการนำทางตามที่ Backend ส่งมา
        if (listingId && navigationId === 'product_detail') {
            console.log(`[FCM Click] Navigating to product detail: ${listingId}`);
            
            // นำทางไปยังหน้าสินค้า พร้อมส่งข้อมูลสำคัญที่ใช้ในการจัดเรียง/เปรียบเทียบราคา
            router.push({
                pathname: `../app/productDetail`, // ⚠️ ตรวจสอบ Path ของคุณให้ถูกต้อง
                params: { 
                    id: listingId,
                    distance: data.distance_km,
                    marketPrice: data?.market_price,
                    sellerPrice: data?.seller_price,
                },
            });
        }
    };

    useEffect(() => {
        // 1. จัดการเมื่อแอปฯ ปิดอยู่ (Quit) หรือ Background
        messaging().getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    handleNotification(remoteMessage);
                }
            });

        // 2. จัดการเมื่อแอปฯ อยู่ใน Background/Locked (เมื่อผู้ใช้คลิก)
        const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
            handleNotification(remoteMessage);
        });

        // 3. จัดการเมื่อแอปฯ อยู่ใน Foreground (เปิดใช้งาน)
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
            console.log('Received notification in foreground:', remoteMessage.notification);
            
            // แสดง Popup ถามผู้ใช้ว่าจะดูทันทีหรือไม่
            Alert.alert(
                remoteMessage.notification?.title || 'แจ้งเตือนใหม่',
                remoteMessage.notification?.body || 'มีรายการจับคู่ใหม่ใกล้คุณ',
                [
                    { text: 'ปิด', style: 'cancel' },
                    { text: 'ดูเลย', onPress: () => handleNotification(remoteMessage) },
                ]
            );
        });

        // Cleanup function: ล้าง Listener เมื่อ Component ถูกทำลาย
        return () => {
            unsubscribeOpened();
            unsubscribeForeground();
        };
    }, [router]);
};