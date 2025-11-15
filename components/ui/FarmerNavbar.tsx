import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // <-- ใช้ MaterialCommunityIcons เพราะมีไอคอนหลากหลายกว่า

interface FarmerNavbarProps {
  activeTab: 'home' | 'chart' | 'add' | 'notifications' | 'profile';
  onHomePress: () => void;
  onChartPress: () => void;
  onAddPress: () => void;
  onNotificationsPress: () => void;
  onProfilePress: () => void;
}

const NavbarFarmer: React.FC<FarmerNavbarProps> = ({
  activeTab,
  onHomePress,
  onChartPress,
  onAddPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  // ฟังก์ชันช่วยสำหรับกำหนดสีไอคอน
  const getIconColor = (tabName: string) => {
    return activeTab === tabName ? '#0056b3' : '#888'; // สีน้ำเงินสำหรับ Active, สีเทาสำหรับ Inactive
  };

  return (
    <View style={styles.navbarContainer}>
      {/* Home Button */}
      <TouchableOpacity style={styles.navButton} onPress={onHomePress}>
        <MaterialCommunityIcons
          name="home-variant-outline" // ไอคอน Home
          size={24}
          color={getIconColor('home')}
        />
        {/* <Text style={[styles.navText, { color: getIconColor('home') }]}>Home</Text> */}
      </TouchableOpacity>

      {/* Chart/Stats Button */}
      <TouchableOpacity style={styles.navButton} onPress={onChartPress}>
        <MaterialCommunityIcons
          name="chart-bar" // ไอคอนกราฟแท่ง
          size={24}
          color={getIconColor('chart')}
        />
        {/* <Text style={[styles.navText, { color: getIconColor('chart') }]}>Stats</Text> */}
      </TouchableOpacity>

      {/* Add/Plus Button (ปุ่มตรงกลางขนาดใหญ่) */}
      <TouchableOpacity style={styles.addNavButton} onPress={onAddPress}>
        <MaterialCommunityIcons
          name="plus" // ไอคอนเครื่องหมายบวก
          size={30} // ใหญ่ขึ้น
          color="white" // สีขาว
        />
      </TouchableOpacity>

      {/* Notifications Button */}
      <TouchableOpacity style={styles.navButton} onPress={onNotificationsPress}>
        <MaterialCommunityIcons
          name="bell-outline" // ไอคอนกระดิ่ง
          size={24}
          color={getIconColor('notifications')}
        />
        {/* <Text style={[styles.navText, { color: getIconColor('notifications') }]}>Alerts</Text> */}
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity style={styles.navButton} onPress={onProfilePress}>
        <MaterialCommunityIcons
          name="account-outline" // ไอคอนคน/โปรไฟล์
          size={24}
          color={getIconColor('profile')}
        />
        {/* <Text style={[styles.navText, { color: getIconColor('profile') }]}>Profile</Text> */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 60, // ความสูงของ Navbar
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // เงาด้านบน
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingHorizontal: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 10,
    marginTop: 2,
  },
  addNavButton: {
    backgroundColor: '#28a745', // สีเขียวสำหรับปุ่ม Add
    width: 55,
    height: 55,
    borderRadius: 27.5, // ทำให้เป็นวงกลม
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default NavbarFarmer;