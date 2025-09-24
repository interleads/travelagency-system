
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SaleSummaryProps {
  total: number;
  totalCost: number;
}

const SaleSummary: React.FC<SaleSummaryProps> = ({ total, totalCost }) => {
  const profit = total - totalCost;
  const margin = total > 0 ? (profit / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Venda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total da Venda:</span>
            <span className="text-lg font-semibold">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Custo Total:</span>
            <span className="text-lg font-semibold text-red-600">R$ {totalCost.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Lucro Bruto:</span>
              <span className={`text-xl font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                R$ {profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">Margem:</span>
              <span className={`text-sm font-medium ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {margin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleSummary;
