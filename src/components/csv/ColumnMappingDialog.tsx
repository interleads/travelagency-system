import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ColumnMapping {
  [systemField: string]: string | null; // CSV column name or null if not mapped
}

interface ColumnMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (mapping: ColumnMapping) => void;
  csvColumns: string[];
  initialMapping?: ColumnMapping;
}

const SYSTEM_FIELDS = {
  sale_date: { label: "Data da Venda", required: true },
  client_name: { label: "Nome do Cliente", required: true },
  total_amount: { label: "Valor Total", required: true },
  gross_profit: { label: "Lucro Bruto", required: false },
  payment_method: { label: "Forma de Pagamento", required: false },
  status: { label: "Status", required: false },
  route: { label: "Trecho/Rota", required: false },
  airline: { label: "Companhia Aérea", required: false },
  supplier: { label: "Fornecedor", required: false },
  miles_qty: { label: "Quantidade de Milhas", required: false },
  cost: { label: "Custo", required: false },
  description: { label: "Descrição/Observações", required: false },
};

export function ColumnMappingDialog({ 
  isOpen, 
  onClose, 
  onApply, 
  csvColumns, 
  initialMapping = {} 
}: ColumnMappingDialogProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  useEffect(() => {
    setMapping(initialMapping);
  }, [initialMapping]);

  const handleMappingChange = (systemField: string, csvColumn: string | null) => {
    setMapping(prev => ({
      ...prev,
      [systemField]: csvColumn === "none" ? null : csvColumn
    }));
  };

  const getUsedColumns = () => {
    return Object.values(mapping).filter(col => col !== null);
  };

  const isColumnUsed = (csvColumn: string, currentSystemField: string) => {
    const usedColumns = getUsedColumns();
    return usedColumns.includes(csvColumn) && mapping[currentSystemField] !== csvColumn;
  };

  const getRequiredFields = () => {
    return Object.entries(SYSTEM_FIELDS)
      .filter(([, config]) => config.required)
      .map(([field]) => field);
  };

  const getMissingRequiredFields = () => {
    return getRequiredFields().filter(field => !mapping[field]);
  };

  const canApply = () => {
    return getMissingRequiredFields().length === 0;
  };

  const handleApply = () => {
    if (canApply()) {
      onApply(mapping);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mapear Colunas do CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colunas Detectadas no CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {csvColumns.map((column, index) => (
                  <Badge 
                    key={index} 
                    variant={getUsedColumns().includes(column) ? "default" : "outline"}
                    className="text-xs"
                  >
                    {column}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mapeamento de Campos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(SYSTEM_FIELDS).map(([field, config]) => (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.label}</span>
                      {config.required && (
                        <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                      )}
                      {mapping[field] && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <Select
                      value={mapping[field] || "none"}
                      onValueChange={(value) => handleMappingChange(field, value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Selecionar coluna CSV" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não mapear</SelectItem>
                        {csvColumns.map((column, index) => (
                          <SelectItem 
                            key={index} 
                            value={column}
                            disabled={isColumnUsed(column, field)}
                          >
                            {column}
                            {isColumnUsed(column, field) && " (já usado)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {getMissingRequiredFields().length > 0 && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Campos obrigatórios não mapeados:</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getMissingRequiredFields().map(field => (
                    <Badge key={field} variant="destructive" className="text-xs">
                      {SYSTEM_FIELDS[field as keyof typeof SYSTEM_FIELDS].label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApply}
              disabled={!canApply()}
            >
              Aplicar Mapeamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}