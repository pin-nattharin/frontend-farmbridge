import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { useRouter } from 'expo-router'; // <-- 1. Import useRouter
import FarmerNavbar from '../../components/ui/FarmerNavbar';

const DashboardScreen = () => {
  const router = useRouter();

  // --- 1. State สำหรับ Dropdown ---
  const [selectedChart, setSelectedChart] = useState('มะม่วง'); // ค่าเริ่มต้น
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // รายการตัวเลือก (ตามรูป)
  const chartOptions = ['มะม่วง', 'ทุเรียน', 'มังคุด', 'องุ่น'];

  // ฟังก์ชันเมื่อเลือกไอเท็ม
  const handleSelectOption = (option: string) => {
    setSelectedChart(option); // 1. อัปเดตค่าที่เลือก
    setDropdownVisible(false); // 2. ปิดเมนู
  };

  // --- 2. เพิ่มฟังก์ชันสำหรับ Navbar ---
  const handleNavHome = () => {
    // ไม่ต้องทำอะไร เพราะอยู่ที่นี่แล้ว
  };
  const handleNavChart = () => {
  };
  const handleNavAdd = () => {
    router.push('/farmer/createPost'); // (แก้ Path ให้ถูก)
  };
  const handleNavNotifications = () => {
    //router.push('/notifications'); // (แก้ Path ให้ถูก)
  };
  const handleNavProfile = () => {
    router.push('/farmer/farmerProfile'); // (แก้ Path ให้ถูก)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.header}>
          {/* ผมเอารูป "<" ออกตามโค้ดล่าสุดที่คุณส่งมา */}
          <Text style={styles.title}>แดชบอร์ด</Text>
        </View>

        {/* --- Metrics Cards --- */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>รายได้ทั้งหมด</Text>
            <Text style={styles.metricValueBlue}>8,500 บาท</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardGreenBg]}>
            <Text style={styles.metricLabel}>แสดงเป็นร้อยละ</Text>
            <Text style={styles.metricValueGreen}>85%</Text>
          </View>
        </View>

        {/* --- Recent Sale Card --- */}
        <View style={styles.recentSaleCard}>
          <View style={styles.recentSaleHeader}>
            <Text style={styles.recentSaleLabel}>ขายอะไรไปแล้วบ้าง</Text>
            <Text style={styles.recentSaleAmount}>จำนวน 30 กก.</Text>
          </View>
          <Text style={styles.recentSaleItem}>มะม่วง (เกรด C)</Text>
        </View>

        {/* --- Chart Section --- */}
        <View style={styles.chartSection}>
          {/* --- 2. โค้ด Dropdown ที่สร้างเอง --- */}
          <View style={styles.chartDropdownWrapper}>
            {/* ปุ่ม Dropdown หลัก */}
            <TouchableOpacity
              style={styles.chartDropdownButton}
              onPress={() => setDropdownVisible(!isDropdownVisible)}
            >
              <Text style={styles.chartDropdownText}>
                {/* หมายเหตุ: ในรูป Mockup ของคุณ ปุ่มแสดง "กราฟราคา" 
                  แต่ Options เป็นชื่อผลไม้
                  ผมขอใช้ค่าที่เลือก (selectedChart) มาแสดงผลแทน 
                  ซึ่งตรงกับโค้ดที่คุณส่งมาครั้งก่อนครับ
                */}
                {selectedChart} ▾
              </Text>
            </TouchableOpacity>

            {/* เมนู Dropdown ที่จะแสดง/ซ่อน */}
            {isDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {chartOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    // 3. เพิ่ม Style เมื่อถูกเลือก (เหมือนในรูป)
                    style={[
                      styles.dropdownItem,
                      option === selectedChart && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleSelectOption(option)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        option === selectedChart &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* กราฟ */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              [ พื้นที่สำหรับกราฟ {selectedChart} ]
            </Text>
          </View>
        </View>
      </ScrollView>
      {/* --- 3. เพิ่ม Navbar ที่นี่ --- */}
      {/* (อยู่นอก ScrollView แต่ใน SafeAreaView) */}
      <FarmerNavbar
        activeTab="chart" // (บอก Navbar ว่าปุ่ม Home active อยู่)
        onHomePress={handleNavHome}
        onChartPress={handleNavChart}
        onAddPress={handleNavAdd}
        onNotificationsPress={handleNavNotifications}
        onProfilePress={handleNavProfile}
      />
    </SafeAreaView>
  );
};

// --- 4. Stylesheet (รวมสไตล์ของ Dropdown) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricCardGreenBg: {
    backgroundColor: '#e6f7eb',
  },
  metricLabel: {
    fontSize: 16,
    color: '#555',
  },
  metricValueBlue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0056b3',
    marginTop: 8,
  },
  metricValueGreen: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  recentSaleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recentSaleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentSaleAmount: {
    fontSize: 16,
    color: '#333',
  },
  recentSaleItem: {
    fontSize: 16,
    color: '#555',
  },
  chartSection: {
    padding: 16,
    marginTop: 12,
  },
  // --- สไตล์สำหรับ Dropdown ที่สร้างเอง ---
  chartDropdownWrapper: {
    position: 'relative', // ทำให้เมนู absolute อ้างอิงจากตัวนี้
    alignSelf: 'flex-start',
    zIndex: 10, // ทำให้เมนูลอยทับกราฟ
  },
  chartDropdownButton: {
    backgroundColor: '#e9ecef', // สีเทาอ่อนของปุ่ม (ตามโค้ดเดิม)
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chartDropdownText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%', // ให้เมนูลอยอยู่ใต้ปุ่ม
    left: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: 120, // ความกว้างของเมนู (ปรับได้)
    // Shadow (เหมือนในรูป)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  // Style สำหรับไอเท็มที่ถูกเลือก (สีน้ำเงิน)
  dropdownItemSelected: {
    backgroundColor: '#0056b3',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  // Style สำหรับ *ตัวอักษร* ที่ถูกเลือก (สีขาว)
  dropdownItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // --- จบสไตล์ Dropdown ---
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholderText: {
    color: '#aaa',
    fontSize: 16,
  },
});

export default DashboardScreen;