
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

const accountsPayable = [
  {
    date: "28/04/2025",
    supplier: "Hotel Majestic",
    description: "Hospedagem - Grupo Maio",
    status: "Pendente",
    value: "R$ 12.800,00"
  },
  {
    date: "01/05/2025",
    supplier: "Cia Aérea Nacional",
    description: "Passagens - Lote 157",
    status: "Agendado",
    value: "R$ 18.450,00"
  },
  {
    date: "05/05/2025",
    supplier: "Seguradora Travel",
    description: "Seguros - Abril/2025",
    status: "Pendente",
    value: "R$ 3.890,00"
  }
];

export function AccountsPayableTable() {
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
            {accountsPayable.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.supplier}</TableCell>
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
