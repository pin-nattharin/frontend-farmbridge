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

import { useRouter } from 'expo-router'; 
import FarmerNavbar from '../../components/ui/FarmerNavbar';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getFarmerDashboard } from '../../services/dashboardService';
import api from '../../services/api';

const { width } = Dimensions.get('window');

// ✅ Config กราฟแบบเดียวกับ ProductDetail
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 86, 179, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#0056b3"
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

  // State สำหรับยอดขายและประวัติ
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    salesHistory: [] as any[],
  });
  
  // ✅ State สำหรับกราฟ
  const [graphData, setGraphData] = useState<any>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const [selectedChart, setSelectedChart] = useState('มะม่วง'); 
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const chartOptions = ['มะม่วง', 'ทุเรียน', 'มังคุด', 'องุ่น'];

  // 1. ฟังก์ชันดึงข้อมูล Dashboard (รายได้ + ประวัติการขาย)
  const fetchDashboardData = useCallback(
    async ({ showScreenLoader = false }: { showScreenLoader?: boolean } = {}) => {
      if (!token) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      setError(null);
      if (showScreenLoader) setIsLoading(true);

      try {
        const response = await getFarmerDashboard();
        const { metrics: backendMetrics } = response;
        
        setMetrics({
          totalRevenue: backendMetrics.totalRevenue || 0,
          salesHistory: (backendMetrics as any).salesHistory || [],
        });

      } catch (error) {
        console.error('Fetch Dashboard Error:', error);
        setError('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        if (showScreenLoader) setIsLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // 2. ฟังก์ชันดึงข้อมูลกราฟจาก **ราคาซื้อขายจริง (Real Market)**
  const fetchChartData = useCallback(async () => {
      if (!token) return;
      
      setIsChartLoading(true);
      try {
          // ✅ เปลี่ยนตรงนี้: ดึงจาก /prices/real-market แทน /listings
          const response = await api.get('/prices/real-market', {
             headers: { Authorization: `Bearer ${token}` }
          });

          const allHistory = response.data;

          // 1. กรองเฉพาะสินค้าที่เลือก (เช่น 'มะม่วง')
          const productHistory = allHistory.filter((item: any) => item.product_name === selectedChart);

          if (productHistory.length > 0) {
              // 2. เรียงตามวันที่ (เก่า -> ใหม่) เพื่อให้กราฟวิ่งจากซ้ายไปขวา
              const sortedList = productHistory.sort((a: any, b: any) => 
                  new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
              );
              
              // 3. ตัดมาแค่ 6 รายการล่าสุด
              const recentList = sortedList.slice(-6);

              const labels = recentList.map((item: any) => {
                  const d = new Date(item.record_date);
                  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
              });

              const prices = recentList.map((item: any) => parseFloat(item.average_price));

              // ถ้ามีข้อมูลจุดเดียว ให้เพิ่มจุดหลอกเพื่อให้กราฟลากเส้นได้สวยงาม
              if (prices.length === 1) {
                  labels.unshift('ก่อนหน้า');
                  prices.unshift(prices[0]);
              }

              setGraphData({
                  labels: labels,
                  datasets: [{ data: prices }]
              });
          } else {
              setGraphData(null);
          }
      } catch (err) {
          console.log('Chart Data Fetch Error:', err);
          setGraphData(null);
      } finally {
          setIsChartLoading(false);
      }
  }, [selectedChart, token]);

  // Effect 1: โหลด Dashboard ครั้งแรก
  useEffect(() => {
    if (authLoading) return;
    fetchDashboardData({ showScreenLoader: true });
  }, [authLoading, fetchDashboardData]);

  // Effect 2: โหลดกราฟเมื่อเปลี่ยนสินค้า (selectedChart) หรือ token มา
  useEffect(() => {
      if (authLoading) return;
      fetchChartData();
  }, [authLoading, selectedChart, fetchChartData]);

  const onRefresh = () => {
    if (!token) return;
    setRefreshing(true);
    fetchDashboardData();
    fetchChartData();
  };

  const handleSelectOption = (option: string) => {
    setSelectedChart(option); 
    setDropdownVisible(false); 
  };

  const handleBack = () => router.back();
  const handleNavHome = () => router.push('/farmer/homeFarmer');
  const handleNavChart = () => { };
  const handleNavAdd = () => router.push('/farmer/createPost');
  const handleNavNotifications = () => router.push('/farmer/notification');

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

      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0056b3" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>แดชบอร์ด</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* --- Metrics Cards --- */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { width: '100%' }]}>
            <Text style={styles.metricLabel}>รายได้ทั้งหมด</Text>
            <Text style={styles.metricValueGreen}>
              {metrics.totalRevenue.toLocaleString()} บาท
            </Text>
          </View>
        </View>

         {/* --- รายการขายทั้งหมด --- */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>รายการขายทั้งหมด</Text>
          
          {metrics.salesHistory && metrics.salesHistory.length > 0 ? (
              metrics.salesHistory.map((item, index) => (
                <View key={index} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.productName}>
                            {item.product_name} <Text style={styles.gradeText}>({item.grade})</Text>
                        </Text>
                        <Text style={styles.saleDate}>
                            {item.date ? new Date(item.date).toLocaleDateString('th-TH') : ''}
                        </Text>
                    </View>
                    
                    <View style={styles.historyDetails}>
                        <Text style={styles.detailText}>จำนวน: {item.quantity} กก.</Text>
                        <Text style={styles.priceText}>+{parseFloat(item.total_price || '0').toLocaleString()} บาท</Text>
                    </View>
                </View>
              ))
          ) : (
              <View style={styles.emptyHistory}>
                  <Text style={styles.emptyText}>ยังไม่มีรายการขาย</Text>
              </View>
          )}
        </View>

        {/* --- Chart Section --- */}
        <View style={styles.chartSection}>
          <View style={styles.chartDropdownWrapper}>
            <TouchableOpacity
              style={styles.chartDropdownButton}
              onPress={() => setDropdownVisible(!isDropdownVisible)}
            >
              {/* เปลี่ยนข้อความให้สื่อความหมายถูกต้อง */}
              <Text style={styles.chartDropdownText}>ราคาตลาด (ซื้อขายสำเร็จ): {selectedChart} ▾</Text>
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

          <View style={styles.chartContainer}>
            {isChartLoading ? (
                 <View style={{height: 220, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#0056b3" />
                 </View>
            ) : graphData ? (
               <LineChart
               data={graphData}
               width={width - 32} 
               height={220}
               chartConfig={chartConfig}
               bezier
               style={styles.chart}
               fromZero={true}
               withInnerLines={false}
             />
            ) : (
              <View style={{height: 220, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#999'}}>ไม่มีข้อมูลการซื้อขายสำเร็จของ {selectedChart}</Text>
              </View>
            )}
          </View>

        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      <FarmerNavbar
        activeTab="chart"
        onHomePress={handleNavHome}
        onChartPress={handleNavChart}
        onAddPress={handleNavAdd}
        onNotificationsPress={handleNavNotifications}
      />
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  backButton: {
        position: 'absolute',
        top: 50, 
        left: 15,
        zIndex: 10, 
        padding: 5,
    },
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
    justifyContent: 'center', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
    marginTop: 20, 
    textAlign: 'center', 
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  metricValueGreen: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745', 
  },
  
  // --- History List Styles ---
  historySection: {
      marginTop: 20,
      paddingHorizontal: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
  },
  historyCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
  },
  productName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#0056b3',
  },
  gradeText: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#666',
  },
  saleDate: {
      fontSize: 12,
      color: '#888',
  },
  historyDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  detailText: {
      fontSize: 14,
      color: '#555',
  },
  priceText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#28a745', 
  },
  emptyHistory: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
  },
  emptyText: {
      color: '#999',
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
  chartContainer: {
    overflow: 'hidden', 
    height: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16, 
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default DashboardScreen;