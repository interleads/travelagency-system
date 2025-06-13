
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FinanceOverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Balanço Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-600">R$ 125.780,45</p>
          <p className="text-sm text-gray-500">Atualizado em 25/04/2025</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-sky-600">R$ 248.950,00</p>
          <p className="text-sm text-gray-500">Total acumulado</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">R$ 123.169,55</p>
          <p className="text-sm text-gray-500">Total acumulado</p>
        </CardContent>
      </Card>
    </div>
  );
}
