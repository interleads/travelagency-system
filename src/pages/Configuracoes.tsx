
import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { 
  Settings, Users, Building2, Tags, 
  Plus, Edit, Trash2, Save 
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const Configuracoes = () => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas!",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h2>
      </div>
      
      <Tabs defaultValue="usuarios">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores Padrão</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Usuários
              </CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>João Silva</TableCell>
                    <TableCell>joao@agencia.com</TableCell>
                    <TableCell>Administrador</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                        Ativo
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maria Santos</TableCell>
                    <TableCell>maria@agencia.com</TableCell>
                    <TableCell>Vendedor</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                        Ativo
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fornecedores">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Fornecedores Padrão
              </CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Companhias Aéreas</h4>
                  {["LATAM", "GOL", "Azul", "Air France", "TAP"].map((airline) => (
                    <div key={airline} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{airline}</span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Contas de Milhas</h4>
                  {["Conta Azul - João", "Conta SMILES - Ana", "Conta TudoAzul - Carlos"].map((account) => (
                    <div key={account} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{account}</span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categorias">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Categorias Financeiras
              </CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Categorias de Receita</h4>
                  <div className="space-y-2">
                    {["Venda de Passagens", "Pacotes Turísticos", "Seguro Viagem", "Assessoria"].map((category) => (
                      <div key={category} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{category}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Categorias de Despesa</h4>
                  <div className="space-y-2">
                    {["Fornecedores", "Aluguel", "Marketing", "Pessoal", "Operacional"].map((category) => (
                      <div key={category} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{category}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" defaultValue="Agência de Viagens" />
                  </div>
                  <div>
                    <Label htmlFor="company-email">E-mail da Empresa</Label>
                    <Input id="company-email" type="email" defaultValue="contato@agencia.com" />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input id="company-phone" defaultValue="(11) 99999-9999" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Input id="timezone" defaultValue="America/Sao_Paulo" />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moeda Padrão</Label>
                    <Input id="currency" defaultValue="BRL" />
                  </div>
                  <div>
                    <Label htmlFor="backup-frequency">Frequência de Backup</Label>
                    <Input id="backup-frequency" defaultValue="Diário" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Configuracoes;
