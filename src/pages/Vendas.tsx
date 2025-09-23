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
import { Plus, Plane, Users, Package } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { AirlineTicketsTable } from '@/components/finance/AirlineTicketsTable';
import { SuppliersTable } from '@/components/finance/SuppliersTable';
import { TicketForm } from '@/components/finance/TicketForm';
import { SupplierForm } from '@/components/finance/SupplierForm';
import { useToast } from "@/hooks/use-toast";
import VendasForm from "@/components/vendas/VendasForm";
import { SalesOverviewCards } from "@/components/vendas/SalesOverviewCards";
import { SalesHistoryTable } from "@/components/vendas/SalesHistoryTable";

const Vendas = () => {
  const { toast } = useToast();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);

  const handleTicketSubmit = (data: any) => {
    console.log('Nova passagem:', data);
    toast({
      title: "Passagem registrada com sucesso!",
      description: `Passagem para ${data.passengerName} - ${data.route}`,
    });
    setIsTicketDialogOpen(false);
  };

  const handleSupplierSubmit = (data: any) => {
    console.log('Novo fornecedor:', data);
    toast({
      title: "Fornecedor cadastrado com sucesso!",
      description: `${data.name} - ${data.category}`,
    });
    setIsSupplierDialogOpen(false);
  };

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
        <h2 className="text-3xl font-bold text-gray-800">Módulo Vendas</h2>
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
      
      <SalesOverviewCards />
      
      <Tabs defaultValue="passagens">
        <TabsList className="grid w-full grid-cols-1 mb-8">
          <TabsTrigger value="passagens">Histórico de Vendas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="passagens">
          <SalesHistoryTable />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Vendas;
