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
    paddingRight: 0,
    paddingLeft: 0,
  },
};

const DashboardScreen = () => {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    increasePercent: 0,
    salesHistory: [] as any[], // เก็บเป็น Array
  });
  
  const [chartDataMap, setChartDataMap] = useState<any>({}); 
  const [selectedChart, setSelectedChart] = useState('มะม่วง'); 
  const [isDropdownVisible, setDropdownVisible] = useState(false);

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
        const [dashboardRes, historyRes] = await Promise.all([
          getFarmerDashboard(), // สำหรับกราฟ
          api.get('/orders/history/sales') // สำหรับคำนวณยอดขาย
        ]);

        const response = await getFarmerDashboard();
        const { metrics: backendMetrics, priceTrends } = response;
        const allSales = historyRes.data;

        const totalRevenue = allSales.reduce((sum: number, order: any) => {
            return sum + parseFloat(order.total_price || '0');
        }, 0);

        const formattedHistory = allSales.map((order: any) => ({
            product_name: order.Listing?.product_name || 'สินค้า',
            grade: order.Listing?.grade , 
            quantity: parseFloat(order.quantity_ordered),
            total_price: parseFloat(order.total_price),
            date: order.created_at
        }));


        setMetrics({
          totalRevenue: backendMetrics.totalRevenue || 0,
          increasePercent: backendMetrics.increasePercent || 0,
          salesHistory: (backendMetrics as any).salesHistory || [],
        });

        const formattedCharts: any = {};
        const defaultChart = {
          labels: ['-'],
          datasets: [{ data: [0] }]
        };

        Object.keys(priceTrends || {}).forEach(product => {
          const trends = (priceTrends[product] || []) as Array<{ date: string; price: number }>;
          if (trends && trends.length > 0) {
            formattedCharts[product] = {
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

  useEffect(() => {
    if (authLoading) return;
    fetchDashboardData({ showScreenLoader: true });
  }, [authLoading, fetchDashboardData]);

  const onRefresh = () => {
    if (!token) return;
    setRefreshing(true);
    fetchDashboardData();
  };

  const currentChartData = chartDataMap[selectedChart] || {
    labels: ['No Data'],
    datasets: [{ data: [0] }]
  };

  const handleSelectOption = (option: string) => {
    setSelectedChart(option); 
    setDropdownVisible(false); 
  };

  const handleBack = () => {
        router.back();
    };

  const handleNavHome = () => { router.push('/farmer/homeFarmer'); };
  const handleNavChart = () => { };
  const handleNavAdd = () => { router.push('/farmer/createPost'); };
  const handleNavNotifications = () => { router.push('/farmer/notification'); };

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
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>รายได้ทั้งหมด</Text>
            <Text style={styles.metricValueBlue}>
              {metrics.totalRevenue.toLocaleString()} บาท
            </Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardGreenBg]}>
            {/* 🟢 เปลี่ยน Label ให้ตรงกับ Logic Backend (เปรียบเทียบกับพ่อค้าคนกลาง) */}
            <Text style={styles.metricLabel}>กำไรส่วนต่าง</Text>
            <Text style={[styles.metricValueGreen, { color: metrics.increasePercent >= 0 ? '#28a745' : '#dc3545' }]}>
                {metrics.increasePercent > 0 ? '+' : ''}{metrics.increasePercent}%
            </Text>
            <Text style={{fontSize: 10, color: '#666'}}>(เทียบราคาล้ง)</Text>
          </View>
        </View>

         {/* --- ⭐️ ส่วนแก้ไข: แสดงรายการขายทั้งหมด (List) --- */}
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
                            {/* ตรวจสอบว่ามีวันที่หรือไม่ ถ้าไม่มีใช้วันนี้ */}
                            {item.date ? new Date(item.date).toLocaleDateString('th-TH') : ''}
                        </Text>
                    </View>
                    
                    <View style={styles.historyDetails}>
                        <Text style={styles.detailText}>จำนวน: {item.quantity} กก.</Text>
                        {/* เช็คค่าก่อน toLocaleString เพื่อกัน Error */}
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

          <View style={styles.chartContainer}>
            {currentChartData.datasets[0].data.length > 0 && currentChartData.labels.length > 0 ? (
               <LineChart
               data={currentChartData}
               width={width - 32} 
               height={220}
               chartConfig={chartConfig}
               bezier
               style={styles.chart}
               fromZero
             />
            ) : (
              <View style={{height: 220, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#999'}}>ไม่มีข้อมูลราคาตลาด</Text>
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
  
  // --- ⭐️ Styles สำหรับ History List ---
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
      color: '#28a745', // สีเขียวสำหรับยอดเงิน
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