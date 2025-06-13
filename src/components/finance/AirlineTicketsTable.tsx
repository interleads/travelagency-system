
import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TicketForm } from './TicketForm';
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  saleDate: string;
  passengerName: string;
  route: string;
  travelDate: string;
  airline: string;
  supplierAccount: string;
  txPix: number;
  cardTx: number;
  cost: number;
  profit: number;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    saleDate: '2025-01-10',
    passengerName: 'João Silva',
    route: 'São Paulo - Miami',
    travelDate: '2025-02-15',
    airline: 'LATAM',
    supplierAccount: 'Conta Azul - João',
    txPix: 150,
    cardTx: 80,
    cost: 4500,
    profit: 1270,
    status: 'PAGO'
  },
  {
    id: '2',
    saleDate: '2025-01-08',
    passengerName: 'Maria Santos',
    route: 'Rio de Janeiro - Paris',
    travelDate: '2025-03-20',
    airline: 'Air France',
    supplierAccount: 'Conta SMILES - Ana',
    txPix: 200,
    cardTx: 120,
    cost: 6800,
    profit: 2080,
    status: 'PENDENTE'
  },
  {
    id: '3',
    saleDate: '2025-01-05',
    passengerName: 'Pedro Oliveira',
    route: 'São Paulo - Lisboa',
    travelDate: '2025-02-28',
    airline: 'TAP',
    supplierAccount: 'Conta TudoAzul - Carlos',
    txPix: 180,
    cardTx: 95,
    cost: 3200,
    profit: 1525,
    status: 'PAGO'
  }
];

export function AirlineTicketsTable() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tickets] = useState<Ticket[]>(mockTickets);

  const handleTicketSubmit = (data: any) => {
    console.log('Nova passagem:', data);
    toast({
      title: "Passagem registrada com sucesso!",
      description: `Passagem para ${data.passengerName} - ${data.route}`,
    });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-emerald-100 text-emerald-800';
      case 'PENDENTE':
        return 'bg-amber-100 text-amber-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSales = tickets.reduce((sum, ticket) => sum + ticket.txPix + ticket.cardTx, 0);
  const totalCosts = tickets.reduce((sum, ticket) => sum + ticket.cost, 0);
  const totalProfit = tickets.reduce((sum, ticket) => sum + ticket.profit, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">R$ {totalSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">R$ {totalCosts.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">R$ {totalProfit.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passagens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{tickets.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Header com botão */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Controle de Passagens</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Passagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Passagem</DialogTitle>
            </DialogHeader>
            <TicketForm onSubmit={handleTicketSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Venda</TableHead>
                <TableHead>Passageiro</TableHead>
                <TableHead>Trecho</TableHead>
                <TableHead>Data Viagem</TableHead>
                <TableHead>Companhia</TableHead>
                <TableHead>Conta Usada</TableHead>
                <TableHead className="text-right">TX+PIX</TableHead>
                <TableHead className="text-right">Cartão TX</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{new Date(ticket.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{ticket.passengerName}</TableCell>
                  <TableCell>{ticket.route}</TableCell>
                  <TableCell>{new Date(ticket.travelDate).toLocaleDateString()}</TableCell>
                  <TableCell>{ticket.airline}</TableCell>
                  <TableCell>{ticket.supplierAccount}</TableCell>
                  <TableCell className="text-right">R$ {ticket.txPix.toLocaleString()}</TableCell>
                  <TableCell className="text-right">R$ {ticket.cardTx.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">R$ {ticket.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">R$ {ticket.profit.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
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
