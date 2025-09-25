import React, { useState } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { useClearAllTransactionalData } from '@/hooks/useClearAllData';
import { useToast } from "@/hooks/use-toast";

interface ClearAllDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClearAllDataDialog({ 
  open, 
  onOpenChange 
}: ClearAllDataDialogProps) {
  const { toast } = useToast();
  const clearAllData = useClearAllTransactionalData();
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const handleClear = async () => {
    if (!confirmationChecked) {
      toast({
        title: "Confirmação necessária",
        description: "Marque a confirmação antes de prosseguir",
        variant: "destructive",
      });
      return;
    }

    try {
      await clearAllData.mutateAsync();
      toast({
        title: "Sistema resetado com sucesso!",
        description: "Todos os dados transacionais foram removidos. Configurações preservadas.",
      });
      onOpenChange(false);
      setConfirmationChecked(false);
    } catch (error) {
      toast({
        title: "Erro ao resetar sistema",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const handleDialogChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setConfirmationChecked(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleDialogChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            🚨 RESET COMPLETO DO SISTEMA
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              <strong className="text-red-600">Esta ação irá EXCLUIR PERMANENTEMENTE:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Todo o estoque de milhas</li>
                <li>Todas as transações de milhas</li>
                <li>Todas as transações financeiras</li>
                <li>Todas as vendas e produtos</li>
                <li>Todos os parcelamentos</li>
                <li>Todo o histórico operacional</li>
              </ul>
            </div>
            
            <div>
              <strong className="text-green-600">Será PRESERVADO:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Programas de milhas (Azul, Latam, Smiles, TAP)</li>
                <li>Fornecedores cadastrados</li>
                <li>Configurações do sistema</li>
              </ul>
            </div>

            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <strong className="text-red-800">⚠️ ATENÇÃO:</strong>
              <p className="text-red-700 text-sm mt-1">
                Esta ação é <strong>IRREVERSÍVEL</strong> e afetará todo o histórico operacional. 
                O sistema ficará como se fosse uma instalação nova, mas com as configurações preservadas.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="confirm-reset" 
                checked={confirmationChecked}
                onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
              />
              <label 
                htmlFor="confirm-reset" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirmo que entendo que esta ação é irreversível e apagará todos os dados transacionais
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700"
            disabled={clearAllData.isPending || !confirmationChecked}
          >
            {clearAllData.isPending ? "Resetando Sistema..." : "RESETAR SISTEMA"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}