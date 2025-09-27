import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { TransactionActions } from './TransactionActions';
import { MobileTransactionCard } from './MobileTransactionCard';
import { useDateRangeFilter } from "@/components/shared/useDateRangeFilter";
import { useIsMobile } from "@/hooks/use-mobile";

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

export function CashFlowTableReal() {
  const { dateRange } = useDateRangeFilter();
  const { data: transactions = [], isLoading } = useTransactions(dateRange);
  const isMobile = useIsMobile();

  const totalEntradas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  const totalSaidas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);
  const currentBalance = totalEntradas - totalSaidas;

  if (isLoading) {
    return <div className="text-center py-8">Carregando transações...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-2xl font-bold text-sky-600">
              R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">Total Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-2xl font-bold text-emerald-600">
              R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">Total Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-2xl font-bold text-red-600">
              R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-2xl font-bold text-blue-600">
              R$ {(totalEntradas - totalSaidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards ou Desktop Table */}
      {isMobile ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Histórico de Transações</h3>
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </div>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <MobileTransactionCard key={transaction.id} transaction={transaction as Transaction} />
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Fluxo de Caixa</CardTitle>
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
                {transactions.map((transaction) => (
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
            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}