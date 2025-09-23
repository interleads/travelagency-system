import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from './TransactionForm';
import { Transaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useToast } from "@/hooks/use-toast";

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange 
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const updateTransaction = useUpdateTransaction();

  const handleSubmit = async (data: any) => {
    try {
      await updateTransaction.mutateAsync({ 
        id: transaction.id, 
        ...data 
      });
      toast({
        title: "Transação atualizada com sucesso!",
        description: `${data.type === 'receita' ? 'Receita' : 'Despesa'} de R$ ${data.value} - ${data.category}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar transação",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        <TransactionForm 
          onSubmit={handleSubmit}
          defaultValues={{
            date: transaction.date,
            description: transaction.description,
            type: transaction.type,
            category: transaction.category,
            subcategory: transaction.subcategory,
            value: transaction.value,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}