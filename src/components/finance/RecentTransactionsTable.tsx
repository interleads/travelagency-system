
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

const recentTransactions = [
  {
    date: "25/04/2025",
    description: "Venda - Pacote Maldivas",
    type: "Receita",
    value: "R$ 12.350,00"
  },
  {
    date: "23/04/2025",
    description: "Pagamento de Fornecedor - Hotel",
    type: "Despesa",
    value: "R$ 5.820,00"
  },
  {
    date: "20/04/2025",
    description: "Venda - Pacote Orlando",
    type: "Receita",
    value: "R$ 8.740,00"
  }
];

export function RecentTransactionsTable() {
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
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.type === "Receita" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {item.type}
                  </span>
                </TableCell>
                <TableCell className={`text-right ${
                  item.type === "Receita" ? "text-emerald-600" : "text-red-600"
                }`}>
                  {item.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
