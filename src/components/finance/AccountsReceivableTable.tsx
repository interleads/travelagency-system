
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

const accountsReceivable = [
  {
    date: "30/04/2025",
    client: "João Silva",
    description: "Pacote Paris - 2ª Parcela",
    status: "Pendente",
    value: "R$ 2.500,00"
  },
  {
    date: "05/05/2025",
    client: "Maria Santos",
    description: "Pacote Orlando - 3ª Parcela",
    status: "Pendente",
    value: "R$ 1.890,00"
  },
  {
    date: "10/05/2025",
    client: "Pedro Alves",
    description: "Pacote Cancún - Entrada",
    status: "Agendado",
    value: "R$ 3.250,00"
  }
];

export function AccountsReceivableTable() {
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
            {accountsReceivable.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.client}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === "Pendente" 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
