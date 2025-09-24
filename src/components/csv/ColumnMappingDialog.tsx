import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
  // Campos Obrigatórios
  sale_date: { label: "Data da Venda", required: true },
  client_name: { label: "Nome do Cliente", required: true },
  total_amount: { label: "Valor Total", required: true },
  
  // Dados da Venda Principal
  payment_method: { label: "Forma de Pagamento", required: false },
  installments: { label: "Parcelas", required: false },
  gross_profit: { label: "Lucro Bruto", required: false },
  phone: { label: "Telefone", required: false },
  notes: { label: "Observações da Venda", required: false },
  supplier: { label: "Fornecedor", required: false },
  has_anticipation: { label: "Tem Antecipação", required: false },
  anticipation_date: { label: "Data da Antecipação", required: false },
  
  // Dados Gerais do Produto
  product_type: { label: "Tipo do Produto", required: false },
  quantity: { label: "Quantidade", required: false },
  price: { label: "Preço/Valor", required: false },
  cost: { label: "Custo", required: false },
  details: { label: "Detalhes/Descrição", required: false },
  
  // Dados de Passagem Aérea
  ticket_type: { label: "Tipo da Passagem (milhas/tarifada)", required: false },
  airline: { label: "Companhia Aérea", required: false },
  adults: { label: "Adultos", required: false },
  children: { label: "Crianças", required: false },
  origin: { label: "Origem", required: false },
  destination: { label: "Destino", required: false },
  departure_date: { label: "Data Ida/Trecho 1", required: false },
  return_date: { label: "Data Volta/Trecho 2", required: false },
  tax_value: { label: "Valor das Taxas", required: false },
  card_taxes: { label: "Cartão das Taxas", required: false },
  miles_qty: { label: "Quantidade de Milhas", required: false },
  miles_cost_per_thousand: { label: "Custo por 1k Milhas", required: false },
  locator: { label: "Localizador", required: false },
  
  // Dados de Hotel
  checkin_date: { label: "Data Check-in", required: false },
  checkout_date: { label: "Data Check-out", required: false },
  
  // Dados de Veículo
  vehicle_category: { label: "Categoria do Veículo", required: false },
  rental_period: { label: "Período de Locação", required: false },
  
  // Dados de Seguro
  coverage_type: { label: "Tipo de Cobertura", required: false },
  
  // Dados de Transfer
  transfer_origin: { label: "Origem do Transfer", required: false },
  transfer_destination: { label: "Destino do Transfer", required: false },
  transfer_datetime: { label: "Data/Hora do Transfer", required: false },
  vehicle_type: { label: "Tipo de Veículo", required: false },
  
  // Dados de Passeios
  tour_location: { label: "Local do Passeio", required: false },
  tour_date: { label: "Data do Passeio", required: false },
  tour_duration: { label: "Duração", required: false },
  tour_people_count: { label: "Número de Pessoas", required: false },
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

  const getDuplicateColumns = () => {
    const columnCounts: Record<string, string[]> = {};
    Object.entries(mapping).forEach(([field, column]) => {
      if (column) {
        if (!columnCounts[column]) columnCounts[column] = [];
        columnCounts[column].push(field);
      }
    });
    return Object.entries(columnCounts).filter(([, fields]) => fields.length > 1);
  };

  const canApply = () => {
    const hasMissingRequired = getMissingRequiredFields().length > 0;
    const hasDuplicates = getDuplicateColumns().length > 0;
    return !hasMissingRequired && !hasDuplicates;
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
            <CardContent className="pt-6">
              <h4 className="font-medium text-sm mb-3">Colunas Detectadas no CSV</h4>
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
            <CardContent className="pt-6">
              <h4 className="font-medium text-sm mb-4">Mapeamento de Campos</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(SYSTEM_FIELDS).map(([field, config]) => (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{config.label}</span>
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
                       <SelectTrigger className={`w-64 ${
                         mapping[field] && getDuplicateColumns().some(([col]) => col === mapping[field])
                           ? 'border-destructive' 
                           : ''
                       }`}>
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
                     {mapping[field] && getDuplicateColumns().some(([col]) => col === mapping[field]) && (
                       <div className="text-xs text-destructive mt-1">
                         ⚠️ Mapeamento duplicado
                       </div>
                     )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(getMissingRequiredFields().length > 0 || getDuplicateColumns().length > 0) && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                {getMissingRequiredFields().length > 0 && (
                  <div className="mb-4">
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
                  </div>
                )}
                
                {getDuplicateColumns().length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Mapeamentos duplicados detectados:</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-destructive/80">
                      {getDuplicateColumns().map(([column, fields]) => (
                        <div key={column}>
                          Coluna "{column}" está mapeada em: {fields.map(f => 
                            SYSTEM_FIELDS[f as keyof typeof SYSTEM_FIELDS].label
                          ).join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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