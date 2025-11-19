import api from './api';

export interface FarmerDashboardResponse {
  metrics: {
    totalRevenue: number;
    increasePercent: number;
    latestSale: {
      product_name: string;
      grade: string | null;
      quantity: number;
    } | null;
    totalTransactions?: number;
  };
  priceTrends: Record<
    string,
    Array<{
      date: string;
      price: number;
    }>
  >;
}

export interface DashboardStatsResponse {
  metrics: {
    total_sales_value: number;
    total_transactions: number;
    average_price: number;
    waste_reduced_kg: number;
    updated_at: string | null;
  };
  totals: {
    activeListings: number;
    completedOrders: number;
    totalFarmers: number;
    totalBuyers: number;
  };
}

/**
 * ดึงข้อมูล Dashboard ของเกษตรกร
 * Endpoint: GET /api/dashboard
 */
export const getFarmerDashboard = async (): Promise<FarmerDashboardResponse> => {
  console.log('📡 Calling: GET /api/dashboard');
  const response = await api.get('/dashboard');
  console.log('✅ Dashboard response:', response.data);
  return response.data;
};

/**
 * ดึงสถิติรวมของระบบ
 * ⚠️ ถ้า Backend ยังไม่มี endpoint นี้ ให้ comment ฟังก์ชันนี้ออก
 * หรือ return mock data แทน
 */
export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  try {
    console.log('📡 Calling: GET /api/dashboard/stats');
    const response = await api.get('/api/dashboard/stats');
    console.log('✅ Stats response:', response.data);
    return response.data;
  } catch (error) {
    console.warn('⚠️  getDashboardStats failed, returning mock data');
    
    // Return mock data เพื่อไม่ให้ app crash
    return {
      metrics: {
        total_sales_value: 0,
        total_transactions: 0,
        average_price: 0,
        waste_reduced_kg: 0,
        updated_at: null
      },
      totals: {
        activeListings: 0,
        completedOrders: 0,
        totalFarmers: 0,
        totalBuyers: 0
      }
    };
  }
};