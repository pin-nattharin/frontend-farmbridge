// hooks/useFcmToken.ts

import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// 🚨 แทนที่ด้วย URL ของ API ที่คุณสร้าง
const API_URL = 'YOUR_BACKEND_URL/api/notifications/update-fcm'; 

/**
 * ฟังก์ชันสำหรับเรียก API Backend เพื่อบันทึก Token
 */
const saveFCMTokenToDatabase = async (fcmToken: string, token: string) => {
    if (!token) {
        console.warn('Cannot save FCM Token: JWT Token is missing.');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // สำคัญ: ต้องแนบ JWT Token ใน Authorization Header เพื่อยืนยันตัวตน
            },
            body: JSON.stringify({ fcmToken }),
        });

        if (response.ok) {
            console.log('[FCM] Token successfully saved/updated on Backend.');
        } else {
            console.error('[FCM] Failed to save token:', response.status, await response.text());
        }
    } catch (error) {
        console.error('[FCM] API error:', error);
    }
};

/**
 * Hook สำหรับขอสิทธิ์, ดึง FCM Token, และส่งไปเก็บที่ Backend
 */
export const useFcmToken = (jwtToken: string | null) => {
    const [fcmToken, setFCMToken] = useState<string | null>(null);

    useEffect(() => {
        // 1. ตรวจสอบ JWT Token: หยุดทำงานหากผู้ใช้ยังไม่ได้ล็อกอิน
        if (!jwtToken) {
            console.log("JWT Token is missing. Skipping FCM token process.");
            return; 
        }

        async function getFcmToken() {
            try {
                // 2. ขอสิทธิ์การแจ้งเตือน
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    // 3. ดึง Token
                    const token = await messaging().getToken();

                    if (token) {
                        setFCMToken(token);
                        // 4. ส่ง Token ไป Backend
                        await saveFCMTokenToDatabase(token, jwtToken); 
                    }
                } else {
                    console.warn('User denied notifications permission.');
                }
            } catch (error) {
                console.error("Error getting FCM Token:", error);
            }
        }
        
        getFcmToken();

    }, [jwtToken]);

    return fcmToken;
};