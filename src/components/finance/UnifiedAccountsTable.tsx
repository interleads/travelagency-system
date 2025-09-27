import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { MobileAccountCard } from "./MobileAccountCard";
import { useAccountsReceivable, useMarkAsReceived } from "@/hooks/useAccountsReceivable";
import { useAccountsPayable, useMarkAsPaid } from "@/hooks/useAccountsPayable";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search } from "lucide-react";
import { useDateRangeFilter } from "@/components/shared/useDateRangeFilter";
import { useIsMobile } from "@/hooks/use-mobile";

type AccountType = 'all' | 'receivable' | 'payable';
type StatusType = 'all' | 'pending' | 'paid';

export function UnifiedAccountsTable() {
  const { dateRange } = useDateRangeFilter();
  const isMobile = useIsMobile();
  const [accountType, setAccountType] = useState<AccountType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: receivables, isLoading: loadingReceivables } = useAccountsReceivable(dateRange);
  const { data: payables, isLoading: loadingPayables } = useAccountsPayable(dateRange);
  const { toast } = useToast();
  const markAsReceived = useMarkAsReceived();
  const markAsPaid = useMarkAsPaid();

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

  // Combine and transform data
  const getAllAccounts = () => {
    const accounts: any[] = [];
    
    if (accountType === 'all' || accountType === 'receivable') {
      receivables?.forEach(item => {
        accounts.push({
          ...item,
          type: 'receivable',
          party_name: item.client_name,
          description: item.description || `Parcela de venda - ${item.client_name}`,
        });
      });
    }
    
    if (accountType === 'all' || accountType === 'payable') {
      payables?.forEach(item => {
        accounts.push({
          ...item,
          type: 'payable',
          party_name: item.supplier_name,
          description: item.description || `Conta a pagar - ${item.supplier_name}`,
        });
      });
    }

    return accounts
      .filter(account => {
        if (statusFilter === 'pending') return account.status === 'pending';
        if (statusFilter === 'paid') return account.status === 'paid';
        return true;
      })
      .filter(account => 
        account.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  const isLoading = loadingReceivables || loadingPayables;
  const accounts = getAllAccounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Contas</CardTitle>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={accountType} onValueChange={(value: AccountType) => setAccountType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                <SelectItem value="receivable">Contas a Receber</SelectItem>
                <SelectItem value="payable">Contas a Pagar</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value: StatusType) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagas/Recebidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, fornecedor ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile view with cards
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    Nenhuma conta encontrada
                  </div>
                </CardContent>
              </Card>
            ) : (
              accounts.map((account) => (
                <MobileAccountCard
                  key={`${account.type}-${account.id}`}
                  account={account}
                  onMarkAsReceived={handleMarkAsReceived}
                  onMarkAsPaid={handleMarkAsPaid}
                  disabled={markAsReceived.isPending || markAsPaid.isPending}
                />
              ))
            )}
          </div>
        ) : (
          // Desktop table view
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Venc.</TableHead>
                <TableHead>Cliente/Fornecedor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma conta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={`${account.type}-${account.id}`}>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        account.type === 'receivable' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {account.type === 'receivable' ? 'Receber' : 'Pagar'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{account.party_name}</TableCell>
                    <TableCell>{account.description}</TableCell>
                    <TableCell>
                      <PaymentStatusButton
                        status={account.status}
                        onMarkAsReceived={account.type === 'receivable' ? 
                          () => handleMarkAsReceived(account.id, account.amount) : undefined}
                        onMarkAsPaid={account.type === 'payable' ? 
                          () => handleMarkAsPaid(account.id, account.amount) : undefined}
                        disabled={markAsReceived.isPending || markAsPaid.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}