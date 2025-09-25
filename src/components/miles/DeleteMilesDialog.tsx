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
import { MilesInventory, useDeleteMilesInventory } from '@/hooks/useMilesInventory';
import { useToast } from "@/hooks/use-toast";

interface DeleteMilesDialogProps {
  item: MilesInventory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMilesDialog({ 
  item, 
  open, 
  onOpenChange 
}: DeleteMilesDialogProps) {
  const { toast } = useToast();
  const deleteMiles = useDeleteMilesInventory();

  const canDelete = item.remaining_quantity === item.quantity;

  const handleDelete = async () => {
    if (!canDelete) {
      toast({
        title: "Não é possível excluir",
        description: "Esta entrada possui milhas já utilizadas",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMiles.mutateAsync(item.id);
      toast({
        title: "Entrada de milhas excluída com sucesso!",
        description: `${item.quantity.toLocaleString()} milhas removidas do estoque`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir entrada de milhas",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Entrada de Milhas</AlertDialogTitle>
          <AlertDialogDescription>
            {canDelete ? (
              <>
                Tem certeza que deseja excluir esta entrada de milhas?
                <br />
                <strong>{item.miles_programs?.name}</strong> - {item.quantity.toLocaleString()} milhas
                <br />
                Esta ação não pode ser desfeita.
              </>
            ) : (
              <>
                Esta entrada não pode ser excluída porque possui milhas já utilizadas.
                <br />
                <strong>Saldo restante:</strong> {item.remaining_quantity.toLocaleString()} de {item.quantity.toLocaleString()} milhas
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}