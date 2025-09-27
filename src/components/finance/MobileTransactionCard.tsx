import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionActions } from './TransactionActions';
import { Transaction } from '@/hooks/useTransactions';

interface MobileTransactionCardProps {
  transaction: Transaction;
}

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

export function MobileTransactionCard({ transaction }: MobileTransactionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {new Date(transaction.date).toLocaleDateString('pt-BR')}
          </CardTitle>
          <div className={`text-sm font-bold ${
            transaction.type === 'receita' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {transaction.type === 'receita' ? '+' : '-'}R$ {transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-muted-foreground text-sm">Descrição</p>
          <p className="text-sm">{transaction.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-muted-foreground text-sm">Categoria</p>
            <Badge 
              variant="secondary" 
              className={`text-xs mt-1 ${getCategoryColor(transaction.category, transaction.subcategory)}`}
            >
              {transaction.category}
              {transaction.subcategory && ` - ${transaction.subcategory}`}
            </Badge>
          </div>
          
          <TransactionActions transaction={transaction} />
        </div>
      </CardContent>
    </Card>
  );
}