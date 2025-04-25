
import React from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Finance = () => {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Módulo Financeiro</h2>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Balanço Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">R$ 125.780,45</p>
                <p className="text-sm text-gray-500">Atualizado em 25/04/2025</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-sky-600">R$ 248.950,00</p>
                <p className="text-sm text-gray-500">Total acumulado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">R$ 123.169,55</p>
                <p className="text-sm text-gray-500">Total acumulado</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      date: "25/04/2025",
                      description: "Venda - Pacote Maldivas",
                      type: "Receita",
                      value: "R$ 12.350,00"
                    },
                    {
                      date: "23/04/2025",
                      description: "Pagamento de Fornecedor - Hotel",
                      type: "Despesa",
                      value: "R$ 5.820,00"
                    },
                    {
                      date: "20/04/2025",
                      description: "Venda - Pacote Orlando",
                      type: "Receita",
                      value: "R$ 8.740,00"
                    },
                    {
                      date: "18/04/2025",
                      description: "Aluguel do Escritório",
                      type: "Despesa",
                      value: "R$ 3.500,00"
                    },
                    {
                      date: "15/04/2025",
                      description: "Venda - Pacote Lisboa",
                      type: "Receita",
                      value: "R$ 7.890,00"
                    }
                  ].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.type === "Receita" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.type}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right ${
                        item.type === "Receita" ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {item.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Conteúdo detalhado de receitas aparecerá aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Conteúdo detalhado de despesas aparecerá aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Relatórios financeiros aparecerão aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Finance;
