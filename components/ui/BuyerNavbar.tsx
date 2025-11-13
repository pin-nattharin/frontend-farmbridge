//BuyerNavbar Component
import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// กำหนด Type สำหรับ Active Tab ใหม่ (รวม 5 ปุ่ม)
type ActiveTab = 'home' | 'list' | 'add' | 'notify' | 'profile';

interface BottomNavbarProps {
    onHomePress: () => void;
    onListPress: () => void;   // 🆕 สำหรับไอคอน Clipboard
    onAddPress: () => void;
    onNotifyPress: () => void; // 🆕 สำหรับไอคอน Bell
    onProfilePress: () => void;
    activeTab: ActiveTab;
}

const BuyerNavbar: React.FC<BottomNavbarProps> = ({
    onHomePress,
    onListPress,
    onAddPress,
    onNotifyPress,
    onProfilePress,
    activeTab,
}) => {

    // ฟังก์ชันช่วยในการกำหนดสีไอคอน (สีเทาอ่อน/สีหลัก)
    const getIconColor = (tabName: ActiveTab) => {
        // ปุ่ม Home/Profile/List/Notify ใช้สีน้ำเงินเข้มเมื่อ Active และสีเทาอ่อนเมื่อ Inactive
        const inactiveColor = '#A0AEC0'; // สีเทาอ่อน
        const activeColor = '#074E9F'; // สีน้ำเงินเข้ม (Home/List/Notify/Profile)

        // ปุ่ม Add เป็นสีเขียวอยู่แล้ว (กำหนดใน style)
        if (tabName === 'add') {
            return '#FFFFFF'; // ไอคอน Add เป็นสีขาวเสมอ
        }

        return activeTab === tabName ? activeColor : inactiveColor;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.navbarContainer}>

                {/* 1. Home Button */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={onHomePress}
                    accessibilityLabel="Home"
                >
                    <Ionicons
                        name={activeTab === 'home' ? "home" : "home-outline"}
                        size={28}
                        color={getIconColor('home')}
                    />
                </TouchableOpacity>

                {/* 2. List/Clipboard Button 🆕 */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={onListPress}
                    accessibilityLabel="List"
                >
                    <Ionicons
                        name={activeTab === 'list' ? "clipboard" : "clipboard-outline"}
                        size={28}
                        color={getIconColor('list')}
                    />
                </TouchableOpacity>

                {/* 3. Add/Plus Button (วงกลมใหญ่) */}
                <TouchableOpacity
                    style={styles.centerAddButton}
                    onPress={onAddPress}
                    accessibilityLabel="Add New Item"
                >
                    <Ionicons
                        name="add-sharp"
                        size={36}
                        color={getIconColor('add')} // ใช้สีขาว
                    />
                </TouchableOpacity>

                {/* 4. Notification/Bell Button 🆕 */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={onNotifyPress}
                    accessibilityLabel="Notification"
                >
                    <Ionicons
                        name={activeTab === 'notify' ? "notifications" : "notifications-outline"}
                        size={28}
                        color={getIconColor('notify')}
                    />
                </TouchableOpacity>

                {/* 5. Profile Button */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={onProfilePress}
                    accessibilityLabel="Profile"
                >
                    <Ionicons
                        name={activeTab === 'profile' ? "person" : "person-outline"}
                        size={28}
                        color={getIconColor('profile')}
                    />
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    navbarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // กระจายปุ่มให้เท่ากัน
        alignItems: 'center',
        height: 60,
        backgroundColor: '#FFFFFF',
    },
    navButton: {
        flex: 1, // ทำให้ปุ่ม Home, List, Notify, Profile มีความกว้างเท่ากัน
        alignItems: 'center',
        paddingVertical: 10,
    },
    // Style สำหรับปุ่ม Add ที่อยู่ตรงกลาง
    centerAddButton: {
        width: 55,
        height: 55,
        borderRadius: 30,
        backgroundColor: '#38A169', // สีเขียวหลักตามภาพ
        justifyContent: 'center',
        alignItems: 'center',
        // ใช้ marginTop/marginBottom เพื่อให้ปุ่มดู 'ลอย' เหนือ Navbar
        marginBottom: -5,

        // Shadow/Elevation effect
        ...Platform.select({
            ios: {
                shadowColor: '#38A169',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
            },
            android: {
                elevation: 8,
                top: -10, // ชดเชยให้ดูอยู่ตรงกลางมากขึ้น
            },
        }),
    },
});

export default BuyerNavbar;