
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SaleSummaryProps {
  total: number;
}

const SaleSummary: React.FC<SaleSummaryProps> = ({ total }) => (
  <Card>
    <CardHeader>
      <CardTitle>Resumo da Venda</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-xl font-bold text-emerald-700 mb-2">
        Total: R$ {total.toFixed(2)}
      </div>
      {/* Futuramente incluir parcelas, descontos, comissões, etc */}
    </CardContent>
  </Card>
);

export default SaleSummary;
