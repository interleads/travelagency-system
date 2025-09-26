import React from 'react';
import { SuppliersTable } from '@/components/finance/SuppliersTable';

export default function Fornecedores() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fornecedores de Milhas</h1>
        <p className="text-muted-foreground">
          Gerencie seus fornecedores e parceiros de programas de milhas
        </p>
      </div>
      
      <SuppliersTable />
    </div>
  );
}