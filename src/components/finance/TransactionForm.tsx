
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
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
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
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
                <FormLabel>Subcategoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Salvar
        </Button>
      </form>
    </Form>
  );
}
