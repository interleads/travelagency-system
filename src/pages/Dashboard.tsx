
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Briefcase, Ticket } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const statCards = [
  {
    title: "Vendas do Mês",
    value: "R$ 45.231,00",
    change: "+12%",
    icon: CreditCard,
    color: "bg-sky-500"
  },
  {
    title: "Novos Clientes",
    value: "24",
    change: "+3%",
    icon: Users,
    color: "bg-emerald-500"
  },
  {
    title: "Pacotes Criados",
    value: "12",
    change: "-2%",
    icon: Briefcase,
    color: "bg-amber-500"
  },
  {
    title: "Passeios Vendidos",
    value: "86",
    change: "+18%",
    icon: Ticket,
    color: "bg-indigo-500"
  }
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Bem-vindo ao Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className={`text-xs ${card.change.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                {card.change} desde o último mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">Pacote Cancún Premium</div>
                    <div className="text-sm text-gray-500">Cliente: Maria Silva</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R$ 4.750,00</div>
                    <div className="text-sm text-gray-500">12/04/2025</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Próximas Viagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">Paris - França</div>
                    <div className="text-sm text-gray-500">15/05/2025 - 22/05/2025</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">3 passageiros</div>
                    <div className="text-sm text-gray-500">Confirmado</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
