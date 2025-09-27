// Renomeado de Operacional.tsx para Vendas.tsx
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, BarChart2, Users, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VendasForm from "@/components/vendas/VendasForm";
import { SalesOverviewCards } from "@/components/vendas/SalesOverviewCards";
import { SalesHistoryTable } from "@/components/vendas/SalesHistoryTable";
import CRMKanban from "@/components/crm/CRMKanban";
import { DateRangeFilterProvider } from "@/components/shared/useDateRangeFilter";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useIsMobile } from "@/hooks/use-mobile";
const Vendas = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Se vier da rota CRM, ativar a aba CRM automaticamente
    return window.location.pathname === '/crm' ? 'crm' : 'historico';
  });
  const [searchFilter, setSearchFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("todos");
  const [yearFilter, setYearFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const addColumnFnRef = useRef<((title: string) => void) | null>(null);
  const handleAddColumn = () => {
    if (newColumnTitle.trim() && addColumnFnRef.current) {
      addColumnFnRef.current(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsColumnDialogOpen(false);
    }
  };
  return <DateRangeFilterProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <BarChart2 size={16} />
              Vendas
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
          
          {activeTab === "historico" && <div className="mb-4">
              <DateRangeFilter />
            </div>}
        </div>
          
        <SalesOverviewCards activeTab={activeTab} />

        {/* Filtros adicionais - movidos para baixo dos cards */}
        {activeTab === "historico" && <div className="flex flex-col lg:flex-row gap-4 my-6">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Busca por cliente */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder={isMobile ? "Buscar..." : "Buscar por cliente, local ou grupo..."} 
                  value={searchFilter} 
                  onChange={e => setSearchFilter(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
            
            {/* Botão Registrar Nova Venda - apenas desktop */}
            {!isMobile && (
              <div className="flex gap-2">
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
          </div>}

        {activeTab === "crm" && <div className="flex flex-col lg:flex-row gap-4 my-6">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Busca por cliente no CRM */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar clientes..." className="pl-10" />
              </div>
              
              {/* Botão Nova Coluna na linha dos filtros */}
              <div className="flex gap-2 items-center">
                <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size={isMobile ? "default" : "sm"} variant="outline" className="shrink-0">
                      <Plus size={16} className="mr-2" />
                      Nova Coluna
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Coluna</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="column-title">Título da Coluna</Label>
                        <Input id="column-title" value={newColumnTitle} onChange={e => setNewColumnTitle(e.target.value)} placeholder="Ex: Em Progresso" onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddColumn();
                      }
                    }} />
                      </div>
                      <Button onClick={handleAddColumn} className="w-full">
                        Adicionar Coluna
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>}
      
      <TabsContent value="historico">
        <SalesHistoryTable searchFilter={searchFilter} periodFilter={periodFilter} yearFilter={yearFilter} statusFilter={statusFilter} />
      </TabsContent>
      
      <TabsContent value="crm">
        <CRMKanban registerAddColumn={fn => addColumnFnRef.current = fn} />
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
    
    {/* Floating Action Button - apenas mobile */}
    <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
      <DialogTrigger asChild>
        <FloatingActionButton 
          icon={Plus} 
          label="Nova Venda"
          onClick={() => setIsSaleDialogOpen(true)}
        />
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
    
    </DateRangeFilterProvider>;
};
export default Vendas;