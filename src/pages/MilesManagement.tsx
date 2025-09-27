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
import { MilesInventoryTable } from '@/components/miles/MilesInventoryTable';
import { MilesPurchaseForm } from '@/components/miles/MilesPurchaseForm';
import { SuppliersTable } from '@/components/finance/SuppliersTable';
import { MilesOverviewCards } from '@/components/miles/MilesOverviewCards';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { DateRangeFilterProvider } from '@/components/shared/useDateRangeFilter';
import { useIsMobile } from "@/hooks/use-mobile";

const MilesManagement = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
      <div className="space-y-4 md:space-y-6 p-4 md:p-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <DateRangeFilter />
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList className="grid w-full md:w-fit grid-cols-2 h-12 md:h-10">
              <TabsTrigger value="inventory" className="text-sm md:text-base">Estoque</TabsTrigger>
              <TabsTrigger value="suppliers" className="text-sm md:text-base">Fornecedores</TabsTrigger>
            </TabsList>
            
            {activeTab === "inventory" && !isMobile && (
              <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 md:h-10">
                    <Plus className="mr-2 h-4 w-4" />
                    Comprar Milhas
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
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

        {/* Floating Action Button for mobile */}
        {activeTab === "inventory" && (
          <FloatingActionButton
            icon={Plus}
            label="Comprar Milhas"
            onClick={() => setIsPurchaseDialogOpen(true)}
          />
        )}

        {/* Mobile Purchase Dialog */}
        {isMobile && (
          <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Comprar Milhas</DialogTitle>
              </DialogHeader>
              <MilesPurchaseForm onSubmit={handlePurchaseSubmit} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DateRangeFilterProvider>
  );
};

export default MilesManagement;