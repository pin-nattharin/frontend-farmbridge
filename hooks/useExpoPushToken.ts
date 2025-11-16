// hooks/useExpoPushToken.ts

import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_URL = 'http://192.168.1.5:3000/api/notifications/update-expo-token'; // 👈 Endpoint ใหม่

async function registerForPushNotificationsAsync(jwtToken: string) {
    let token;
    
    // 1. ตรวจสอบสิทธิ์ (Permissions)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
    }

    // 2. ดึง Expo Push Token
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token ที่ได้:", token);

    // 3. ส่ง Token ไป Backend
    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ expoPushToken: token }),
    });

    return token;
}

export const useExpoPushToken = (jwtToken: string | null) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

    useEffect(() => {
        if (jwtToken) {
            registerForPushNotificationsAsync(jwtToken).then(token => setExpoPushToken(token));
        }
    }, [jwtToken]);

    return expoPushToken;
};