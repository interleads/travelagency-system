
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
import { TransactionForm } from '@/components/finance/TransactionForm';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useToast } from "@/hooks/use-toast";
import { CashFlowTableReal } from '@/components/finance/CashFlowTableReal';
import { useAddTransaction } from '@/hooks/useTransactions';
import { FinanceOverviewCards } from '@/components/finance/FinanceOverviewCards';
import { FinanceChart } from '@/components/finance/FinanceChart';
import { UnifiedAccountsTable } from '@/components/finance/UnifiedAccountsTable';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { DateRangeFilterProvider } from '@/components/shared/useDateRangeFilter';
import { useIsMobile } from "@/hooks/use-mobile";

const Finance = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    <DateRangeFilterProvider>
      <div className="space-y-4 md:space-y-6 p-4 md:p-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Módulo Financeiro</h2>
          <div className="flex flex-col md:flex-row gap-3 md:gap-2">
            <DateRangeFilter />
            {!isMobile && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 md:h-10">
                    <Plus className="mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                  </DialogHeader>
                  <TransactionForm onSubmit={handleTransactionSubmit} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      
        <Tabs defaultValue="financial" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 md:h-10 mb-6 md:mb-8">
            <TabsTrigger value="financial" className="text-sm md:text-base">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="accounts" className="text-sm md:text-base">Contas</TabsTrigger>
          </TabsList>
        
          <TabsContent value="financial" className="space-y-4 md:space-y-6">
            <FinanceOverviewCards />
            <FinanceChart />
            <CashFlowTableReal />
          </TabsContent>
        
          <TabsContent value="accounts" className="space-y-4 md:space-y-6">
            <UnifiedAccountsTable />
          </TabsContent>
        </Tabs>

        {/* Floating Action Button for mobile */}
        <FloatingActionButton
          icon={Plus}
          label="Nova Transação"
          onClick={() => setIsDialogOpen(true)}
        />

        {/* Mobile Transaction Dialog */}
        {isMobile && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <TransactionForm onSubmit={handleTransactionSubmit} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DateRangeFilterProvider>
  );
};

export default Finance;
