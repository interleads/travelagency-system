
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

// Dados serão buscados do sistema de vendas e parcelas
const accountsReceivable: any[] = [];

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
            {accountsReceivable.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma conta a receber encontrada
                </TableCell>
              </TableRow>
            ) : (
              accountsReceivable.map((item, i) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
