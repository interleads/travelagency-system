import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { MilesInventoryTable } from './MilesInventoryTable';
import { ClearInventoryDialog } from './ClearInventoryDialog';
import { ClearAllDataDialog } from '../shared/ClearAllDataDialog';

export const MilesDashboard = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Milhas</h2>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Estoque
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Sistema
          </Button>
        </div>
      </div>
      
      <MilesInventoryTable />
      
      <ClearInventoryDialog 
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
      />
      
      <ClearAllDataDialog 
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
      />
    </div>
  );
};