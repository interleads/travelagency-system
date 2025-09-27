import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileAccountCardProps {
  account: any;
  onMarkAsReceived?: (id: string, amount: number) => void;
  onMarkAsPaid?: (id: string, amount: number) => void;
  disabled?: boolean;
}

export function MobileAccountCard({ account, onMarkAsReceived, onMarkAsPaid, disabled }: MobileAccountCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{account.party_name}</CardTitle>
          <Badge 
            variant={account.type === 'receivable' ? 'default' : 'secondary'}
            className={`text-xs ${
              account.type === 'receivable' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {account.type === 'receivable' ? 'Receber' : 'Pagar'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Data Vencimento</p>
            <p className="font-semibold">
              {format(parseISO(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Valor</p>
            <p className="font-bold text-lg">
              R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div>
          <p className="font-medium text-muted-foreground text-sm">Descrição</p>
          <p className="text-sm">{account.description}</p>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div>
            <p className="font-medium text-muted-foreground text-sm">Status</p>
          </div>
          <PaymentStatusButton
            status={account.status}
            onMarkAsReceived={account.type === 'receivable' && onMarkAsReceived ? 
              () => onMarkAsReceived(account.id, account.amount) : undefined}
            onMarkAsPaid={account.type === 'payable' && onMarkAsPaid ? 
              () => onMarkAsPaid(account.id, account.amount) : undefined}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}