
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

const formSchema = z.object({
  saleDate: z.string().min(1, "Data de venda é obrigatória"),
  passengerName: z.string().min(2, "Nome do passageiro deve ter no mínimo 2 caracteres"),
  route: z.string().min(3, "Trecho deve ter no mínimo 3 caracteres"),
  travelDate: z.string().min(1, "Data da viagem é obrigatória"),
  airline: z.string().min(1, "Companhia é obrigatória"),
  supplierAccount: z.string().min(1, "Conta usada é obrigatória"),
  txPix: z.string().min(1, "TX+PIX é obrigatório"),
  cardTx: z.string().min(1, "Cartão TX é obrigatório"),
  cost: z.string().min(1, "Custo é obrigatório"),
  status: z.enum(["PAGO", "PENDENTE", "CANCELADO"]),
  profit: z.number().optional(),
});

interface TicketFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const suppliers = [
  "Conta Azul - João",
  "Conta SMILES - Ana",
  "Conta TudoAzul - Carlos",
  "Conta Livelo - Maria",
  "Conta Multiplus - Pedro"
];

const airlines = [
  "LATAM",
  "GOL",
  "Azul",
  "Air France",
  "TAP",
  "Emirates",
  "American Airlines",
  "United",
  "Delta"
];

export function TicketForm({ onSubmit }: TicketFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      saleDate: new Date().toISOString().split('T')[0],
      passengerName: "",
      route: "",
      travelDate: "",
      airline: "",
      supplierAccount: "",
      txPix: "",
      cardTx: "",
      cost: "",
      status: "PENDENTE",
    },
  });

  const watchedTxPix = form.watch('txPix');
  const watchedCardTx = form.watch('cardTx');
  const watchedCost = form.watch('cost');

  // Cálculo automático do lucro
  const calculateProfit = () => {
    const txPix = parseFloat(watchedTxPix) || 0;
    const cardTx = parseFloat(watchedCardTx) || 0;
    const cost = parseFloat(watchedCost) || 0;
    return (txPix + cardTx) - cost;
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const profit = calculateProfit();
    onSubmit({
      ...data,
      profit: profit
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="saleDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Venda</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passengerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Passageiro</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trecho</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: São Paulo - Miami" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="travelDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da Viagem</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="airline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Companhia Aérea</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a companhia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {airlines.map((airline) => (
                      <SelectItem key={airline} value={airline}>
                        {airline}
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
            name="supplierAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta Usada</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
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
            name="txPix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TX + PIX (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardTx"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cartão TX (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PAGO">PAGO</SelectItem>
                    <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                    <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preview do lucro calculado */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Lucro Calculado:</span>
            <span className={`text-lg font-bold ${calculateProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {calculateProfit().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Salvar Passagem
        </Button>
      </form>
    </Form>
  );
}
