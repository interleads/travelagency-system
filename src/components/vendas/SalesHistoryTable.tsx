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
import { useInstallments, useCreateInstallments } from "@/hooks/useInstallments";
import { SaleDetailsExpanded } from "./SaleDetailsExpanded";
import { FullSaleEditDialog } from "./FullSaleEditDialog";
import { DeleteSaleDialog } from "./DeleteSaleDialog";
import { MobileSalesCard } from "./MobileSalesCard";
import { MobileSaleDetailsModal } from "./MobileSaleDetailsModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

// Component for individual sale row
function SaleRow({ 
  sale, 
  isExpanded, 
  onToggleExpanded, 
  onEdit, 
  onDelete, 
  formatCurrency, 
  formatDate,
  getProductTypesSummary,
  getSalePaymentStatus,
  getStatusLabel
}: {
  sale: any;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  getProductTypesSummary: (products: any[]) => JSX.Element;
  getSalePaymentStatus: (sale: any, installments: any[]) => string;
  getStatusLabel: (status: string) => string;
}) {
  const { data: installments = [] } = useInstallments(sale.id);
  const paymentStatus = getSalePaymentStatus(sale, installments);

  return (
    <>
      <TableRow className="hover:bg-muted/30">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="p-1 h-6 w-6"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="text-center font-medium">
          {formatDate(sale.sale_date || sale.created_at)}
        </TableCell>
        <TableCell className="text-center">{sale.client_name}</TableCell>
        <TableCell className="text-center max-w-[200px]">
          {getProductTypesSummary(sale.sale_products)}
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="outline">{sale.payment_method}</Badge>
        </TableCell>
        <TableCell className="text-center">
          <Badge 
            variant="secondary"
            className={(() => {
              const statusClassMap = {
                'pendente': 'bg-status-pendente text-status-pendente-foreground border-0',
                'andamento': 'bg-status-andamento text-status-andamento-foreground border-0',
                'concluido': 'bg-status-concluido text-status-concluido-foreground border-0'
              };
              return statusClassMap[paymentStatus] || statusClassMap['pendente'];
            })()}
          >
            {getStatusLabel(paymentStatus)}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(Number(sale.total_amount))}
        </TableCell>
        <TableCell className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
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
    </>
  );
}

interface SalesHistoryTableProps {
  searchFilter?: string;
  periodFilter?: string;
  yearFilter?: string;
  statusFilter?: string;
}

export function SalesHistoryTable({ 
  searchFilter = "", 
  periodFilter = "", 
  yearFilter = "", 
  statusFilter = "" 
}: SalesHistoryTableProps = {}) {
  const { dateRange } = useDateRangeFilter();
  const { data: allSales = [], isLoading } = useSales(dateRange);
  const isMobile = useIsMobile();
  
  // Aplicar filtros
  const filteredSales = React.useMemo(() => {
    let filtered = [...allSales];
    
    // Filtro de busca por cliente
    if (searchFilter) {
      filtered = filtered.filter(sale => 
        sale.client_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        sale.sale_products?.some((product: any) => 
          product.origin?.toLowerCase().includes(searchFilter.toLowerCase()) ||
          product.destination?.toLowerCase().includes(searchFilter.toLowerCase()) ||
          product.details?.toLowerCase().includes(searchFilter.toLowerCase())
        )
      );
    }
    
    // Filtro de ano
    if (yearFilter && yearFilter !== "todos") {
      filtered = filtered.filter(sale => {
        const saleYear = new Date(sale.sale_date || sale.created_at).getFullYear().toString();
        return saleYear === yearFilter;
      });
    }
    
    // Filtro de status
    if (statusFilter && statusFilter !== "todos") {
      // Aqui você pode implementar a lógica de filtro por status baseada nos installments
      // Por enquanto, vou deixar comentado para não quebrar
      // const { data: installments = [] } = useInstallments(sale.id);
      // const paymentStatus = getSalePaymentStatus(sale, installments);
      // return paymentStatus === statusFilter;
    }
    
    return filtered;
  }, [allSales, searchFilter, periodFilter, yearFilter, statusFilter]);
  
  const sales = filteredSales;
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  const [editingSale, setEditingSale] = useState<any>(null);
  const [deletingSale, setDeletingSale] = useState<any>(null);
  const [viewingSale, setViewingSale] = useState<any>(null);
  const createInstallments = useCreateInstallments();

  // Optimized backfill installments for existing sales
  const [processedSales, setProcessedSales] = React.useState<Set<string>>(new Set());
  
  React.useEffect(() => {
    if (sales.length === 0) return;
    
    const backfillInstallments = async () => {
      const unprocessedSales = sales.filter(sale => !processedSales.has(sale.id));
      if (unprocessedSales.length === 0) return;
      
      for (const sale of unprocessedSales) {
        try {
          const { count, error } = await supabase
            .from("sale_installments")
            .select("*", { count: 'exact', head: true })
            .eq("sale_id", sale.id);
            
          if (error) continue;
          
          if (count === 0) {
            const baseDate = sale.sale_date ? new Date(sale.sale_date) : new Date(sale.created_at);
            await createInstallments.mutateAsync({
              saleId: sale.id,
              installments: sale.installments || 1,
              totalAmount: Number(sale.total_amount),
              firstDueDate: baseDate
            });
          }
          
          setProcessedSales(prev => new Set(prev).add(sale.id));
        } catch (error) {
          // Silently continue on errors to avoid blocking UI
        }
      }
    };

    backfillInstallments();
  }, [sales, createInstallments]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const getProductTypeLabel = (type: string) => {
    const labels = {
      'passagem': 'Passagem',
      'hotel': 'Hotel',
      'veiculo': 'Veículo',
      'seguro': 'Seguro',
      'transfer': 'Transfer',
      'passeios': 'Passeios',
      'outros': 'Outros'
    };
    return labels[type] || labels['outros'];
  };

  const getProductTypesSummary = (products: any[] = []) => {
    if (products.length === 0) return <span className="text-muted-foreground">Nenhum produto</span>;
    
    const types = [...new Set(products.map(p => p.type))];
    
    // Static class mappings for Tailwind JIT
    const productClassMap = {
      'passagem': 'bg-product-passagem text-product-passagem-foreground border-0',
      'hotel': 'bg-product-hotel text-product-hotel-foreground border-0',
      'veiculo': 'bg-product-veiculo text-product-veiculo-foreground border-0',
      'seguro': 'bg-product-seguro text-product-seguro-foreground border-0',
      'transfer': 'bg-product-transfer text-product-transfer-foreground border-0',
      'passeios': 'bg-product-passeios text-product-passeios-foreground border-0',
      'outros': 'bg-product-outros text-product-outros-foreground border-0'
    };
    
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {types.slice(0, 2).map(type => (
          <Badge 
            key={type} 
            variant="secondary"
            className={productClassMap[type] || productClassMap['outros']}
          >
            {getProductTypeLabel(type)}
          </Badge>
        ))}
        {types.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{types.length - 2}
          </Badge>
        )}
      </div>
    );
  };

  const getSalePaymentStatus = (sale: any, installments: any[] = []) => {
    if (installments.length === 0) return 'pendente';
    
    const paidCount = installments.filter(i => i.status === 'paid').length;
    const totalCount = installments.length;
    
    if (paidCount === 0) return 'pendente';
    if (paidCount === totalCount) return 'concluido';
    return 'andamento';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pendente': 'Pendente',
      'andamento': 'Andamento', 
      'concluido': 'Concluído'
    };
    return labels[status] || labels['pendente'];
  };

  const toggleExpanded = (saleId: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    setExpandedSales(newExpanded);
  };


  if (isLoading) {
    return (
      <Card>
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
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="space-y-4">
          {sales.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nenhuma venda registrada ainda</p>
              </CardContent>
            </Card>
          ) : (
            sales.map((sale) => (
              <MobileSalesCard
                key={sale.id}
                sale={{
                  ...sale,
                  destination: sale.sale_products?.[0]?.destination || 'N/A',
                  travel_date: sale.sale_products?.[0]?.departure_date || sale.sale_date || sale.created_at,
                }}
                onEdit={() => setEditingSale(sale)}
                onDelete={() => setDeletingSale(sale)}
                onView={() => setViewingSale(sale)}
              />
            ))
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <Card>
          <CardContent>
            <div className="space-y-0 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-center">Data</TableHead>
                    <TableHead className="text-center">Cliente</TableHead>
                    <TableHead className="text-center">Produtos</TableHead>
                    <TableHead className="text-center">Pagamento</TableHead>
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
                        <SaleRow
                          key={sale.id}
                          sale={sale}
                          isExpanded={isExpanded}
                          onToggleExpanded={() => toggleExpanded(sale.id)}
                          onEdit={() => setEditingSale(sale)}
                          onDelete={() => setDeletingSale(sale)}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          getProductTypesSummary={getProductTypesSummary}
                          getSalePaymentStatus={getSalePaymentStatus}
                          getStatusLabel={getStatusLabel}
                        />
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {editingSale && (
        <FullSaleEditDialog
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

      {/* Modal de detalhes para mobile */}
      <MobileSaleDetailsModal
        sale={viewingSale}
        open={!!viewingSale}
        onOpenChange={(open) => !open && setViewingSale(null)}
      />
    </>
  );
}