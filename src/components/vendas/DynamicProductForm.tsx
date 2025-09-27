import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { useCurrencyInput, useQuantityInput, parseCurrency, parseQuantity } from "@/lib/utils";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMilesPrograms } from '@/hooks/useMilesInventory';
import { SupplierForm } from "@/components/finance/SupplierForm";
import { OnDemandMilesPurchaseModal } from "./OnDemandMilesPurchaseModal";
import { useOnDemandMilesPurchase } from "@/hooks/useOnDemandMilesPurchase";
import { useAvailableMilesForProgram, useNextAvailableBatch } from '@/hooks/useAvailableMiles';

// Componente select reutilizável
const airlines = ["LATAM", "GOL", "Azul", "Air France", "TAP", "Emirates", "American Airlines", "United", "Delta"];
export type ProductType = "passagem" | "hotel" | "veiculo" | "seguro" | "transfer" | "passeios" | "outros";
export interface SaleProduct {
  type?: ProductType;
  name?: string;
  quantity: number;
  price: number;
  cost: number;
  details: string;
  fornecedor?: string; // Campo fornecedor para todos os produtos
  supplier_id?: string; // Novo relacionamento com fornecedores
  // Campos só para passagem
  ticketType?: "milhas" | "tarifada";
  milesSourceType?: "estoque" | "compra_sob_demanda"; // Tipo de origem das milhas
  milesProgram?: string; // ID do programa de milhas
  airline?: string;
  adults?: number;
  children?: number;
  origin?: string;
  destination?: string;
  trecho1?: string;
  trecho2?: string;
  cardTaxes?: string;
  taxValue?: number; // Valor das taxas
  qtdMilhas?: number;
  custoMil?: number;
  profit?: number;
  locator?: string; // Campo localizador para passagens
  [key: string]: any;
}

// Função para gerar nome automático do produto
export const generateProductName = (product: SaleProduct): string => {
  if (!product.type) return "";
  const fornecedorSuffix = product.fornecedor ? ` - ${product.fornecedor}` : "";
  switch (product.type) {
    case "passagem":
      if (product.airline && product.origin && product.destination) {
        return `Passagem ${product.airline} ${product.origin}-${product.destination}${fornecedorSuffix}`;
      }
      return `Passagem ${product.airline || ""}${fornecedorSuffix}`.trim();
    case "hotel":
      return `Hotel ${product.destination || ""}${fornecedorSuffix}`.trim();
    case "veiculo":
      return `Veículo ${product.categoria || ""}${fornecedorSuffix}`.trim();
    case "seguro":
      return `Seguro Viagem ${product.cobertura || ""}${fornecedorSuffix}`.trim();
    case "transfer":
      if (product.origem && product.destino) {
        return `Transfer ${product.origem}-${product.destino}${fornecedorSuffix}`;
      }
      return `Transfer${fornecedorSuffix}`;
    case "passeios":
      return `Passeio ${product.local || ""}${fornecedorSuffix}`.trim();
    case "outros":
      return `Outros${fornecedorSuffix}`;
    default:
      return String(product.type).charAt(0).toUpperCase() + String(product.type).slice(1) + fornecedorSuffix;
  }
};

// EmptyProduct atualizado
export const EmptyProduct: SaleProduct = {
  type: undefined,
  name: "",
  quantity: 1,
  price: 0,
  cost: 0,
  details: "",
  fornecedor: "",
  // Campo fornecedor inicializado vazio
  supplier_id: undefined,
  ticketType: "milhas",
  milesSourceType: "estoque",
  // Padrão para estoque
  milesProgram: undefined,
  airline: "",
  adults: 1,
  children: 0,
  origin: "",
  destination: "",
  trecho1: "",
  trecho2: "",
  cardTaxes: "",
  taxValue: 0,
  qtdMilhas: 0,
  custoMil: 0,
  profit: 0,
  locator: "" // Incluir localizador no produto vazio
};
const typeOptions = [{
  value: "passagem",
  label: "Passagem Aérea"
}, {
  value: "hotel",
  label: "Hotel"
}, {
  value: "veiculo",
  label: "Veículo"
}, {
  value: "seguro",
  label: "Seguro Viagem"
}, {
  value: "transfer",
  label: "Transfer"
}, {
  value: "passeios",
  label: "Passeios"
}, {
  value: "outros",
  label: "Outros"
}];
const DynamicProductForm: React.FC<{
  value: SaleProduct;
  onChange: (product: SaleProduct) => void;
  onRemove?: () => void;
}> = ({
  value,
  onChange,
  onRemove
}) => {
  const {
    data: suppliers = []
  } = useSuppliers();
  const {
    data: milesPrograms = []
  } = useMilesPrograms();
  const onDemandMilesPurchase = useOnDemandMilesPurchase();
  const {
    data: availableMiles = 0
  } = useAvailableMilesForProgram(value.ticketType === "milhas" ? value.milesProgram : null);
  const {
    data: nextBatchCost
  } = useNextAvailableBatch(value.ticketType === "milhas" && value.milesSourceType === "estoque" ? value.milesProgram : null, value.qtdMilhas || 0);
  const [isOnDemandModalOpen, setIsOnDemandModalOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = React.useState(false);

  // Refs para os inputs para evitar formatação durante digitação
  const priceRef = React.useRef<HTMLInputElement>(null);
  const costRef = React.useRef<HTMLInputElement>(null);
  const taxValueRef = React.useRef<HTMLInputElement>(null);
  const custoMilRef = React.useRef<HTMLInputElement>(null);
  const quantityRef = React.useRef<HTMLInputElement>(null);
  const qtdMilhasRef = React.useRef<HTMLInputElement>(null);
  const adultsRef = React.useRef<HTMLInputElement>(null);
  const childrenRef = React.useRef<HTMLInputElement>(null);

  // Hooks de formatação para campos monetários
  const taxValueInput = useCurrencyInput(value.taxValue || 0);
  const priceInput = useCurrencyInput(value.price || 0);
  const costInput = useCurrencyInput(value.cost || 0);
  const custoMilInput = useCurrencyInput(value.custoMil || 0);

  // Hooks de formatação para campos de quantidade
  const qtdMilhasInput = useQuantityInput(value.qtdMilhas || 0);
  const quantityInput = useQuantityInput(value.quantity || 1);
  const adultsInput = useQuantityInput(value.adults || 1);
  const childrenInput = useQuantityInput(value.children || 0);

  // Sincronizar valores quando o produto mudar externamente (somente se campo não estiver focado)
  React.useEffect(() => {
    if (document.activeElement !== taxValueRef.current) {
      taxValueInput.setValue(value.taxValue || 0);
    }
    if (document.activeElement !== priceRef.current) {
      priceInput.setValue(value.price || 0);
    }
    if (document.activeElement !== costRef.current) {
      costInput.setValue(value.cost || 0);
    }
    if (document.activeElement !== custoMilRef.current) {
      custoMilInput.setValue(value.custoMil || 0);
    }
    if (document.activeElement !== qtdMilhasRef.current) {
      qtdMilhasInput.setValue(value.qtdMilhas || 0);
    }
    if (document.activeElement !== quantityRef.current) {
      quantityInput.setValue(value.quantity || 1);
    }
    if (document.activeElement !== adultsRef.current) {
      adultsInput.setValue(value.adults || 1);
    }
    if (document.activeElement !== childrenRef.current) {
      childrenInput.setValue(value.children || 0);
    }
  }, [value.taxValue, value.price, value.cost, value.custoMil, value.qtdMilhas, value.quantity, value.adults, value.children]);

  // Cálculo automático de custo para estoque atual
  React.useEffect(() => {
    if (value.ticketType === "milhas" && value.milesSourceType === "estoque" && nextBatchCost && value.qtdMilhas && value.qtdMilhas > 0) {
      const calculatedCost = nextBatchCost;
      custoMilInput.setValue(calculatedCost);
      onChange({
        ...value,
        custoMil: calculatedCost
      });
    }
  }, [value.ticketType, value.milesSourceType, nextBatchCost, value.qtdMilhas, onChange]);

  // Cálculo do lucro em tempo real usando valores diretos do estado
  const computedProfit = React.useMemo(() => {
    const venda = (value.price || 0) * (value.quantity || 1);
    if (value.type === "passagem" && value.ticketType === "milhas") {
      const milhas = value.qtdMilhas || 0;
      const custoMil = value.custoMil || 0;
      const taxas = value.taxValue || 0;
      if (!milhas || !custoMil) return venda - taxas || 0;
      const custoTotal = milhas / 1000 * custoMil + taxas;
      return venda - custoTotal;
    }

    // Para passagem tarifada e outros produtos
    const custo = value.cost || 0;
    return venda - custo;
  }, [value.price, value.quantity, value.qtdMilhas, value.custoMil, value.cost, value.type, value.ticketType, value.taxValue]);

  // Atualizar profit no estado quando computedProfit mudar
  React.useEffect(() => {
    if (Math.abs((value.profit || 0) - computedProfit) > 0.01) {
      onChange({
        ...value,
        profit: computedProfit
      });
    }
  }, [computedProfit, value, onChange]);

  // Atualizar nome automaticamente quando os campos relevantes mudarem
  React.useEffect(() => {
    const autoName = generateProductName(value);
    if (autoName && autoName !== value.name) {
      onChange({
        ...value,
        name: autoName
      });
    }
  }, [value.type, value.airline, value.origin, value.destination, value.categoria, value.cobertura, value.local, value.origem, value.destino, value.fornecedor]);

  // Handle on-demand miles purchase
  const handleOnDemandPurchase = async (purchase: any) => {
    try {
      const result = await onDemandMilesPurchase.mutateAsync(purchase);

      // Update the product with supplier info and cost
      onChange({
        ...value,
        supplier_id: result.supplierId,
        fornecedor: purchase.supplier.name,
        custoMil: purchase.miles.cost_per_thousand,
        cost: result.totalCost
      });
      setIsOnDemandModalOpen(false);
    } catch (error) {
      console.error('Erro ao realizar compra sob demanda:', error);
    }
  };

  // Calculate max cost per thousand based on sale price to ensure profitability
  const maxCostPerThousand = value.price && value.qtdMilhas ? value.price * 0.8 / value.qtdMilhas * 1000 // 80% of sale price as max cost
  : 0;

  // Render extra fields REVISADO
  const renderExtraFields = () => {
    switch (value.type) {
      case "passagem":
        return <div className="space-y-3">
            {/* Tipo da Passagem */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo da Passagem</Label>
                <select className="w-full mt-1 border border-input rounded-md h-10 px-3 bg-background" value={value.ticketType || "milhas"} onChange={e => onChange({
                ...value,
                ticketType: e.target.value as "milhas" | "tarifada"
              })}>
                  <option value="milhas">Com Milhas</option>
                  <option value="tarifada">Tarifada</option>
                </select>
              </div>
              <div>
                <Label>Companhia Aérea</Label>
                <select className="w-full mt-1 border border-input rounded-md h-10 px-3 bg-background" value={value.airline ?? ""} onChange={e => onChange({
                ...value,
                airline: e.target.value
              })} required>
                  <option value="">Selecione</option>
                  {airlines.map(airline => <option key={airline} value={airline}>{airline}</option>)}
                </select>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>Adultos</Label>
                <Input ref={adultsRef} type="text" value={adultsInput.displayValue} onChange={e => {
                adultsInput.handleChange(e);
                const parsed = parseQuantity(e.target.value);
                onChange({
                  ...value,
                  adults: parsed
                });
              }} onBlur={adultsInput.handleBlur} placeholder="1" required />
              </div>
              <div>
                <Label>Crianças</Label>
                <Input ref={childrenRef} type="text" value={childrenInput.displayValue} onChange={e => {
                childrenInput.handleChange(e);
                const parsed = parseQuantity(e.target.value);
                onChange({
                  ...value,
                  children: parsed
                });
              }} onBlur={childrenInput.handleBlur} placeholder="0" />
              </div>
              <div>
                <Label>Valor Tx</Label>
                <Input ref={taxValueRef} type="text" value={taxValueInput.displayValue} onChange={e => {
                taxValueInput.handleChange(e);
                const parsed = parseCurrency(e.target.value);
                onChange({
                  ...value,
                  taxValue: parsed
                });
              }} onBlur={taxValueInput.handleBlur} placeholder="R$ 0,00" />
              </div>
              <div>
                <Label>Cartão
              </Label>
                <Input value={value.cardTaxes || ""} onChange={e => onChange({
                ...value,
                cardTaxes: e.target.value
              })} />
              </div>
            </div>

            {/* Origem e Destino */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origem</Label>
                <Input value={value.origin || ""} onChange={e => onChange({
                ...value,
                origin: e.target.value
              })} required />
              </div>
              <div>
                <Label>Destino</Label>
                <Input value={value.destination || ""} onChange={e => onChange({
                ...value,
                destination: e.target.value
              })} required />
              </div>
            </div>

            {/* Datas e Localizador */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Data T1</Label>
                <Input type="date" value={value.trecho1 || ""} onChange={e => onChange({
                ...value,
                trecho1: e.target.value
              })} required />
              </div>
              <div>
                <Label>Data T2</Label>
                <Input type="date" value={value.trecho2 || ""} onChange={e => onChange({
                ...value,
                trecho2: e.target.value
              })} />
              </div>
              <div>
                <Label>Localizador</Label>
                <Input value={value.locator || ""} onChange={e => onChange({
                ...value,
                locator: e.target.value
              })} placeholder="Ex: ABC123" className="uppercase" />
              </div>
            </div>

            {/* Seleção do tipo de origem das milhas */}
            <div className="space-y-3 p-3 bg-accent/50 rounded-md">
              <Label className="text-sm font-medium">Como obter as milhas?</Label>
              <div className="flex gap-2">
                <Button type="button" variant={value.milesSourceType === "estoque" ? "default" : "outline"} onClick={() => onChange({
                ...value,
                milesSourceType: "estoque"
              })} className="flex-1" size="sm">
                  Estoque Atual
                </Button>
                <Button type="button" variant={value.milesSourceType === "compra_sob_demanda" ? "default" : "outline"} onClick={() => onChange({
                ...value,
                milesSourceType: "compra_sob_demanda"
              })} className="flex-1" size="sm">
                  Comprar Agora
                </Button>
              </div>
              
              {value.milesSourceType === "compra_sob_demanda" && <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  💡 As milhas serão compradas no momento da venda e utilizadas imediatamente.
                </div>}
            </div>

            {/* Campos específicos por tipo */}
            {value.ticketType === "milhas" ? <div className="space-y-3">
                {value.milesSourceType === "estoque" && <div>
                    <Label>Programa de Milhas</Label>
                    <Select value={value.milesProgram || ""} onValueChange={program_id => onChange({
                ...value,
                milesProgram: program_id
              })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o programa" />
                      </SelectTrigger>
                      <SelectContent>
                        {milesPrograms?.map(program => <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    {value.milesProgram && <div className="text-sm text-muted-foreground mt-1">
                        Saldo disponível: {availableMiles.toLocaleString()} milhas
                        {value.qtdMilhas && value.qtdMilhas > availableMiles && <span className="text-destructive ml-2">
                            ⚠️ Saldo insuficiente!
                          </span>}
                      </div>}
                  </div>}
                
                {value.milesSourceType === "compra_sob_demanda" && <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Programa de Milhas</Label>
                      <Select value={value.milesProgram || ""} onValueChange={program_id => onChange({
                  ...value,
                  milesProgram: program_id
                })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o programa" />
                        </SelectTrigger>
                        <SelectContent>
                          {milesPrograms?.map(program => <SelectItem key={program.id} value={program.id}>
                              {program.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={() => setIsOnDemandModalOpen(true)} disabled={!value.qtdMilhas || !value.price} variant="default" className="h-10">
                        Configurar Compra
                      </Button>
                    </div>
                  </div>}
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Qtd Milhas</Label>
                    <Input ref={qtdMilhasRef} type="text" value={qtdMilhasInput.displayValue} onChange={e => {
                  qtdMilhasInput.handleChange(e);
                  const parsed = parseQuantity(e.target.value);
                  onChange({
                    ...value,
                    qtdMilhas: parsed
                  });
                }} onBlur={qtdMilhasInput.handleBlur} placeholder="0" />
                  </div>
                  <div>
                    <Label>Custo por 1k</Label>
                    <Input ref={custoMilRef} type="text" value={value.milesSourceType === "estoque" && nextBatchCost ? `R$ ${nextBatchCost.toFixed(2).replace('.', ',')}` : custoMilInput.displayValue} onChange={e => {
                  if (value.milesSourceType !== "estoque") {
                    custoMilInput.handleChange(e);
                    const parsed = parseCurrency(e.target.value);
                    onChange({
                      ...value,
                      custoMil: parsed
                    });
                  }
                }} onBlur={custoMilInput.handleBlur} placeholder="R$ 0,00" disabled={value.milesSourceType === "estoque"} className={value.milesSourceType === "estoque" ? "bg-muted text-muted-foreground" : ""} />
                    {(value.custoMil || 0) > 0 && value.milesSourceType !== "estoque" && <div className="text-xs text-muted-foreground mt-1">
                        Valor interpretado: R$ {(value.custoMil || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 5
                  })}
                      </div>}
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <Label>Lucro</Label>
                      <div className="mt-1 px-3 py-2 bg-muted rounded-md h-10 flex items-center">
                        <span className={`font-medium text-sm ${computedProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          R$ {isNaN(computedProfit) ? "0,00" : computedProfit?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2
                      })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div> : <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Custo da Passagem</Label>
                  <Input ref={costRef} type="text" value={costInput.displayValue} onChange={e => {
                costInput.handleChange(e);
                const parsed = parseCurrency(e.target.value);
                onChange({
                  ...value,
                  cost: parsed
                });
              }} onBlur={costInput.handleBlur} placeholder="R$ 0,00" />
                </div>
                <div className="flex items-end">
                  <div className="w-full">
                    <Label>Lucro</Label>
                    <div className="mt-1 px-3 py-2 bg-muted rounded-md h-10 flex items-center">
                      <span className={`font-medium text-sm ${computedProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        R$ {isNaN(computedProfit) ? "0,00" : computedProfit?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2
                    })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>}

            {/* Campo Fornecedor para passagens - só para compra sob demanda ou tarifada */}
            {(value.milesSourceType === "compra_sob_demanda" || value.ticketType === "tarifada") && <div className="space-y-2">
                <Label>Fornecedor</Label>
                <div className="flex gap-2">
                  <Select value={value.supplier_id || ""} onValueChange={supplier_id => {
                const selectedSupplier = suppliers?.find(s => s.id === supplier_id);
                onChange({
                  ...value,
                  supplier_id: supplier_id === "other" ? undefined : supplier_id,
                  fornecedor: selectedSupplier?.name || ""
                });
              }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">Outro (texto livre)</SelectItem>
                      {suppliers?.map(supplier => <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Fornecedor</DialogTitle>
                      </DialogHeader>
                      <SupplierForm onSubmit={() => {
                    setIsSupplierDialogOpen(false);
                  }} />
                    </DialogContent>
                  </Dialog>
                </div>
                {(!value.supplier_id || value.supplier_id === "other") && <Input value={value.fornecedor || ""} onChange={e => onChange({
              ...value,
              fornecedor: e.target.value
            })} placeholder="Ex: CVC, Decolar, etc" />}
              </div>}

          </div>;
      case "hotel":
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <div className="flex gap-2">
                <Select value={value.supplier_id || ""} onValueChange={supplier_id => {
                const selectedSupplier = suppliers?.find(s => s.id === supplier_id);
                onChange({
                  ...value,
                  supplier_id: supplier_id === "other" ? undefined : supplier_id,
                  fornecedor: selectedSupplier?.name || ""
                });
              }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Outro (texto livre)</SelectItem>
                    {suppliers?.map(supplier => <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Fornecedor</DialogTitle>
                    </DialogHeader>
                    <SupplierForm onSubmit={() => {
                    setIsSupplierDialogOpen(false);
                  }} />
                  </DialogContent>
                </Dialog>
              </div>
              {(!value.supplier_id || value.supplier_id === "other") && <Input value={value.fornecedor || ""} onChange={e => onChange({
              ...value,
              fornecedor: e.target.value
            })} placeholder="Ex: Booking, Expedia, etc" />}
            </div>
            <div>
              <Label>Check-in</Label>
              <Input type="date" value={value.checkin || ""} onChange={e => onChange({
              ...value,
              checkin: e.target.value
            })} />
            </div>
            <div>
              <Label>Check-out</Label>
              <Input type="date" value={value.checkout || ""} onChange={e => onChange({
              ...value,
              checkout: e.target.value
            })} />
            </div>
          </div>;
      case "veiculo":
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <div className="flex gap-2">
                <Select value={value.supplier_id || ""} onValueChange={supplier_id => {
                const selectedSupplier = suppliers?.find(s => s.id === supplier_id);
                onChange({
                  ...value,
                  supplier_id: supplier_id === "other" ? undefined : supplier_id,
                  fornecedor: selectedSupplier?.name || ""
                });
              }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Outro (texto livre)</SelectItem>
                    {suppliers?.map(supplier => <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Fornecedor</DialogTitle>
                    </DialogHeader>
                    <SupplierForm onSubmit={() => {
                    setIsSupplierDialogOpen(false);
                  }} />
                  </DialogContent>
                </Dialog>
              </div>
              {(!value.supplier_id || value.supplier_id === "other") && <Input value={value.fornecedor || ""} onChange={e => onChange({
              ...value,
              fornecedor: e.target.value
            })} placeholder="Ex: Hertz, Localiza, etc" />}
            </div>
            <div>
              <Label>Categoria do Veículo</Label>
              <Input value={value.categoria || ""} onChange={e => onChange({
              ...value,
              categoria: e.target.value
            })} />
            </div>
            <div>
              <Label>Período</Label>
              <Input value={value.periodo || ""} onChange={e => onChange({
              ...value,
              periodo: e.target.value
            })} placeholder="Ex: 10/07 a 15/07" />
            </div>
          </div>;
      case "seguro":
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <div className="flex gap-2">
                <Select value={value.supplier_id || ""} onValueChange={supplier_id => {
                const selectedSupplier = suppliers?.find(s => s.id === supplier_id);
                onChange({
                  ...value,
                  supplier_id: supplier_id === "other" ? undefined : supplier_id,
                  fornecedor: selectedSupplier?.name || ""
                });
              }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Outro (texto livre)</SelectItem>
                    {suppliers?.map(supplier => <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Fornecedor</DialogTitle>
                    </DialogHeader>
                    <SupplierForm onSubmit={() => {
                    setIsSupplierDialogOpen(false);
                  }} />
                  </DialogContent>
                </Dialog>
              </div>
              {(!value.supplier_id || value.supplier_id === "other") && <Input value={value.fornecedor || ""} onChange={e => onChange({
              ...value,
              fornecedor: e.target.value
            })} placeholder="Ex: Porto Seguro, Assist Card, etc" />}
            </div>
            <div>
              <Label>Tipo de Cobertura</Label>
              <Input value={value.cobertura || ""} onChange={e => onChange({
              ...value,
              cobertura: e.target.value
            })} />
            </div>
          </div>;
      case "transfer":
        return <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fornecedor</Label>
              <Input value={value.fornecedor || ""} onChange={e => onChange({
              ...value,
              fornecedor: e.target.value
            })} placeholder="Ex: Easy Transfer, etc" />
            </div>
            <div>
              <Label>Origem</Label>
              <Input value={value.origem || ""} onChange={e => onChange({
              ...value,
              origem: e.target.value
            })} />
            </div>
            <div>
              <Label>Destino</Label>
              <Input value={value.destino || ""} onChange={e => onChange({
              ...value,
              destino: e.target.value
            })} />
            </div>
            <div>
              <Label>Data/Hora</Label>
              <Input type="datetime-local" value={value.dataHora || ""} onChange={e => onChange({
              ...value,
              dataHora: e.target.value
            })} />
            </div>
            <div>
              <Label>Tipo de Veículo</Label>
              <Input value={value.tipoVeiculo || ""} onChange={e => onChange({
              ...value,
              tipoVeiculo: e.target.value
            })} />
            </div>
          </div>;
      case "passeios":
        return <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fornecedor</Label>
              <Input value={value.fornecedor || ""} onChange={e => onChange({
              ...value,
              fornecedor: e.target.value
            })} placeholder="Ex: CityTour, GetYourGuide, etc" />
            </div>
            <div>
              <Label>Local do Passeio</Label>
              <Input value={value.local || ""} onChange={e => onChange({
              ...value,
              local: e.target.value
            })} />
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" value={value.dataPasseio || ""} onChange={e => onChange({
              ...value,
              dataPasseio: e.target.value
            })} />
            </div>
            <div>
              <Label>Duração</Label>
              <Input value={value.duracao || ""} onChange={e => onChange({
              ...value,
              duracao: e.target.value
            })} placeholder="Ex: 4 horas" />
            </div>
            <div>
              <Label>Nº de Pessoas</Label>
              <Input type="number" value={value.numeroPessoas || ""} onChange={e => onChange({
              ...value,
              numeroPessoas: e.target.value
            })} />
            </div>
          </div>;
      case "outros":
        return <div>
            <Label>Fornecedor</Label>
            <Input value={value.fornecedor || ""} onChange={e => onChange({
            ...value,
            fornecedor: e.target.value
          })} placeholder="Ex: Fornecedor do produto/serviço" />
          </div>;
      default:
        return null;
    }
  };
  return <>
      <div className="relative border border-border rounded-lg p-4 mb-4 bg-card">
      {onRemove && <Button size="icon" variant="ghost" type="button" onClick={onRemove} className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Tipo</Label>
          <select className="w-full mt-1 border border-input rounded-md h-10 px-3 bg-background" value={value.type ?? ""} onChange={e => {
            const newType = e.target.value === "" ? undefined : e.target.value as ProductType;
            onChange({
              ...EmptyProduct,
              ...value,
              type: newType
            });
          }} required>
            <option value="">Selecione</option>
            {typeOptions.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
          </select>
        </div>
        <div>
          <Label>Qtd</Label>
          <Input ref={quantityRef} type="text" value={quantityInput.displayValue} onChange={e => {
            quantityInput.handleChange(e);
            const parsed = parseQuantity(e.target.value);
            onChange({
              ...value,
              quantity: parsed
            });
          }} onBlur={quantityInput.handleBlur} placeholder="1" />
        </div>
        <div>
          <Label>Valor</Label>
          <Input ref={priceRef} type="text" value={priceInput.displayValue} onChange={e => {
            priceInput.handleChange(e);
            const parsed = parseCurrency(e.target.value);
            onChange({
              ...value,
              price: parsed
            });
          }} onBlur={priceInput.handleBlur} placeholder="R$ 0,00" />
          {(value.price || 0) > 0 && <div className="text-xs text-muted-foreground mt-1">
              Valor interpretado: R$ {(value.price || 0).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 5
            })}
            </div>}
        </div>
        {/* Custo - Oculto para todas as passagens */}
        {value.type !== "passagem" && <div>
            <Label>Custo</Label>
            <Input ref={costRef} type="text" value={costInput.displayValue} onChange={e => {
            costInput.handleChange(e);
            const parsed = parseCurrency(e.target.value);
            onChange({
              ...value,
              cost: parsed
            });
          }} onBlur={costInput.handleBlur} placeholder="R$ 0,00" />
          </div>}
      </div>
      
      {/* Mostrar nome do produto gerado automaticamente */}
      {value.type && value.name && <div className="mt-2">
          <div className="px-3 py-2 bg-muted/50 rounded-md border-l-4 border-primary/30">
            <p className="text-sm text-muted-foreground">
              <strong>Produto:</strong> {value.name}
            </p>
          </div>
        </div>}
      
      {/* Lucro - Só mostrar para produtos que não sejam passagem (que já tem preview próprio) */}
      {value.type !== "passagem" && <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <Label>Lucro do Produto</Label>
            <div className="mt-1 px-3 py-2 bg-muted rounded-md h-10 flex items-center">
              <span className={`font-medium text-sm ${computedProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                R$ {(computedProfit || 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div></div>
        </div>}
        
        {value.type && <div className="mt-4">
            {renderExtraFields()}
          </div>}
        
        <div className="mt-4">
          <Label>Detalhes/Opcional</Label>
          <Input value={value.details} onChange={e => onChange({
          ...value,
          details: e.target.value
        })} placeholder="Ex: Observações (vencimento, fornecedor...)" />
        </div>
      </div>
      
      {/* On-Demand Miles Purchase Modal */}
      <OnDemandMilesPurchaseModal open={isOnDemandModalOpen} onOpenChange={setIsOnDemandModalOpen} onSubmit={handleOnDemandPurchase} requiredMiles={value.qtdMilhas || 0} maxCostPerThousand={maxCostPerThousand} loading={onDemandMilesPurchase.isPending} />
    </>;
};
export default DynamicProductForm;