// hooks/useNotificationListener.ts (ใช้ Expo)

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Subscription } from 'expo-notifications';
import { Alert } from 'react-native';

export const useNotificationListener = () => {
    const router = useRouter();
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data;
        const listingId = data?.listing_id as string;

        if (listingId) {
            console.log(`[Expo Click] Navigating to product detail: ${listingId}`);
            // นำทางไปยังหน้าสินค้า พร้อมส่งข้อมูลสำคัญ
            router.push({
                pathname: `/productDetail`,
                params: {
                    id: listingId,
                    distance: data.distance_km as string,
                    marketPrice: data.market_price as string,
                    sellerPrice: data.seller_price as string,
                },
            });
        }
    };

    useEffect(() => {
        // 1. Listener สำหรับการโต้ตอบ (เมื่อผู้ใช้คลิก)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

        // 2. Listener สำหรับข้อความใหม่ที่เข้ามา (Foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            // โค้ดนี้จะทำงานเมื่อแอปฯ เปิดอยู่และได้รับแจ้งเตือน
            console.log("Notification received in foreground:", notification.request.content.title);
            // ไม่ต้องแสดง Alert อีก เพราะ Expo จะแสดง Banner Notification ให้โดยอัตโนมัติ
        });

        return () => {
            // 1. ตรวจสอบ responseListener ก่อนยกเลิก
            if (responseListener.current) {
                responseListener.current.remove(); // 👈 ใช้ .remove() บน Subscription Object โดยตรง
            }

            // 2. ตรวจสอบ notificationListener ก่อนยกเลิก
            if (notificationListener.current) {
                notificationListener.current.remove(); // 👈 ใช้ .remove() บน Subscription Object โดยตรง
            }
        };
    }, [router]);
};