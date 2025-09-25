import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { MilesInventory, useUpdateMilesInventory } from '@/hooks/useMilesInventory';
import { useToast } from "@/hooks/use-toast";

interface EditMilesDialogProps {
  item: MilesInventory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  quantity: number;
  cost_per_thousand: number;
  purchase_date: string;
}

export function EditMilesDialog({ 
  item, 
  open, 
  onOpenChange 
}: EditMilesDialogProps) {
  const { toast } = useToast();
  const updateMiles = useUpdateMilesInventory();
  
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      quantity: item.quantity,
      cost_per_thousand: item.cost_per_thousand,
      purchase_date: item.purchase_date.split('T')[0],
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const purchase_value = (data.quantity / 1000) * data.cost_per_thousand;
      const remaining_quantity = data.quantity - (item.quantity - item.remaining_quantity);
      
      await updateMiles.mutateAsync({ 
        id: item.id, 
        quantity: data.quantity,
        cost_per_thousand: data.cost_per_thousand,
        purchase_date: data.purchase_date,
        purchase_value,
        remaining_quantity: Math.max(0, remaining_quantity),
      });
      
      toast({
        title: "Entrada de milhas atualizada com sucesso!",
        description: `${data.quantity.toLocaleString()} milhas - R$ ${data.cost_per_thousand.toFixed(2)}/mil`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar entrada de milhas",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Entrada de Milhas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantidade de Milhas</Label>
            <Input
              id="quantity"
              type="number"
              {...register("quantity", { required: true, min: 1 })}
            />
          </div>
          <div>
            <Label htmlFor="cost_per_thousand">Custo por Mil</Label>
            <Input
              id="cost_per_thousand"
              type="number"
              step="0.01"
              {...register("cost_per_thousand", { required: true, min: 0.01 })}
            />
          </div>
          <div>
            <Label htmlFor="purchase_date">Data de Compra</Label>
            <Input
              id="purchase_date"
              type="date"
              {...register("purchase_date", { required: true })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMiles.isPending}>
              {updateMiles.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}