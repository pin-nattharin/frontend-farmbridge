import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { useRouter } from 'expo-router';
import FarmerNavbar from '../../components/ui/FarmerNavbar';

// --- (จำลอง) ข้อมูลที่ดึงมาจาก API/Database ---
// โดยอ้างอิงจาก Schema 'farmers'
const farmerData = {
  id: 1,
  fullname: 'วริศรา อารมดี', // -> ใช้อันนี้
  email: 'ping@gmail.com', // -> ใช้อันนี้
  phone: '0825548796', // -> ใช้อันนี้
  is_active: true, // -> ใช้สำหรับ "ยืนยันตัวตนแล้ว"
  // ... (fields อื่นๆ)
};

/**
 * 1. ฟังก์ชันสร้างชื่อย่อ (Initials)
 * ตามโจทย์ "ให้ระบบมันตั้งให้เอง"
 */
const getInitials = (fullname: string): string => {
  if (!fullname) return '';
  const names = fullname.split(' ');
  const firstNameInitial = names[0] ? names[0][0] : '';
  const lastNameInitial = names[1] ? names[1][0] : '';
  // รวมชื่อย่อ เช่น "วริศรา อารมดี" -> "วอ"
  return `${firstNameInitial}${lastNameInitial}`;
};

/**
 * 2. Helper Component สำหรับแสดงข้อมูล (First Name, Last Name, ...)
 */
const InfoField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoFieldContainer}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// --- 3. หน้าจอโปรไฟล์หลัก ---
const FarmerProfileScreen = () => {

    const router = useRouter();

    const handleEditProfile = () => {
    // ไปยังหน้า "แก้ไขโปรไฟล์" (สมมติว่าไฟล์ชื่อ app/editProfile.tsx)
    router.push('/editProfile');
  };

  const handleHistorySale = () => {
    // ไปยังหน้า "ประวัติการโพสต์ขาย" (ตามที่คุณบอกคือ app/historySale.tsx)
    router.push('/farmer/historySale');
  };

  // --- 2. เพิ่มฟังก์ชันสำหรับ Navbar ---
  const handleNavHome = () => {
    router.push('/'); // (สมมติว่า Home คือ '/')
  };
  const handleNavAdd = () => {
    router.push('/farmer/createPost'); // (สมมติว่าปุ่ม Add ไปหน้านี้)
  };
  const handleNavProfile = () => {
    // ไม่ต้องทำอะไร เพราะอยู่ที่นี่แล้ว
  };
  const handleNavChart = () => {
    router.push('/farmer/dashboard'); // (สมมติว่า Path คือ /chart)
  };
  const handleNavNotifications = () => {
    //router.push('/notifications'); // (สมมติว่า Path คือ /notifications)
  };

  // สร้างชื่อย่อจาก fullname
  const initials = getInitials(farmerData.fullname);

  // แยกชื่อ-นามสกุล (UI ต้องการแยกกัน)
  const firstName = farmerData.fullname.split(' ')[0] || '';
  const lastName = farmerData.fullname.split(' ')[1] || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* --- 1. ส่วนหัวสีน้ำเงิน --- */}
        <View style={styles.headerBackground}>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
        </View>

        {/* --- 2. การ์ดสีขาวที่ลอยทับ --- */}
        <View style={styles.contentCard}>
          {/* --- 3. วงกลมชื่อย่อ (ที่ลอยทับกึ่งกลาง) --- */}
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>{initials}</Text>
          </View>

          {/* --- ชื่อและ Badge --- */}
          <Text style={styles.fullName}>{farmerData.fullname}</Text>
          {farmerData.is_active && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>ยืนยันตัวตนแล้ว</Text>
            </View>
          )}

          {/* --- ปุ่ม --- */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={handleEditProfile}
            >
              <Text style={styles.buttonOutlineText}>แก้ไขโปรไฟล์</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonSolid}
              onPress={handleHistorySale}
            >
              <Text style={styles.buttonSolidText}>ประวัติการโพสต์ขาย</Text>
            </TouchableOpacity>
          </View>

          {/* --- กล่องข้อมูลส่วนตัว --- */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>ข้อมูลส่วนตัว</Text>
            <InfoField label="First Name" value={firstName} />
            <InfoField label="Last Name" value={lastName} />
            <InfoField label="Email Address" value={farmerData.email} />
            <InfoField label="Phone" value={farmerData.phone} />
          </View>
        </View>
      </ScrollView>
      {/* --- 3. เพิ่ม Navbar ที่นี่ --- */}
      {/* (อยู่นอก ScrollView แต่ใน SafeAreaView) */}
      <FarmerNavbar
        activeTab="profile" // (บอก Navbar ว่าปุ่ม Profile active อยู่)
        onHomePress={handleNavHome}
        onChartPress={handleNavChart}
        onAddPress={handleNavAdd}
        onNotificationsPress={handleNavNotifications}
        onProfilePress={handleNavProfile}
      />
    </SafeAreaView>
  );
};

// --- 4. Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4', // สีพื้นหลังเทาอ่อน
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  // 1. ส่วนหัวสีน้ำเงิน
  headerBackground: {
    backgroundColor: '#0056b3', // สีน้ำเงินตาม UI
    height: 180, // ความสูงของพื้นหลังสีน้ำเงิน
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  // 2. การ์ดสีขาว
  contentCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // **สำคัญ**: ดึงการ์ดสีขาวขึ้นไปทับส่วนสีน้ำเงิน
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 80, // **สำคัญ**: เว้นที่ว่างสำหรับวงกลมโปรไฟล์
  },
  // 3. วงกลมชื่อย่อ
  initialCircle: {
    width: 120,
    height: 120,
    borderRadius: 60, // ครึ่งหนึ่งของ width/height
    backgroundColor: '#e0e0e0', // สีเทา placeholder
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // **สำคัญ**: ลอยทับ
    top: -60, // **สำคัญ**: ดึงขึ้นไปกึ่งกลาง (ครึ่งหนึ่งของ height)
    borderWidth: 4,
    borderColor: 'white',
  },
  initialText: {
    fontSize: 48, // ขนาดตัวอักษรชื่อย่อ
    fontWeight: 'bold',
    color: '#555',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10, // ระยะห่างจากวงกลม (ถูกเว้นโดย paddingTop ของ contentCard)
  },
  verifiedBadge: {
    backgroundColor: '#e6f7eb', // สีเขียวอ่อน
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 8,
  },
  verifiedText: {
    color: '#28a745', // สีเขียวเข้ม
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  buttonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0056b3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  buttonOutlineText: {
    color: '#0056b3',
    fontWeight: 'bold',
  },
  buttonSolid: {
    flex: 1,
    backgroundColor: '#28a745', // สีเขียว
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginTop: 24,
    padding: 16,
    marginBottom: 30, // เว้นระยะล่าง
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 12,
  },
  // สไตล์สำหรับ InfoField
  infoFieldContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888', // สีเทาจาง
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
});

export default FarmerProfileScreen;