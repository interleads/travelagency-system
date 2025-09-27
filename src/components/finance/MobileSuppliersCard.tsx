import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";

interface MobileSuppliersCardProps {
  supplier: any;
  onEdit: (supplier: any) => void;
  onDelete: (supplier: any) => void;
  onViewHistory: (supplierId: string) => void;
}

export function MobileSuppliersCard({ supplier, onEdit, onDelete, onViewHistory }: MobileSuppliersCardProps) {
  const getStatusColor = (status: string) => {
    return status === 'Ativo' 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{supplier.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewHistory(supplier.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(supplier)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Contato</p>
            <p className="font-semibold">{supplier.contact}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Tipo de Conta</p>
            <p>{supplier.account_type}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Programa</p>
            <Badge variant="outline" className="mt-1">{supplier.program}</Badge>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)} mt-1`}>
              {supplier.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Último Uso</p>
            <p>{supplier.last_used ? new Date(supplier.last_used).toLocaleDateString('pt-BR') : 'Nunca'}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Observações</p>
            <p className="text-xs truncate">{supplier.notes || '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}