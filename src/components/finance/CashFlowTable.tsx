
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

interface CashFlowTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory?: string;
  value: number;
  type: 'entrada' | 'saida';
  balance: number;
}

const mockCashFlowData: CashFlowTransaction[] = [
  {
    id: '1',
    date: '2025-01-15',
    description: 'Venda - Pacote Orlando Premium',
    category: 'Vendas',
    value: 15000,
    type: 'entrada',
    balance: 98500
  },
  {
    id: '2',
    date: '2025-01-14',
    description: 'Retirada Raphael',
    category: 'Raphael',
    value: 8000,
    type: 'saida',
    balance: 83500
  },
  {
    id: '3',
    date: '2025-01-14',
    description: 'Retirada Talmo',
    category: 'Talmo',
    value: 8000,
    type: 'saida',
    balance: 91500
  },
  {
    id: '4',
    date: '2025-01-13',
    description: 'Investimento em Milhas - Azul',
    category: 'Milhas',
    subcategory: 'Compra',
    value: 25000,
    type: 'saida',
    balance: 99500
  },
  {
    id: '5',
    date: '2025-01-12',
    description: 'Venda de Milhas - Cliente Premium',
    category: 'Milhas',
    subcategory: 'Venda',
    value: 18000,
    type: 'entrada',
    balance: 124500
  },
  {
    id: '6',
    date: '2025-01-12',
    description: 'Trafego Pago - Google Ads',
    category: 'Trafego',
    value: 3500,
    type: 'saida',
    balance: 106500
  },
  {
    id: '7',
    date: '2025-01-11',
    description: 'Assinatura Ferramentas - CRM',
    category: 'Ferramentas',
    value: 800,
    type: 'saida',
    balance: 110000
  },
  {
    id: '8',
    date: '2025-01-10',
    description: 'Venda - Pacote Europa',
    category: 'Vendas',
    value: 22000,
    type: 'entrada',
    balance: 110800
  },
  {
    id: '9',
    date: '2025-01-09',
    description: 'Reserva Emergencial',
    category: 'Reserva',
    value: 10000,
    type: 'saida',
    balance: 88800
  },
  {
    id: '10',
    date: '2025-01-08',
    description: 'Outros Gastos - Contador',
    category: 'Outros',
    value: 1200,
    type: 'saida',
    balance: 98800
  }
];

const getCategoryColor = (category: string, subcategory?: string) => {
  switch (category) {
    case 'Vendas':
      return 'text-emerald-600 bg-emerald-50';
    case 'Milhas':
      if (subcategory === 'Compra') return 'text-red-600 bg-red-50';
      if (subcategory === 'Venda') return 'text-gray-600 bg-gray-50';
      return 'text-red-600 bg-red-50';
    case 'Raphael':
      return 'text-blue-600 bg-blue-50';
    case 'Talmo':
      return 'text-purple-600 bg-purple-50';
    case 'Trafego':
      return 'text-orange-600 bg-orange-50';
    case 'Ferramentas':
      return 'text-indigo-600 bg-indigo-50';
    case 'Reserva':
      return 'text-yellow-600 bg-yellow-50';
    case 'Outros':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function CashFlowTable() {
  const currentBalance = mockCashFlowData[0]?.balance || 0;
  const totalEntradas = mockCashFlowData
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.value, 0);
  const totalSaidas = mockCashFlowData
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-sky-600">
              R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              R$ {(totalEntradas - totalSaidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Fluxo de Caixa */}
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
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCashFlowData.map((transaction) => (
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
                    transaction.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? '+' : '-'}R$ {transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    R$ {transaction.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
