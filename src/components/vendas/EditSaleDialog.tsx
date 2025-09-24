import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sale, useUpdateSale } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

interface EditSaleDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSaleDialog({ sale, open, onOpenChange }: EditSaleDialogProps) {
  const { toast } = useToast();
  const updateSale = useUpdateSale();
  
  const [formData, setFormData] = useState({
    client_name: sale.client_name,
    payment_method: sale.payment_method,
    total_amount: sale.total_amount,
    installments: sale.installments,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSale.mutateAsync({
        id: sale.id,
        ...formData
      });
      
      toast({
        title: "Venda atualizada com sucesso!",
        description: `Venda de ${formData.client_name} foi atualizada.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar venda",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Cliente</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pagamento</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                max="12"
                value={formData.installments}
                onChange={(e) => setFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateSale.isPending}
            >
              {updateSale.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}