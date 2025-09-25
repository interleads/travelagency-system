import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SupplierForm } from './SupplierForm';
import { useToast } from "@/hooks/use-toast";
import { useUpdateSupplier, type Supplier } from '@/hooks/useSuppliers';

interface EditSupplierDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSupplierDialog({ supplier, open, onOpenChange }: EditSupplierDialogProps) {
  const { toast } = useToast();
  const updateSupplier = useUpdateSupplier();

  const handleSubmit = async (data: any) => {
    const supplierData = {
      id: supplier.id,
      name: data.name,
      contact: data.contact,
      account_type: data.accountType || data.account_type,
      program: data.program,
      status: data.status || 'Ativo',
      notes: data.notes || '',
    };

    updateSupplier.mutate(supplierData, {
      onSuccess: () => {
        toast({
          title: "Fornecedor atualizado com sucesso!",
          description: `${data.name} foi atualizado.`,
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast({
          title: "Erro ao atualizar fornecedor",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        console.error('Erro:', error);
      },
    });
  };

  const defaultValues = {
    name: supplier.name,
    contact: supplier.contact,
    accountType: supplier.account_type,
    program: supplier.program,
    status: supplier.status,
    notes: supplier.notes || '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>
        <SupplierForm 
          onSubmit={handleSubmit} 
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
}