
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCurrencyInput } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  type: z.enum(["receita", "despesa"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  subcategory: z.string().optional(),
  value: z.string().min(1, "Valor é obrigatório"),
});

interface TransactionFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  defaultValues?: {
    date?: string;
    description?: string;
    type?: "receita" | "despesa";
    category?: string;
    subcategory?: string;
    value?: number;
  };
}

export function TransactionForm({ onSubmit, defaultValues }: TransactionFormProps) {
  const valueInput = useCurrencyInput(defaultValues?.value || 0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      description: defaultValues?.description || "",
      type: defaultValues?.type || "receita",
      category: defaultValues?.category || "",
      subcategory: defaultValues?.subcategory || "",
      value: defaultValues?.value ? defaultValues.value.toString() : "",
    },
  });

  // Sincronizar quando defaultValues mudar
  React.useEffect(() => {
    valueInput.setValue(defaultValues?.value || 0);
  }, [defaultValues?.value]);

  const watchedType = form.watch('type');
  const watchedCategory = form.watch('category');

  const getCategories = (type: string) => {
    if (type === 'receita') {
      return [
        { value: 'Vendas', label: 'Vendas' },
        { value: 'Milhas', label: 'Milhas' },
        { value: 'Outros', label: 'Outros' }
      ];
    } else {
      return [
        { value: 'Raphael', label: 'Raphael' },
        { value: 'Talmo', label: 'Talmo' },
        { value: 'Trafego', label: 'Tráfego' },
        { value: 'Ferramentas', label: 'Ferramentas' },
        { value: 'Milhas', label: 'Milhas' },
        { value: 'Reserva', label: 'Reserva' },
        { value: 'Outros', label: 'Outros' }
      ];
    }
  };

  const getSubcategories = (category: string) => {
    if (category === 'Milhas') {
      return [
        { value: 'Compra', label: 'Compra' },
        { value: 'Venda', label: 'Venda' }
      ];
    }
    return [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 p-1">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="h-12 md:h-10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[80px] md:min-h-[60px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 md:h-10">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 md:h-10">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getCategories(watchedType).map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {getSubcategories(watchedCategory).length > 0 && (
          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base">Subcategoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 md:h-10">
                      <SelectValue placeholder="Selecione a subcategoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getSubcategories(watchedCategory).map((subcategory) => (
                      <SelectItem key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  value={valueInput.displayValue}
                  onChange={(e) => {
                    valueInput.handleChange(e);
                    field.onChange(valueInput.numericValue.toString());
                  }}
                  placeholder="R$ 0,00"
                  className="h-12 md:h-10 text-base md:text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 md:h-10 text-base md:text-sm">
          Salvar
        </Button>
      </form>
    </Form>
  );
}
