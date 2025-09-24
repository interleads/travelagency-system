// Renomeado de Operacional.tsx para Vendas.tsx
import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, BarChart2, Users, FileText, Search } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import VendasForm from "@/components/vendas/VendasForm";
import { SalesOverviewCards } from "@/components/vendas/SalesOverviewCards";
import { SalesHistoryTable } from "@/components/vendas/SalesHistoryTable";
import CRMKanban from "@/components/crm/CRMKanban";
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { DateRangeFilterProvider } from '@/components/shared/useDateRangeFilter';
import { ImportCSV } from '@/components/vendas/ImportCSV';

const Vendas = () => {
  const { toast } = useToast();
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("historico");
  const [searchFilter, setSearchFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("todos");
  const [yearFilter, setYearFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  return (
    <DateRangeFilterProvider>
      <DashboardLayout>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <DateRangeFilter />
          
          {/* Filtros adicionais */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Busca por cliente */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, local ou grupo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros de período, ano e status */}
            <div className="flex gap-2">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="andamento">Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
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
            
            {activeTab === "historico" && (
              <div className="flex gap-2">
                <ImportCSV />
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
            )}
            </div>
            
            <SalesOverviewCards activeTab={activeTab} />
        
        <TabsContent value="historico">
          <SalesHistoryTable 
            searchFilter={searchFilter}
            periodFilter={periodFilter}
            yearFilter={yearFilter}
            statusFilter={statusFilter}
          />
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
