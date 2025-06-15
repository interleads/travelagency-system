
import React from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardKPICards from "@/components/dashboard/DashboardKPICards";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import { DashboardDateRangeProvider } from "@/components/dashboard/useDashboardDateRange";
import DailySalesChart from "@/components/dashboard/DailySalesChart";

const Dashboard = () => {
  return (
    <DashboardDateRangeProvider>
      <DashboardLayout>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
          <DashboardFilters />
        </div>
        <DashboardKPICards />
        <div className="mt-6">
          <DailySalesChart />
        </div>
      </DashboardLayout>
    </DashboardDateRangeProvider>
  );
};

export default Dashboard;
