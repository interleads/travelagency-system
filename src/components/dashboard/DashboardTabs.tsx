
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesChart from "./SalesChart";
import TopProductsChart from "./TopProductsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users } from "lucide-react";
import DestinationChart from "./DestinationChart";
import FinancialAnalysisChart from "./FinancialAnalysisChart";

export default function DashboardTabs() {
  return (
    <Tabs defaultValue="dashboard">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
        <TabsTrigger value="vendas">Vendas</TabsTrigger>
        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        <TabsTrigger value="clientes">Clientes</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <TopProductsChart />
        </div>
      </TabsContent>

      <TabsContent value="vendas">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendas e Lucro por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <SalesChart />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Destinos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <DestinationChart />
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
              <FinancialAnalysisChart />
            </div>
          </CardContent>
        </Card>
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
  );
}
