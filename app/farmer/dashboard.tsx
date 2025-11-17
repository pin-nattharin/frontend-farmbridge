import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import { useRouter } from 'expo-router'; // <-- 1. Import useRouter
import FarmerNavbar from '../../components/ui/FarmerNavbar';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  getFarmerDashboard,
  getDashboardStats,
  DashboardStatsResponse
} from '../../services/dashboardService';

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

const DashboardScreen = () => {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalStats, setGlobalStats] = useState<DashboardStatsResponse | null>(null);

  // 1. State เก็บข้อมูล Metrics (ตัวเลขรายได้, ขายล่าสุด)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    increasePercent: 0,
    latestSale: null as any,
  });
  
  // 2. State เก็บข้อมูลกราฟ (แปลงมาจาก API)
  const [chartDataMap, setChartDataMap] = useState<any>({}); 
  const [selectedChart, setSelectedChart] = useState('มะม่วง'); // Default
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // รายการตัวเลือก (ตามรูป)
  const chartOptions = ['มะม่วง', 'ทุเรียน', 'มังคุด', 'องุ่น'];

  const fetchDashboardData = useCallback(
    async ({ showScreenLoader = false }: { showScreenLoader?: boolean } = {}) => {
      if (!token) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      setError(null);
      if (showScreenLoader) {
        setIsLoading(true);
      }

      try {
        const [farmerDashboard, statsData] = await Promise.all([
          getFarmerDashboard(),
          getDashboardStats()
        ]);
        const { metrics, priceTrends } = farmerDashboard;

        // 1. อัปเดต Metrics
        setMetrics({
          totalRevenue: metrics.totalRevenue || 0,
          increasePercent: metrics.increasePercent || 0,
          latestSale: metrics.latestSale,
        });

        // 2. แปลงข้อมูลกราฟ (จาก { date, price } -> { labels, datasets })
        const formattedCharts: any = {};
        
        // ข้อมูลสำรองเผื่อกราฟว่าง
        const defaultChart = {
          labels: ['-'],
          datasets: [{ data: [0] }]
        };

        Object.keys(priceTrends || {}).forEach(product => {
          const trends = (priceTrends[product] || []) as Array<{ date: string; price: number }>;
          
          if (trends && trends.length > 0) {
            formattedCharts[product] = {
              // แปลงวันที่เป็นชื่อเดือน เช่น "ม.ค.", "ก.พ."
              labels: trends.map((t: any) => {
                const d = new Date(t.date);
                return d.toLocaleDateString('th-TH', { month: 'short' });
              }),
              datasets: [{ data: trends.map((t: any) => t.price) }]
            };
          } else {
            formattedCharts[product] = defaultChart;
          }
        });

        setChartDataMap(formattedCharts);
        setGlobalStats(statsData);

      } catch (error) {
        console.error('Fetch Dashboard Error:', error);
        setError('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        if (showScreenLoader) {
          setIsLoading(false);
        }
        setRefreshing(false);
      }
    },
    [token]
  );

  // เรียกใช้ตอนเปิดหน้าจอ
  useEffect(() => {
    if (authLoading) return;
    fetchDashboardData({ showScreenLoader: true });
  }, [authLoading, fetchDashboardData]);

  // ฟังก์ชัน Pull-to-Refresh
  const onRefresh = () => {
    if (!token) return;
    setRefreshing(true);
    fetchDashboardData();
  };

  // เลือกกราฟที่จะแสดง (ถ้าไม่มีข้อมูลให้ใช้ Default)
  const currentChartData = chartDataMap[selectedChart] || {
    labels: ['No Data'],
    datasets: [{ data: [0] }]
  };

  // ฟังก์ชันเมื่อเลือกไอเท็ม
  const handleSelectOption = (option: string) => {
    setSelectedChart(option); // 1. อัปเดตค่าที่เลือก
    setDropdownVisible(false); // 2. ปิดเมนู
  };

  const handleBack = () => {
        router.back();
    };

  // --- 2. เพิ่มฟังก์ชันสำหรับ Navbar ---
  const handleNavHome = () => {
    router.push('/farmer/homeFarmer'); // (แก้ Path ให้ถูก)
  };
  const handleNavChart = () => {
  };
  const handleNavAdd = () => {
    router.push('/farmer/createPost'); // (แก้ Path ให้ถูก)
  };
  const handleNavNotifications = () => {
    router.push('/farmer/notification'); // (แก้ Path ให้ถูก)
  };
  const handleNavProfile = () => {
    router.push('/farmer/farmerProfile'); // (แก้ Path ให้ถูก)
  };

  if (authLoading || (isLoading && !refreshing)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#0056b3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* 🆕 ADD: ปุ่มย้อนกลับ (จัดวางให้ลอยอยู่เหนือเนื้อหา) */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#0056b3" />
                        </TouchableOpacity>

      <ScrollView style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* --- Header --- */}
        <View style={styles.header}>
          <Text style={styles.title}>แดชบอร์ด</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
{/* 
        {globalStats && (
          <View style={styles.globalStatsCard}>
            <Text style={styles.globalStatsTitle}>ภาพรวมระบบ</Text>
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>ยอดขายรวม</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.metrics.total_sales_value.toLocaleString()} บาท
              </Text>
            </View>
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>รายการขายสำเร็จ</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.metrics.total_transactions.toLocaleString()} รายการ
              </Text>
            </View>
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>ราคาเฉลี่ย</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.metrics.average_price.toLocaleString()} บาท/กก.
              </Text>
            </View>
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>ของเสียลดลง</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.metrics.waste_reduced_kg.toLocaleString()} กก.
              </Text>
            </View>
            <View style={styles.globalStatDivider} />
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>สินค้าพร้อมขาย</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.totals.activeListings.toLocaleString()} รายการ
              </Text>
            </View>
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>เกษตรกรในระบบ</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.totals.totalFarmers.toLocaleString()} ราย
              </Text>
            </View>
            <View style={styles.globalStatRow}>
              <Text style={styles.globalStatLabel}>ผู้ซื้อในระบบ</Text>
              <Text style={styles.globalStatValue}>
                {globalStats.totals.totalBuyers.toLocaleString()} ราย
              </Text>
            </View>
          </View>
        )} */}

        {/* --- Metrics Cards --- */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>รายได้ทั้งหมด</Text>
            <Text style={styles.metricValueBlue}>
              {metrics.totalRevenue.toLocaleString()} บาท
            </Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardGreenBg]}>
            <Text style={styles.metricLabel}>แสดงเป็นร้อยละ</Text>
            <Text style={styles.metricValueGreen}>+{metrics.increasePercent}%</Text>
          </View>
        </View>

         {/* --- Recent Sale Card --- */}
        <View style={styles.recentSaleCard}>
          <View style={styles.recentSaleHeader}>
            <Text style={styles.recentSaleLabel}>ขายอะไรไปแล้วบ้าง</Text>
            <Text style={styles.recentSaleAmount}>
              {metrics.latestSale ? `จำนวน ${metrics.latestSale.quantity} กก.` : '-'}
            </Text>
          </View>
          <Text style={styles.recentSaleItem}>
            {metrics.latestSale 
              ? `${metrics.latestSale.product_name} (เกรด ${metrics.latestSale.grade || '-'})`
              : 'ยังไม่มีรายการขายสำเร็จ'}
          </Text>
        </View>

        {/* --- Chart Section --- */}
        <View style={styles.chartSection}>
          {/* --- Dropdown (คงเดิม) --- */}
          <View style={styles.chartDropdownWrapper}>
            <TouchableOpacity
              style={styles.chartDropdownButton}
              onPress={() => setDropdownVisible(!isDropdownVisible)}
            >
              <Text style={styles.chartDropdownText}>ราคาตลาด: {selectedChart} ▾</Text>
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
            {currentChartData.datasets[0].data.length > 0 && currentChartData.labels.length > 0 ? (
               <LineChart
               data={currentChartData}
               width={width - 32} // เต็มจอ ลบ padding
               height={220}
               chartConfig={chartConfig}
               bezier
               style={styles.chart}
               // ป้องกัน error ถ้า data เป็น NaN
               fromZero
             />
            ) : (
              <View style={{height: 220, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#999'}}>ไม่มีข้อมูลราคาตลาด</Text>
              </View>
            )}
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
  backButton: {
        position: 'absolute', // ทำให้ปุ่มลอย
        top: 50, // ปรับตำแหน่งให้เหมาะสมกับ SafeAreaView
        left: 15,
        zIndex: 10, // ให้อยู่ด้านบนสุด
        padding: 5,
    },
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingLeft: 130,
  },
  title: {
    fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
        marginHorizontal: 16,
        marginTop: 60,
        marginBottom: 20,
        textAlign: 'center', 
        paddingLeft: 120,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  globalStatsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  globalStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 12,
  },
  globalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  globalStatLabel: {
    fontSize: 14,
    color: '#555',
  },
  globalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003d80',
  },
  globalStatDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 10,
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
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f5c2c7',
  },
  errorText: {
    color: '#a12622',
    fontSize: 14,
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
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  // (ลบ chartPlaceholderText)
});

export default DashboardScreen;