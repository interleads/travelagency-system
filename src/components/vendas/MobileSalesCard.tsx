import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Eye, Calendar, DollarSign, User, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MobileSalesCardProps {
  sale: {
    id: string;
    client_name: string;
    destination: string;
    travel_date: string;
    total_amount: number;
    status?: string;
    created_at: string;
  };
  onEdit?: (sale: any) => void;
  onDelete?: (sale: any) => void;
  onView?: (sale: any) => void;
}

export function MobileSalesCard({ sale, onEdit, onDelete, onView }: MobileSalesCardProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-primary shrink-0" />
              <h3 className="font-medium text-foreground truncate">{sale.client_name}</h3>
            </div>
            {sale.status && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(sale.status)}`}
              >
                {sale.status}
              </Badge>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(sale)}>
                  <Eye size={16} className="mr-2" />
                  Visualizar
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(sale)}>
                  <Edit size={16} className="mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(sale)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Destino */}
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Destino:</span>
            <span className="text-sm font-medium text-foreground truncate">{sale.destination}</span>
          </div>
          
          {/* Data da Viagem */}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Viagem:</span>
            <span className="text-sm font-medium text-foreground">{formatDate(sale.travel_date)}</span>
          </div>
          
          {/* Valor */}
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Valor:</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(sale.total_amount)}</span>
          </div>
          
          {/* Data de Criação */}
          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Criado em {formatDate(sale.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}