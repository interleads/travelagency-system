
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
import { useAccountsReceivable, useMarkAsReceived } from "@/hooks/useAccountsReceivable";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AccountsReceivableTable() {
  const { data: receivables, isLoading } = useAccountsReceivable();
  const { toast } = useToast();
  const markAsReceived = useMarkAsReceived();

  const handleMarkAsReceived = async (receivableId: string, amount: number) => {
    try {
      await markAsReceived.mutateAsync({ receivableId, amount });
      toast({
        title: "Parcela marcada como recebida!",
        description: `Valor de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado`,
      });
    } catch (error) {
      toast({
        title: "Erro ao marcar como recebida",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Receber</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Venc.</TableHead>
              <TableHead>Cliente</TableHead>
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
            ) : receivables?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma conta a receber encontrada
                </TableCell>
              </TableRow>
            ) : (
              receivables?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(parseISO(item.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{item.client_name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <PaymentStatusButton
                      status={item.status}
                      onMarkAsReceived={() => handleMarkAsReceived(item.id, item.amount)}
                      disabled={markAsReceived.isPending}
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
