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

const Operacional = () => {
  const { toast } = useToast();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Módulo Operacional</h2>
      </div>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passagens Ativas</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +1 este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              -3 desde ontem
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="passagens">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="passagens">Passagens</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="milhas">Estoque de Milhas</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="passagens">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Gestão de Passagens</h3>
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" />
                  Nova Passagem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Passagem</DialogTitle>
                </DialogHeader>
                <TicketForm onSubmit={handleTicketSubmit} />
              </DialogContent>
            </Dialog>
          </div>
          <AirlineTicketsTable />
        </TabsContent>
        
        <TabsContent value="fornecedores">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Gestão de Fornecedores</h3>
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" />
                  Novo Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Fornecedor</DialogTitle>
                </DialogHeader>
                <SupplierForm onSubmit={handleSupplierSubmit} />
              </DialogContent>
            </Dialog>
          </div>
          <SuppliersTable />
        </TabsContent>
        
        <TabsContent value="milhas">
          <Card>
            <CardHeader>
              <CardTitle>Estoque de Milhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Controle de Milhas</h3>
                <p className="mt-2 text-gray-500">
                  Gerencie o estoque de milhas por programa de fidelidade
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2" />
                  Adicionar Saldo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendas">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Registrar Venda</h3>
          </div>
          <VendasForm />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Operacional;
