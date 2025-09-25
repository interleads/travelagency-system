import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useSupplierPurchaseHistory, useSupplierStats } from '@/hooks/useSupplierPurchaseHistory';

interface SupplierDetailsExpandedProps {
  supplierId: string;
  supplierName: string;
}

export function SupplierDetailsExpanded({ supplierId, supplierName }: SupplierDetailsExpandedProps) {
  const { data: purchases = [], isLoading: loadingPurchases } = useSupplierPurchaseHistory(supplierId);
  const { data: stats, isLoading: loadingStats } = useSupplierStats(supplierId);

  if (loadingPurchases || loadingStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-100 text-emerald-800';
      case 'Esgotado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Histórico de Compras - {supplierName}
        </h3>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Total de Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.totalPurchases || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Valor Total Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats?.totalValue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Custo Médio/Mil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats?.averageCostPerThousand || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Programa Favorito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-purple-600 truncate">
                {stats?.mostUsedProgram || 'Nenhum'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico Detalhado de Compras</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {purchases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma compra registrada para este fornecedor</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data da Compra</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Custo/Mil</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {purchase.programs?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(purchase.quantity)} milhas
                    </TableCell>
                    <TableCell>
                      {formatCurrency(purchase.purchase_value)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(purchase.cost_per_thousand)}
                    </TableCell>
                    <TableCell>
                      <span className={purchase.remaining_quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {formatNumber(purchase.remaining_quantity)} milhas
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                        {purchase.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}