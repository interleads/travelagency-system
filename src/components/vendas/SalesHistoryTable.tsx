import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  MoreVertical 
} from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useDateRangeFilter } from "@/components/shared/useDateRangeFilter";
import { SaleDetailsExpanded } from "./SaleDetailsExpanded";
import { EditSaleDialog } from "./EditSaleDialog";
import { DeleteSaleDialog } from "./DeleteSaleDialog";

export function SalesHistoryTable() {
  const { dateRange } = useDateRangeFilter();
  const { data: sales = [], isLoading } = useSales(dateRange);
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  const [editingSale, setEditingSale] = useState<any>(null);
  const [deletingSale, setDeletingSale] = useState<any>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const toggleExpanded = (saleId: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    setExpandedSales(newExpanded);
  };

  const getProductsSummary = (products: any[] = []) => {
    if (products.length === 0) return "Nenhum produto";
    if (products.length === 1) return products[0].name;
    return `${products[0].name} (+${products.length - 1} outros)`;
  };

  const getSaleStatus = (sale: any) => {
    // TODO: Calculate based on installments status when available
    return "Ativo";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhuma venda registrada ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => {
                    const isExpanded = expandedSales.has(sale.id);
                    return (
                      <React.Fragment key={sale.id}>
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(sale.id)}
                              className="p-1 h-6 w-6"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatDate(sale.created_at)}
                          </TableCell>
                          <TableCell>{sale.client_name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {getProductsSummary(sale.sale_products)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sale.payment_method}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {getSaleStatus(sale)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(sale.total_amount))}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingSale(sale)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeletingSale(sale)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <SaleDetailsExpanded sale={sale} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingSale && (
        <EditSaleDialog
          sale={editingSale}
          open={!!editingSale}
          onOpenChange={(open) => !open && setEditingSale(null)}
        />
      )}

      {deletingSale && (
        <DeleteSaleDialog
          sale={deletingSale}
          open={!!deletingSale}
          onOpenChange={(open) => !open && setDeletingSale(null)}
        />
      )}
    </>
  );
}