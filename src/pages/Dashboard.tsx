
import React from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardKPICards from "@/components/dashboard/DashboardKPICards";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import DashboardFilters from "@/components/dashboard/DashboardFilters";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard - Análises e Relatórios</h2>
        <DashboardFilters />
      </div>
      <DashboardKPICards />
      <div className="mt-6">
        <DashboardTabs />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
