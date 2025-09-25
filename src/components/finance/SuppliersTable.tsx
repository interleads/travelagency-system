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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, User, Loader2, MoreVertical, ChevronDown, ChevronRight, Edit, Trash2, Eye } from "lucide-react";
import { SupplierForm } from './SupplierForm';
import { EditSupplierDialog } from './EditSupplierDialog';
import { DeleteSupplierDialog } from './DeleteSupplierDialog';
import { SupplierDetailsExpanded } from './SupplierDetailsExpanded';
import { useToast } from "@/hooks/use-toast";
import { useSuppliers, useAddSupplier, type Supplier } from '@/hooks/useSuppliers';

export function SuppliersTable() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  
  const { data: suppliers = [], isLoading } = useSuppliers();
  const addSupplier = useAddSupplier();

  const toggleSupplierExpansion = (supplierId: string) => {
    const newExpanded = new Set(expandedSuppliers);
    if (newExpanded.has(supplierId)) {
      newExpanded.delete(supplierId);
    } else {
      newExpanded.add(supplierId);
    }
    setExpandedSuppliers(newExpanded);
  };

  const handleSupplierSubmit = async (data: any) => {
    console.log('Novo fornecedor:', data);
    
    const supplierData = {
      name: data.name,
      contact: data.contact,
      account_type: data.accountType || data.account_type,
      program: data.program,
      status: data.status || 'Ativo',
      notes: data.notes || '',
    };

    addSupplier.mutate(supplierData, {
      onSuccess: () => {
        toast({
          title: "Fornecedor cadastrado com sucesso!",
          description: `${data.name} - ${data.accountType || data.account_type}`,
        });
        setIsDialogOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Erro ao cadastrar fornecedor",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        console.error('Erro:', error);
      },
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'Ativo' 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando fornecedores...</span>
      </div>
    );
  }

  const activeSuppliers = suppliers.filter((s: any) => s.status === 'Ativo').length;
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
              {[...new Set(suppliers.map((s: any) => s.program))].length}
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
          {suppliers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum fornecedor cadastrado</p>
              <p className="text-sm">Clique no botão "Novo Fornecedor" para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Tipo de Conta</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Uso</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier: any) => (
                  <React.Fragment key={supplier.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSupplierExpansion(supplier.id)}
                        >
                          {expandedSuppliers.has(supplier.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>{supplier.account_type}</TableCell>
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
                      <TableCell>
                        {supplier.last_used ? new Date(supplier.last_used).toLocaleDateString() : 'Nunca'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{supplier.notes || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toggleSupplierExpansion(supplier.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Histórico
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEditingSupplier(supplier)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingSupplier(supplier)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedSuppliers.has(supplier.id) && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-0">
                          <SupplierDetailsExpanded
                            supplierId={supplier.id}
                            supplierName={supplier.name}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Supplier Dialog */}
      {editingSupplier && (
        <EditSupplierDialog
          supplier={editingSupplier}
          open={!!editingSupplier}
          onOpenChange={(open) => !open && setEditingSupplier(null)}
        />
      )}

      {/* Delete Supplier Dialog */}
      {deletingSupplier && (
        <DeleteSupplierDialog
          supplier={deletingSupplier}
          open={!!deletingSupplier}
          onOpenChange={(open) => !open && setDeletingSupplier(null)}
        />
      )}
    </div>
  );
}