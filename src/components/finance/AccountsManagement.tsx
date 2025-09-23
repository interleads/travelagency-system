import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountsReceivableTable } from './AccountsReceivableTable';
import { AccountsPayableTable } from './AccountsPayableTable';

export function AccountsManagement() {
  return (
    <Tabs defaultValue="receivable" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
        <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="receivable">
        <AccountsReceivableTable />
      </TabsContent>
      
      <TabsContent value="payable">
        <AccountsPayableTable />
      </TabsContent>
    </Tabs>
  );
}