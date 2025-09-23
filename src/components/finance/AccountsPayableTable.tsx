
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { useAccountsPayable, useMarkAsPaid } from "@/hooks/useAccountsPayable";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AccountsPayableTable() {
  const { data: payables, isLoading } = useAccountsPayable();
  const { toast } = useToast();
  const markAsPaid = useMarkAsPaid();

  const handleMarkAsPaid = async (payableId: string, amount: number) => {
    try {
      await markAsPaid.mutateAsync({ payableId, amount });
      toast({
        title: "Conta marcada como paga!",
        description: `Valor de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado`,
      });
    } catch (error) {
      toast({
        title: "Erro ao marcar como paga",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Pagar</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Venc.</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : payables?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma conta a pagar encontrada
                </TableCell>
              </TableRow>
            ) : (
              payables?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(parseISO(item.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{item.supplier_name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <PaymentStatusButton
                      status={item.status}
                      onMarkAsPaid={() => handleMarkAsPaid(item.id, item.amount)}
                      disabled={markAsPaid.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
