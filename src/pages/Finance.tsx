
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useToast } from "@/hooks/use-toast";
import { CashFlowTable } from '@/components/finance/CashFlowTable';
import { FinanceOverviewCards } from '@/components/finance/FinanceOverviewCards';
import { FinanceChart } from '@/components/finance/FinanceChart';
import { RecentTransactionsTable } from '@/components/finance/RecentTransactionsTable';
import { AccountsReceivableTable } from '@/components/finance/AccountsReceivableTable';
import { AccountsPayableTable } from '@/components/finance/AccountsPayableTable';

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
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="income">Contas a Receber</TabsTrigger>
          <TabsTrigger value="expenses">Contas a Pagar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FinanceOverviewCards />
          <FinanceChart />
          <RecentTransactionsTable />
        </TabsContent>
        
        <TabsContent value="cashflow">
          <CashFlowTable />
        </TabsContent>
        
        <TabsContent value="income">
          <AccountsReceivableTable />
        </TabsContent>
        
        <TabsContent value="expenses">
          <AccountsPayableTable />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Finance;
