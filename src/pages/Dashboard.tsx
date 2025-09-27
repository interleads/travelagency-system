
import React from 'react';
import DashboardKPICards from "@/components/dashboard/DashboardKPICards";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import { DashboardDateRangeProvider } from "@/components/dashboard/useDashboardDateRange";
import DailySalesChart from "@/components/dashboard/DailySalesChart";

const Dashboard = () => {
  return (
    <DashboardDateRangeProvider>
      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
        <DashboardFilters />
      </div>
      <DashboardKPICards />
      <div className="mt-6 sm:mt-8">
        <DailySalesChart />
      </div>
    </DashboardDateRangeProvider>
  );
};

export default Dashboard;
