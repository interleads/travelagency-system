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

const Vendas = () => {
  const { toast } = useToast();
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);

  const handleSaleSubmit = (data: any) => {
    console.log('Nova venda:', data);
    toast({
      title: "Venda registrada com sucesso!",
      description: `Cliente: ${data.client} - R$ ${data.total}`,
    });
    setIsSaleDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Módulo Vendas</h2>
          <p className="text-muted-foreground">Gerencie vendas, clientes e relatórios em um só lugar</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Plus className="h-4 w-4" />
                Registrar Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="bg-primary text-primary-foreground p-6 -m-6 mb-6 rounded-t-lg">
                <DialogTitle className="text-xl font-semibold">Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <div className="px-2">
                <VendasForm />
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
  );
};

export default Vendas;
