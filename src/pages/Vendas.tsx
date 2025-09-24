// Renomeado de Operacional.tsx para Vendas.tsx
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
import { Plus, BarChart2, Users, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import VendasForm from "@/components/vendas/VendasForm";
import { SalesOverviewCards } from "@/components/vendas/SalesOverviewCards";
import { SalesHistoryTable } from "@/components/vendas/SalesHistoryTable";
import CRMKanban from "@/components/crm/CRMKanban";
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { DateRangeFilterProvider } from '@/components/shared/useDateRangeFilter';

const Vendas = () => {
  const { toast } = useToast();
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);


  return (
    <DateRangeFilterProvider>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <DateRangeFilter />
            <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Plus className="h-4 w-4" />
                  Registrar Nova Venda
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
                <DialogHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 rounded-t-lg shadow-lg">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Plus className="h-6 w-6" />
                    Registrar Nova Venda
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <VendasForm onSaleSuccess={() => setIsSaleDialogOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      
      <SalesOverviewCards />
      
      <Tabs defaultValue="historico" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <BarChart2 size={16} />
            Histórico de Vendas
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Users size={16} />
            CRM
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText size={16} />
            Relatórios
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="historico">
          <SalesHistoryTable />
        </TabsContent>
        
        <TabsContent value="crm">
          <CRMKanban />
        </TabsContent>
        
        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seção de relatórios em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  </DateRangeFilterProvider>
  );
};

export default Vendas;
