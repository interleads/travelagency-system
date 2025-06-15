import React from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardKPICards from "@/components/dashboard/DashboardKPICards";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Visão Geral do Dashboard</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md border text-sm font-semibold bg-gradient-to-tr from-sky-500 to-emerald-400 text-white animate-fade-in shadow hover:scale-105 transition">Nova Venda</button>
          <button className="px-4 py-2 rounded-md border text-sm font-semibold bg-white/70 text-gray-800 hover:bg-sky-50 transition">Exportar Dados</button>
        </div>
      </div>
      <DashboardKPICards />
      <div className="grid mt-6 gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesChart />
        <TopProductsChart />
      </div>
      {/* Outras widgets podem ser adicionadas aqui futuramente */}
    </DashboardLayout>
  );
};

export default Dashboard;
