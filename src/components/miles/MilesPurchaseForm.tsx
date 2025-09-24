import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCurrencyInput, useQuantityInput } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMilesPrograms, useAddMilesPurchase } from '@/hooks/useMilesInventory';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  program_id: z.string().min(1, "Programa é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  cost_per_thousand: z.number().min(0.01, "Custo deve ser maior que 0"),
  purchase_date: z.string().min(1, "Data é obrigatória"),
});

interface MilesPurchaseFormProps {
  onSubmit: (data: any) => void;
}

export function MilesPurchaseForm({ onSubmit }: MilesPurchaseFormProps) {
  const { toast } = useToast();
  const { data: programs = [] } = useMilesPrograms();
  const addPurchase = useAddMilesPurchase();

  // Hooks de formatação
  const quantityInput = useQuantityInput(0);
  const costInput = useCurrencyInput(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      program_id: "",
      quantity: 0,
      cost_per_thousand: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    },
  });

  const purchaseValue = (quantityInput.numericValue / 1000) * costInput.numericValue;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const finalValues = {
        ...values,
        quantity: quantityInput.numericValue,
        cost_per_thousand: costInput.numericValue,
      };
      await addPurchase.mutateAsync(finalValues as any);
      toast({
        title: "Compra registrada com sucesso!",
        description: `${quantityInput.numericValue.toLocaleString()} milhas - R$ ${purchaseValue.toFixed(2)}`,
      });
      onSubmit({ ...finalValues, purchase_value: purchaseValue });
    } catch (error) {
      toast({
        title: "Erro ao registrar compra",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programa de Milhas</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Milhas</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  value={quantityInput.displayValue}
                  onChange={(e) => {
                    quantityInput.handleChange(e);
                    field.onChange(quantityInput.numericValue);
                  }}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost_per_thousand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custo por Mil Milhas (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  value={costInput.displayValue}
                  onChange={(e) => {
                    costInput.handleChange(e);
                    field.onChange(costInput.numericValue);
                  }}
                  placeholder="R$ 0,00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da Compra</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {quantityInput.numericValue > 0 && costInput.numericValue > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Valor Total da Compra</Label>
            <div className="text-xl font-bold text-primary">
              R$ {purchaseValue.toFixed(2)}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={addPurchase.isPending}>
          {addPurchase.isPending ? "Salvando..." : "Registrar Compra"}
        </Button>
      </form>
    </Form>
  );
}