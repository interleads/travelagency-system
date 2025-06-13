
import React from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  Pie,
  Cell
} from "recharts";
import { 
  FileText, Download, Calendar, 
  TrendingUp, DollarSign, Users 
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Dados de exemplo para os gráficos
const salesData = [
  { month: 'Jan', vendas: 45, lucro: 13 },
  { month: 'Fev', vendas: 52, lucro: 16 },
  { month: 'Mar', vendas: 48, lucro: 14 },
  { month: 'Abr', vendas: 61, lucro: 19 },
  { month: 'Mai', vendas: 55, lucro: 17 },
  { month: 'Jun', vendas: 67, lucro: 22 }
];

const destinationData = [
  { name: 'Europa', value: 30, color: '#0088FE' },
  { name: 'América do Norte', value: 25, color: '#00C49F' },
  { name: 'Ásia', value: 20, color: '#FFBB28' },
  { name: 'América do Sul', value: 15, color: '#FF8042' },
  { name: 'Outros', value: 10, color: '#8884D8' }
];

const Relatorios = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Relatórios e Análises</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Período
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 328.000</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">
              +5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">29.6%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="vendas">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas e Lucro por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="vendas" stroke="#10B981" name="Vendas" />
                      <Line type="monotone" dataKey="lucro" stroke="#3B82F6" name="Lucro (k)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Destinos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={destinationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {destinationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vendas" fill="#10B981" name="Receitas (k)" />
                    <Bar dataKey="lucro" fill="#EF4444" name="Lucro (k)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operacional">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Relatórios Operacionais</h3>
            <p className="mt-2 text-gray-500">
              Análises de performance operacional, passagens emitidas, fornecedores
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="clientes">
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Análise de Clientes</h3>
            <p className="mt-2 text-gray-500">
              Comportamento de compra, retenção, lifetime value
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Relatorios;
