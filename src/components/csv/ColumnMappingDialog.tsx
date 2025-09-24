import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // Dados da Venda Principal
  sale_date: { label: "Data da Venda", required: true, group: "sale" },
  client_name: { label: "Nome do Cliente", required: true, group: "sale" },
  total_amount: { label: "Valor Total", required: true, group: "sale" },
  payment_method: { label: "Forma de Pagamento", required: false, group: "sale" },
  installments: { label: "Parcelas", required: false, group: "sale" },
  gross_profit: { label: "Lucro Bruto", required: false, group: "sale" },
  phone: { label: "Telefone", required: false, group: "sale" },
  notes: { label: "Observações da Venda", required: false, group: "sale" },
  supplier: { label: "Fornecedor", required: false, group: "sale" },
  has_anticipation: { label: "Tem Antecipação", required: false, group: "sale" },
  anticipation_date: { label: "Data da Antecipação", required: false, group: "sale" },
  
  // Dados Gerais do Produto
  product_type: { label: "Tipo do Produto", required: false, group: "product" },
  quantity: { label: "Quantidade", required: false, group: "product" },
  price: { label: "Preço/Valor", required: false, group: "product" },
  cost: { label: "Custo", required: false, group: "product" },
  details: { label: "Detalhes/Descrição", required: false, group: "product" },
  
  // Dados de Passagem Aérea
  ticket_type: { label: "Tipo da Passagem (milhas/tarifada)", required: false, group: "flight" },
  airline: { label: "Companhia Aérea", required: false, group: "flight" },
  adults: { label: "Adultos", required: false, group: "flight" },
  children: { label: "Crianças", required: false, group: "flight" },
  origin: { label: "Origem", required: false, group: "flight" },
  destination: { label: "Destino", required: false, group: "flight" },
  departure_date: { label: "Data Ida/Trecho 1", required: false, group: "flight" },
  return_date: { label: "Data Volta/Trecho 2", required: false, group: "flight" },
  tax_value: { label: "Valor das Taxas", required: false, group: "flight" },
  card_taxes: { label: "Cartão das Taxas", required: false, group: "flight" },
  miles_qty: { label: "Quantidade de Milhas", required: false, group: "flight" },
  miles_cost_per_thousand: { label: "Custo por 1k Milhas", required: false, group: "flight" },
  locator: { label: "Localizador", required: false, group: "flight" },
  
  // Dados de Hotel
  checkin_date: { label: "Data Check-in", required: false, group: "hotel" },
  checkout_date: { label: "Data Check-out", required: false, group: "hotel" },
  
  // Dados de Veículo
  vehicle_category: { label: "Categoria do Veículo", required: false, group: "vehicle" },
  rental_period: { label: "Período de Locação", required: false, group: "vehicle" },
  
  // Dados de Seguro
  coverage_type: { label: "Tipo de Cobertura", required: false, group: "insurance" },
  
  // Dados de Transfer
  transfer_origin: { label: "Origem do Transfer", required: false, group: "transfer" },
  transfer_destination: { label: "Destino do Transfer", required: false, group: "transfer" },
  transfer_datetime: { label: "Data/Hora do Transfer", required: false, group: "transfer" },
  vehicle_type: { label: "Tipo de Veículo", required: false, group: "transfer" },
  
  // Dados de Passeios
  tour_location: { label: "Local do Passeio", required: false, group: "tour" },
  tour_date: { label: "Data do Passeio", required: false, group: "tour" },
  tour_duration: { label: "Duração", required: false, group: "tour" },
  tour_people_count: { label: "Número de Pessoas", required: false, group: "tour" },
};

const FIELD_GROUPS = {
  sale: "Dados da Venda",
  product: "Dados Gerais do Produto", 
  flight: "Passagem Aérea",
  hotel: "Hotel",
  vehicle: "Veículo",
  insurance: "Seguro Viagem",
  transfer: "Transfer",
  tour: "Passeios"
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
              <Tabs defaultValue="sale" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                  {Object.entries(FIELD_GROUPS).map(([groupKey, groupLabel]) => (
                    <TabsTrigger key={groupKey} value={groupKey} className="text-xs">
                      {groupLabel}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(FIELD_GROUPS).map(([groupKey, groupLabel]) => (
                  <TabsContent key={groupKey} value={groupKey} className="space-y-3 max-h-96 overflow-y-auto">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">{groupLabel}</h4>
                    {Object.entries(SYSTEM_FIELDS)
                      .filter(([_, config]) => config.group === groupKey)
                      .map(([field, config]) => (
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
                  </TabsContent>
                ))}
              </Tabs>
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