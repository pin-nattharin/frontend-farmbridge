import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

interface BottomNavbarProps {
  onHomePress: () => void;
  onAddPress: () => void;
  onProfilePress: () => void;
  activeTab: 'home' | 'add' | 'profile';
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({
  onHomePress,
  onAddPress,
  onProfilePress,
  activeTab,
}) => {
  // ฟังก์ชันช่วยในการกำหนดสีไอคอน
  const getIconColor = (tabName: 'home' | 'add' | 'profile') => {
    // ปุ่ม Add จะมีสีเขียวเมื่อ Active และสีเทาเมื่อ Inactive (ตามรูปแบบปุ่มทั่วไป)
    if (tabName === 'add') {
      return activeTab === 'add' ? '#38A169' : '#A0AEC0'; 
    }
    // Home/Profile
    return activeTab === tabName ? '#074E9F' : '#A0AEC0'; // สีฟ้าเข้มเมื่อ Active
  };
  
  // ฟังก์ชันใหม่สำหรับสีกรณี Add เป็นวงกลมใหญ่
  const getAddIconColor = () => activeTab === 'add' ? '#FFFFFF' : '#FFFFFF';

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

        {/* 2. Add/Plus Button (วงกลมใหญ่) */}
        <TouchableOpacity 
          style={styles.centerAddButton} 
          onPress={onAddPress}
          accessibilityLabel="Add New Item"
        >
          <Ionicons 
            name="add-sharp" 
            size={36} 
            color={getAddIconColor()} // ใช้งานสีขาว
          />
        </TouchableOpacity>

        {/* 3. Profile Button */}
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
    flex: 1, //  ให้ Home และ Profile มีความกว้างเท่ากัน
    alignItems: 'center',
    paddingVertical: 10,
  },
  //  Style ใหม่สำหรับปุ่ม Add ที่อยู่ตรงกลาง
  centerAddButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#38A169', // สีเขียวหลัก
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    //  ไม่ต้องใช้ position: 'absolute', top: -25, หรือ transform
    //  ใช้ margin: 0 แทน flex: 1 เพื่อให้ Home และ Profile โอบล้อม
    marginHorizontal: 15, // เพิ่ม margin เพื่อให้มีระยะห่างจากปุ่มข้างๆ
    
    // Shadow/Elevation effect (ยังคงไว้)
    ...Platform.select({
      ios: {
        shadowColor: '#38A169',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default BottomNavbar;