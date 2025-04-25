
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethod } from "@/types/pos";

interface PaymentInfoProps {
  paymentMethods: PaymentMethod[];
  total: number;
  onCompleteSale: (clientName: string, paymentMethod: string, installments: number) => void;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ 
  paymentMethods, 
  total,
  onCompleteSale 
}) => {
  const [clientName, setClientName] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [installments, setInstallments] = React.useState<number>(1);

  const handleCompleteSale = () => {
    onCompleteSale(clientName, paymentMethod, installments);
    setClientName("");
    setPaymentMethod("");
    setInstallments(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Venda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="client">Nome do Cliente</Label>
            <Input 
              id="client" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)} 
              placeholder="Nome do cliente"
            />
          </div>
          
          <div>
            <Label htmlFor="payment">Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment">
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(paymentMethod === "1") && (
            <div>
              <Label htmlFor="installments">Parcelas</Label>
              <Select 
                value={installments.toString()} 
                onValueChange={(val) => setInstallments(parseInt(val))}
              >
                <SelectTrigger id="installments">
                  <SelectValue placeholder="Número de parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}x {num === 1 ? 'à vista' : 
                        `de R$ ${(total / num).toFixed(2)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="pt-4">
            <Button onClick={handleCompleteSale} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Finalizar Venda
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfo;
