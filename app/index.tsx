import React from 'react';
// 1. เพิ่ม StyleSheet เข้าไปใน import
import { View, Text, StyleSheet } from 'react-native'; 
import { Link } from 'expo-router';

// 2. ย้าย 'const styles' ทั้งหมดขึ้นมาไว้ "ก่อน"
//    ที่ฟังก์ชัน HomeScreen จะเรียกใช้
const styles = StyleSheet.create({
  container: {
    flex: 1, // (ผมเพิ่ม flex: 1 ให้เป็นตัวอย่าง)
    justifyContent: 'center',
    padding: 20,
  },
  testLink: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#eee',
    textAlign: 'center',
  },
});

// ✅ ถูก - ใช้ 'export default'
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* ... โค้ดเดิมของคุณ ... */}

      {/* --- เพิ่มส่วนนี้เข้าไป --- */}
      <Link href="/test-components" style={styles.testLink}>
        <Text>ไปหน้า Test Components</Text>
      </Link>
      <Link href="./farmer/createPost" style={styles.testLink}>
        <Text>ไปหน้า createPost</Text>
      </Link>
      <Link href="./farmer/historySale" style={styles.testLink}>
        <Text>ไปหน้า historySale</Text>
      </Link>
      <Link href="./farmer/dashboard" style={styles.testLink}>
        <Text>ไปหน้า dashboard</Text>
      </Link>
      <Link href="./farmer/farmerProfile" style={styles.testLink}>
        <Text>ไปหน้า farmerProfile</Text>
      </Link>
      <Link href="./farmer/homeFarmer" style={styles.testLink}>
        <Text>ไปหน้า homeFarmer</Text>
      </Link>
      <Link href="./farmer/pickupSuccess" style={styles.testLink}>
        <Text>ไปหน้า pickupSuccess</Text>
      </Link>
      <Link href="./farmer/verifyPickup" style={styles.testLink}>
        <Text>ไปหน้า verifyPickup</Text>
      </Link>
      <Link href="./farmer/notification" style={styles.testLink}>
        <Text>ไปหน้า notification</Text>
      </Link>

      <Link href="./buyer/createDemand" style={styles.testLink}>
        <Text>ไปหน้า createDemand</Text>
      </Link>
      <Link href="./buyer/historyDemand" style={styles.testLink}>
        <Text>ไปหน้า historyDemand</Text>
      </Link>
      <Link href="./buyer/homeBuyer" style={styles.testLink}>
        <Text>ไปหน้า homeBuyer</Text>
      </Link>
      <Link href="./buyer/notificationDemand" style={styles.testLink}>
        <Text>ไปหน้า notificationDemand</Text>
      </Link>
      <Link href="./buyer/payment" style={styles.testLink}>
        <Text>ไปหน้า payment</Text>
      </Link>
      <Link href="./buyer/paymentSuccess" style={styles.testLink}>
        <Text>ไปหน้า paymentSuccess</Text>
      </Link>
      <Link href="/editProfile" style={styles.testLink}>
        <Text>ไปหน้า editProfile</Text> 
      </Link>
    </View>
  );
}

// (ลบ const styles ของเดิมออกจากตรงนี้)