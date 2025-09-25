import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteSupplier, type Supplier } from '@/hooks/useSuppliers';

interface DeleteSupplierDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSupplierDialog({ supplier, open, onOpenChange }: DeleteSupplierDialogProps) {
  const { toast } = useToast();
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async () => {
    deleteSupplier.mutate(supplier.id, {
      onSuccess: () => {
        toast({
          title: "Fornecedor excluído com sucesso!",
          description: `${supplier.name} foi removido da base de dados.`,
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast({
          title: "Erro ao excluir fornecedor",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        console.error('Erro:', error);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o fornecedor <strong>{supplier.name}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita e todas as informações associadas a este fornecedor serão perdidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}