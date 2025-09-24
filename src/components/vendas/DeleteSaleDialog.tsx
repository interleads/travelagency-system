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
import { Sale, useDeleteSale } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

interface DeleteSaleDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSaleDialog({ sale, open, onOpenChange }: DeleteSaleDialogProps) {
  const { toast } = useToast();
  const deleteSale = useDeleteSale();

  const handleDelete = async () => {
    try {
      await deleteSale.mutateAsync(sale.id);
      
      toast({
        title: "Venda excluída com sucesso!",
        description: `A venda de ${sale.client_name} foi removida do sistema.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir venda",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Venda</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta venda?
            <br />
            <br />
            <strong>Cliente:</strong> {sale.client_name}
            <br />
            <strong>Total:</strong> {formatCurrency(Number(sale.total_amount))}
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os produtos, parcelas e transações relacionadas serão permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteSale.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteSale.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}