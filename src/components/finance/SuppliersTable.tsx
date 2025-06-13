
import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, User } from "lucide-react";
import { SupplierForm } from './SupplierForm';
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  accountType: string;
  program: string;
  status: 'Ativo' | 'Inativo';
  notes: string;
  lastUsed: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'João Silva',
    contact: '(11) 99999-9999',
    accountType: 'Conta Azul',
    program: 'TudoAzul',
    status: 'Ativo',
    notes: 'Conta com bom saldo de milhas',
    lastUsed: '2025-01-10'
  },
  {
    id: '2',
    name: 'Ana Costa',
    contact: '(21) 88888-8888',
    accountType: 'Conta SMILES',
    program: 'SMILES',
    status: 'Ativo',
    notes: 'Parceira de longa data',
    lastUsed: '2025-01-08'
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    contact: '(31) 77777-7777',
    accountType: 'Conta TudoAzul',
    program: 'TudoAzul',
    status: 'Ativo',
    notes: 'Especialista em rotas internacionais',
    lastUsed: '2025-01-05'
  },
  {
    id: '4',
    name: 'Maria Oliveira',
    contact: '(41) 66666-6666',
    accountType: 'Conta Livelo',
    program: 'Livelo',
    status: 'Inativo',
    notes: 'Conta temporariamente indisponível',
    lastUsed: '2024-12-20'
  }
];

export function SuppliersTable() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);

  const handleSupplierSubmit = (data: any) => {
    console.log('Novo fornecedor:', data);
    toast({
      title: "Fornecedor cadastrado com sucesso!",
      description: `${data.name} - ${data.accountType}`,
    });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    return status === 'Ativo' 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-red-100 text-red-800';
  };

  const activeSuppliers = suppliers.filter(s => s.status === 'Ativo').length;
  const totalSuppliers = suppliers.length;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <p className="text-2xl font-bold text-gray-600">{totalSuppliers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{activeSuppliers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Programas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {[...new Set(suppliers.map(s => s.program))].length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header com botão */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Fornecedores e Parceiros</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Fornecedor</DialogTitle>
            </DialogHeader>
            <SupplierForm onSubmit={handleSupplierSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Tipo de Conta</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Uso</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.accountType}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {supplier.program}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(supplier.lastUsed).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{supplier.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
