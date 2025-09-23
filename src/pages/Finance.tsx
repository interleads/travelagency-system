
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
import { CashFlowTableReal } from '@/components/finance/CashFlowTableReal';
import { useAddTransaction } from '@/hooks/useTransactions';
import { FinanceOverviewCards } from '@/components/finance/FinanceOverviewCards';
import { FinanceChart } from '@/components/finance/FinanceChart';
import { RecentTransactionsTable } from '@/components/finance/RecentTransactionsTable';
import { AccountsManagement } from '@/components/finance/AccountsManagement';

const Finance = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addTransaction = useAddTransaction();

  const handleTransactionSubmit = async (data: any) => {
    try {
      await addTransaction.mutateAsync(data);
      toast({
        title: "Transação registrada com sucesso!",
        description: `${data.type === 'receita' ? 'Receita' : 'Despesa'} de R$ ${data.value} - ${data.category}`,
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao registrar transação",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
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
      
      <Tabs defaultValue="financial">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-6">
          <FinanceOverviewCards />
          <FinanceChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactionsTable />
            <div>
              <CashFlowTableReal />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="accounts">
          <AccountsManagement />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Finance;
