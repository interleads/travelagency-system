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
import { Transaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useToast } from "@/hooks/use-toast";

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange 
}: DeleteTransactionDialogProps) {
  const { toast } = useToast();
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast({
        title: "Transação excluída com sucesso!",
        description: `${transaction.type === 'receita' ? 'Receita' : 'Despesa'} de R$ ${transaction.value}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir transação",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta transação?
            <br />
            <strong>{transaction.description}</strong> - R$ {transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}