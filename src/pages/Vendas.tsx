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
              <Button>
                <Plus className="mr-2" />
                Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <VendasForm />
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
