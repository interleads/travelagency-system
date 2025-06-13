import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar
} from "recharts";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useToast } from "@/hooks/use-toast";
import { CashFlowTable } from '@/components/finance/CashFlowTable';

// Dados de exemplo para o gráfico
const chartData = [
  { month: 'Jan', receitas: 45000, despesas: 32000 },
  { month: 'Fev', receitas: 52000, despesas: 38000 },
  { month: 'Mar', receitas: 48000, despesas: 35000 },
  { month: 'Abr', receitas: 61000, despesas: 42000 },
  { month: 'Mai', receitas: 55000, despesas: 39000 },
  { month: 'Jun', receitas: 67000, despesas: 45000 }
];

const Finance = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTransactionSubmit = (data: any) => {
    console.log('Nova transação:', data);
    toast({
      title: "Transação registrada com sucesso!",
      description: `${data.type === 'receita' ? 'Receita' : 'Despesa'} de R$ ${data.value} - ${data.category}`,
    });
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Módulo Financeiro</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm onSubmit={handleTransactionSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="income">Contas a Receber</TabsTrigger>
          <TabsTrigger value="expenses">Contas a Pagar</TabsTrigger>
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
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resultados Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="receitas" stroke="#10B981" name="Receitas" />
                    <Line type="monotone" dataKey="despesas" stroke="#EF4444" name="Despesas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
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
        
        <TabsContent value="cashflow">
          <CashFlowTable />
        </TabsContent>
        
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Venc.</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      date: "30/04/2025",
                      client: "João Silva",
                      description: "Pacote Paris - 2ª Parcela",
                      status: "Pendente",
                      value: "R$ 2.500,00"
                    },
                    {
                      date: "05/05/2025",
                      client: "Maria Santos",
                      description: "Pacote Orlando - 3ª Parcela",
                      status: "Pendente",
                      value: "R$ 1.890,00"
                    },
                    {
                      date: "10/05/2025",
                      client: "Pedro Alves",
                      description: "Pacote Cancún - Entrada",
                      status: "Agendado",
                      value: "R$ 3.250,00"
                    }
                  ].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "Pendente" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Venc.</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      date: "28/04/2025",
                      supplier: "Hotel Majestic",
                      description: "Hospedagem - Grupo Maio",
                      status: "Pendente",
                      value: "R$ 12.800,00"
                    },
                    {
                      date: "01/05/2025",
                      supplier: "Cia Aérea Nacional",
                      description: "Passagens - Lote 157",
                      status: "Agendado",
                      value: "R$ 18.450,00"
                    },
                    {
                      date: "05/05/2025",
                      supplier: "Seguradora Travel",
                      description: "Seguros - Abril/2025",
                      status: "Pendente",
                      value: "R$ 3.890,00"
                    }
                  ].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "Pendente" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas x Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                      <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Demonstrativo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total de Receitas:</span>
                    <span className="text-emerald-600 font-bold">R$ 328.000,00</span>
                  </div>
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total de Despesas:</span>
                    <span className="text-red-600 font-bold">R$ 231.000,00</span>
                  </div>
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Resultado:</span>
                    <span className="text-sky-600 font-bold">R$ 97.000,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Finance;
