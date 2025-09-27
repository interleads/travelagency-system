import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileAccountsPayableCardProps {
  item: {
    id: string;
    due_date: string;
    supplier_name: string;
    description: string;
    status: string;
    amount: number;
  };
  onMarkAsPaid: () => void;
  disabled: boolean;
}

export function MobileAccountsPayableCard({ 
  item, 
  onMarkAsPaid, 
  disabled 
}: MobileAccountsPayableCardProps) {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-sm">{item.supplier_name}</h4>
            <Badge variant="destructive" className="text-xs mt-1">
              Pagar
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {format(parseISO(item.due_date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <p className="font-semibold text-sm">
              R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {item.description}
        </p>
        <PaymentStatusButton
          status={item.status as "paid" | "pending" | "received"}
          onMarkAsPaid={onMarkAsPaid}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}