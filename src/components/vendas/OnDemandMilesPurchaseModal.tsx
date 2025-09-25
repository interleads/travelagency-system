import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMilesPrograms } from "@/hooks/useMilesInventory";
import { Loader2, AlertTriangle } from "lucide-react";

export interface OnDemandMilesPurchase {
  // Supplier data (new or existing)
  supplier: {
    isNew: boolean;
    id?: string;
    name: string;
    contact: string;
    program: string;
    account_type: string;
  };
  // Miles purchase data
  miles: {
    program_id: string;
    quantity: number;
    cost_per_thousand: number;
    purchase_date: string;
  };
}

interface OnDemandMilesPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (purchase: OnDemandMilesPurchase) => void;
  requiredMiles: number;
  maxCostPerThousand: number; // Based on sale price to ensure profitability
  loading?: boolean;
}

export const OnDemandMilesPurchaseModal: React.FC<OnDemandMilesPurchaseModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  requiredMiles,
  maxCostPerThousand,
  loading = false
}) => {
  const { data: suppliers = [] } = useSuppliers();
  const { data: milesPrograms = [] } = useMilesPrograms();

  // Form state
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierAccountType, setSupplierAccountType] = useState("");
  const [programId, setProgramId] = useState("");
  const [quantity, setQuantity] = useState(requiredMiles);
  const [costPerThousand, setCostPerThousand] = useState<number>(0);
  
  const purchaseValue = (quantity / 1000) * costPerThousand;
  const isValidCost = costPerThousand > 0 && costPerThousand <= maxCostPerThousand;

  const handleSubmit = () => {
    if (!isValidCost || quantity <= 0 || !programId) return;

    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
    const selectedProgram = milesPrograms.find(p => p.id === programId);

    const purchase: OnDemandMilesPurchase = {
      supplier: {
        isNew: isNewSupplier,
        id: isNewSupplier ? undefined : selectedSupplierId,
        name: isNewSupplier ? supplierName : (selectedSupplier?.name || ""),
        contact: isNewSupplier ? supplierContact : (selectedSupplier?.contact || ""),
        program: selectedProgram?.name || "",
        account_type: isNewSupplier ? supplierAccountType : (selectedSupplier?.account_type || "")
      },
      miles: {
        program_id: programId,
        quantity,
        cost_per_thousand: costPerThousand,
        purchase_date: new Date().toISOString().split('T')[0]
      }
    };

    onSubmit(purchase);
  };

  const handleReset = () => {
    setIsNewSupplier(false);
    setSelectedSupplierId("");
    setSupplierName("");
    setSupplierContact("");
    setSupplierAccountType("");
    setProgramId("");
    setQuantity(requiredMiles);
    setCostPerThousand(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compra de Milhas Sob Demanda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Supplier Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={!isNewSupplier ? "default" : "outline"}
                  onClick={() => setIsNewSupplier(false)}
                  className="flex-1"
                >
                  Fornecedor Existente
                </Button>
                <Button
                  type="button"
                  variant={isNewSupplier ? "default" : "outline"}
                  onClick={() => setIsNewSupplier(true)}
                  className="flex-1"
                >
                  Novo Fornecedor
                </Button>
              </div>

              {!isNewSupplier ? (
                <div>
                  <Label htmlFor="supplier-select">Selecionar Fornecedor</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} - {supplier.program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplier-name">Nome do Fornecedor</Label>
                    <Input
                      id="supplier-name"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="Nome do novo fornecedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-contact">Contato (opcional)</Label>
                    <Input
                      id="supplier-contact"
                      value={supplierContact}
                      onChange={(e) => setSupplierContact(e.target.value)}
                      placeholder="Telefone, email ou WhatsApp (opcional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-type">Tipo de Conta</Label>
                    <Select value={supplierAccountType} onValueChange={setSupplierAccountType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                        <SelectItem value="MEI">MEI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Miles Purchase Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Compra de Milhas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="program">Programa de Milhas</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {milesPrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantidade de Milhas</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Mínimo necessário: {requiredMiles.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="cost">Custo por Mil</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={costPerThousand}
                    onChange={(e) => setCostPerThousand(Number(e.target.value))}
                    min={0}
                    max={maxCostPerThousand}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Máximo: R$ {maxCostPerThousand.toFixed(2)}
                  </p>
                </div>
              </div>

              {!isValidCost && costPerThousand > 0 && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    Custo por mil muito alto. Máximo permitido: R$ {maxCostPerThousand.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {quantity > 0 && costPerThousand > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span>{quantity.toLocaleString()} milhas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por mil:</span>
                    <span>R$ {costPerThousand.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Valor Total:</span>
                    <span>R$ {purchaseValue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !isValidCost ||
                quantity <= 0 ||
                !programId ||
                (isNewSupplier && (!supplierName || !supplierAccountType)) ||
                (!isNewSupplier && !selectedSupplierId)
              }
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Compra
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};