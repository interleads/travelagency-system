import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";

interface PaymentStatusButtonProps {
  status: 'pending' | 'received' | 'paid';
  onMarkAsPaid?: () => void;
  onMarkAsReceived?: () => void;
  disabled?: boolean;
}

export function PaymentStatusButton({ 
  status, 
  onMarkAsPaid, 
  onMarkAsReceived, 
  disabled 
}: PaymentStatusButtonProps) {
  if (status === 'received' || status === 'paid') {
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
        <Check className="h-3 w-3 mr-1" />
        {status === 'received' ? 'Recebido' : 'Pago'}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
      {onMarkAsReceived && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkAsReceived}
          disabled={disabled}
          className="h-7 px-2 text-xs"
        >
          Marcar como Recebido
        </Button>
      )}
      {onMarkAsPaid && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkAsPaid}
          disabled={disabled}
          className="h-7 px-2 text-xs"
        >
          Marcar como Pago
        </Button>
      )}
    </div>
  );
}