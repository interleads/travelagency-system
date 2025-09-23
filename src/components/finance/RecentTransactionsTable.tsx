
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
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { TransactionActions } from './TransactionActions';
import { Skeleton } from "@/components/ui/skeleton";

const getCategoryColor = (category: string, subcategory?: string) => {
  switch (category) {
    case 'Vendas':
      return 'text-emerald-600 bg-emerald-50';
    case 'Milhas':
      if (subcategory === 'Compra') return 'text-red-600 bg-red-50';
      if (subcategory === 'Venda') return 'text-gray-600 bg-gray-50';
      return 'text-red-600 bg-red-50';
    case 'Retiradas Sócios':
      return 'text-blue-600 bg-blue-50';
    case 'Trafego':
      return 'text-orange-600 bg-orange-50';
    case 'Ferramentas':
      return 'text-indigo-600 bg-indigo-50';
    case 'Outros':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function RecentTransactionsTable() {
  const { data: transactions = [], isLoading } = useTransactions();
  
  // Get last 10 transactions
  const recentTransactions = transactions.slice(0, 10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(transaction.category, transaction.subcategory)}`}>
                    {transaction.category}
                    {transaction.subcategory && ` - ${transaction.subcategory}`}
                  </span>
                </TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.type === 'receita' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'receita' ? '+' : '-'}R$ {transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <TransactionActions transaction={transaction as Transaction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {recentTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
