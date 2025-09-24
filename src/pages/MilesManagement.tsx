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
import { MilesDashboard } from '@/components/miles/MilesDashboard';
import { MilesPurchaseForm } from '@/components/miles/MilesPurchaseForm';
import { SuppliersTable } from '@/components/finance/SuppliersTable';
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { DateRangeFilterProvider } from '@/components/shared/useDateRangeFilter';

const MilesManagement = () => {
  const { toast } = useToast();
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  const handlePurchaseSubmit = (data: any) => {
    console.log('Nova compra de milhas:', data);
    toast({
      title: "Compra registrada com sucesso!",
      description: `${data.quantity.toLocaleString()} milhas - R$ ${data.purchase_value.toFixed(2)}`,
    });
    setIsPurchaseDialogOpen(false);
  };

  return (
    <DateRangeFilterProvider>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Gestão de Milhas</h2>
          <div className="flex gap-2">
            <DateRangeFilter />
            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" />
                  Comprar Milhas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Comprar Milhas</DialogTitle>
                </DialogHeader>
                <MilesPurchaseForm onSubmit={handlePurchaseSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory">
          <MilesDashboard />
        </TabsContent>
        
        <TabsContent value="suppliers">
          <SuppliersTable />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  </DateRangeFilterProvider>
  );
};

export default MilesManagement;