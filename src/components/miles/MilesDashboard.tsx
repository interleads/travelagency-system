import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { MilesInventoryTable } from './MilesInventoryTable';
import { ClearInventoryDialog } from './ClearInventoryDialog';

export const MilesDashboard = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Milhas</h2>
        <Button 
          variant="destructive" 
          onClick={() => setShowClearDialog(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Limpar Estoque
        </Button>
      </div>
      
      <MilesInventoryTable />
      
      <ClearInventoryDialog 
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
      />
    </div>
  );
};