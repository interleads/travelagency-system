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
import { useClearMilesInventory } from '@/hooks/useMilesInventory';
import { useToast } from "@/hooks/use-toast";

interface ClearInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClearInventoryDialog({ 
  open, 
  onOpenChange 
}: ClearInventoryDialogProps) {
  const { toast } = useToast();
  const clearInventory = useClearMilesInventory();

  const handleClear = async () => {
    try {
      await clearInventory.mutateAsync();
      toast({
        title: "Estoque limpo com sucesso!",
        description: "Todo o estoque de milhas foi removido",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao limpar estoque",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar Todo o Estoque</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja limpar todo o estoque de milhas?
            <br />
            <br />
            <strong className="text-red-600">Esta ação irá:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Excluir todos os lançamentos de milhas</li>
              <li>Remover todas as transações de milhas</li>
              <li>Apagar todo o histórico financeiro relacionado</li>
            </ul>
            <br />
            <strong className="text-red-600">Esta ação não pode ser desfeita.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700"
            disabled={clearInventory.isPending}
          >
            {clearInventory.isPending ? "Limpando..." : "Limpar Estoque"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}