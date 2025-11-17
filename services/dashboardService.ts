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

export const getFarmerDashboard = async (): Promise<FarmerDashboardResponse> => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

