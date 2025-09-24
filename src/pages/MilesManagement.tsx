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
import { MilesInventoryTable } from '@/components/miles/MilesInventoryTable';
import { MilesPurchaseForm } from '@/components/miles/MilesPurchaseForm';
import { SuppliersTable } from '@/components/finance/SuppliersTable';
import { MilesOverviewCards } from '@/components/miles/MilesOverviewCards';
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { DateRangeFilterProvider } from '@/components/shared/useDateRangeFilter';

const MilesManagement = () => {
  const { toast } = useToast();
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");

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
        <div className="flex items-center justify-between mb-6">
          <DateRangeFilter />
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="inventory">Estoque</TabsTrigger>
              <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            </TabsList>
            
            {activeTab === "inventory" && (
              <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
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
            )}
          </div>

          <MilesOverviewCards activeTab={activeTab} />
          
          <TabsContent value="inventory" className="mt-0">
            <MilesInventoryTable />
          </TabsContent>
          
          <TabsContent value="suppliers" className="mt-0">
            <SuppliersTable />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </DateRangeFilterProvider>
  );
};

export default MilesManagement;