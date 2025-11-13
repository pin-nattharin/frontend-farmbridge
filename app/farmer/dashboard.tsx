import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

import { useRouter } from 'expo-router'; // <-- 1. Import useRouter
import FarmerNavbar from '../../components/ui/FarmerNavbar';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 86, 179, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#0056b3',
  },
  paddingRight: 0,
  paddingLeft: 0,
};

const allChartData = {
  'มะม่วง': {
    labels: ['ม.ค.', 'มี.ค.', 'พ.ค.', 'ก.ค.', 'ก.ย.', 'พ.ย.'],
    datasets: [{ data: [25, 27, 30, 28, 26, 30] }],
  },
  'ทุเรียน': {
    labels: ['ม.ค.', 'มี.ค.', 'พ.ค.', 'ก.ค.', 'ก.ย.', 'พ.ย.'],
    datasets: [{ data: [90, 95, 110, 120, 100, 98] }],
  },
  'มังคุด': {
    labels: ['ม.ค.', 'มี.ค.', 'พ.ค.', 'ก.ค.', 'ก.ย.', 'พ.ย.'],
    datasets: [{ data: [40, 42, 45, 41, 38, 43] }],
  },
  'องุ่น': {
    labels: ['ม.ค.', 'มี.ค.', 'พ.ค.', 'ก.ค.', 'ก.ย.', 'พ.ย.'],
    datasets: [{ data: [100, 105, 95, 110, 115, 120] }],
  },
};

const DashboardScreen = () => {
  const router = useRouter();

  // --- 1. State สำหรับ Dropdown ---
  const [selectedChart, setSelectedChart] = useState('มะม่วง'); // ค่าเริ่มต้น
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const currentChartData =
    allChartData[selectedChart as keyof typeof allChartData] ||
    allChartData['มะม่วง'];

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
          <Text style={styles.title}>แดชบอร์ด</Text>
        </View>

        {/* --- Metrics Cards --- */}
        <View style={styles.metricsRow}>
          {/* (คงเดิม) */}
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
          {/* --- Dropdown (คงเดิม) --- */}
          <View style={styles.chartDropdownWrapper}>
            <TouchableOpacity
              style={styles.chartDropdownButton}
              onPress={() => setDropdownVisible(!isDropdownVisible)}
            >
              <Text style={styles.chartDropdownText}>{selectedChart} ▾</Text>
            </TouchableOpacity>

            {isDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {chartOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
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

          {/* --- 5. แทนที่ Placeholder ด้วย LineChart --- */}
          <View style={styles.chartContainer}>
            <LineChart
              data={currentChartData}
              width={width - 32} // (ลบ padding 16*2)
              height={220}
              chartConfig={chartConfig}
              bezier // ทำให้เส้นโค้ง
              style={styles.chart}
            />
          </View>
        </View>
      </ScrollView>

      {/* --- Navbar (คงเดิม) --- */}
      <FarmerNavbar
        activeTab="chart"
        onHomePress={handleNavHome}
        onChartPress={handleNavChart}
        onAddPress={handleNavAdd}
        onNotificationsPress={handleNavNotifications}
        onProfilePress={handleNavProfile}
      />
    </SafeAreaView>
  );
};

// --- 6. Stylesheet (แก้ไข chartPlaceholder) ---
const styles = StyleSheet.create({
  // (Styles อื่นๆ คงเดิม)
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
  // --- สไตล์สำหรับ Dropdown (คงเดิม) ---
  chartDropdownWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  chartDropdownButton: {
    backgroundColor: '#e9ecef',
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
    top: '110%',
    left: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: 120,
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
  dropdownItemSelected: {
    backgroundColor: '#0056b3',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // --- จบสไตล์ Dropdown ---

  // --- 7. แก้ไข Style กราฟ (คัดลอกจาก productDetail.tsx) ---
  chartContainer: {
    overflow: 'hidden', // <-- เพิ่ม/แก้ไข
    height: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 12,
    // ลบ justifyContent, alignItems ออก
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16, // <-- เพิ่ม
  },
  // (ลบ chartPlaceholderText)
});

export default DashboardScreen;