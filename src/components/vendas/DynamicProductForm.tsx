import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Componente select reutilizável
const airlines = [
  "LATAM",
  "GOL",
  "Azul",
  "Air France",
  "TAP",
  "Emirates",
  "American Airlines",
  "United",
  "Delta"
];

export type ProductType = "passagem" | "hotel" | "veiculo" | "seguro" | "outros";

export interface SaleProduct {
  type?: ProductType;
  name: string;
  quantity: number;
  price: number;
  details: string;
  // Campos só para passagem
  airline?: string;
  adults?: number;
  children?: number;
  origin?: string;
  destination?: string;
  trecho1?: string;
  trecho2?: string;
  cardTaxes?: string;
  qtdMilhas?: number;
  custoMil?: number;
  profit?: number;
  [key: string]: any;
}

// EmptyProduct atualizado
export const EmptyProduct: SaleProduct = {
  type: undefined,
  name: "",
  quantity: 1,
  price: 0,
  details: "",
  airline: "",
  adults: 1,
  children: 0,
  origin: "",
  destination: "",
  trecho1: "",
  trecho2: "",
  cardTaxes: "",
  qtdMilhas: 0,
  custoMil: 0,
  profit: 0,
};

const typeOptions = [
  { value: "passagem", label: "Passagem Aérea" },
  { value: "hotel", label: "Diária de Hotel" },
  { value: "veiculo", label: "Diária de Veículo" },
  { value: "seguro", label: "Seguro Viagem" },
  { value: "outros", label: "Outros" },
];

const DynamicProductForm: React.FC<{
  value: SaleProduct;
  onChange: (product: SaleProduct) => void;
  onRemove?: () => void;
}> = ({ value, onChange, onRemove }) => {

  // Cálculo do lucro em tempo real (para passagem)
  const computedProfit = React.useMemo(() => {
    if (value.type !== "passagem") return undefined;
    const venda = Number(value.price || 0) * Number(value.quantity || 1);
    const milhas = Number(value.qtdMilhas || 0);
    const custoMil = Number(value.custoMil || 0);
    if (!milhas || !custoMil) return venda || 0;
    const custoTotal = (milhas / 1000) * custoMil;
    return venda - custoTotal;
  }, [
    value.price, value.quantity, value.qtdMilhas, value.custoMil, value.type
  ]);

  // Render extra fields REVISADO
  const renderExtraFields = () => {
    switch (value.type) {
      case "passagem":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label>Companhia Aérea</Label>
              <select
                className="w-full mt-1 border rounded-md h-10"
                value={value.airline ?? ""}
                onChange={e => onChange({ ...value, airline: e.target.value })}
                required
              >
                <option value="">Selecione</option>
                {airlines.map(airline => (
                  <option key={airline} value={airline}>{airline}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <Label>Adultos</Label>
                <Input
                  type="number"
                  min={1}
                  value={value.adults ?? 1}
                  onChange={e => onChange({ ...value, adults: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="w-1/2">
                <Label>Crianças</Label>
                <Input
                  type="number"
                  min={0}
                  value={value.children ?? 0}
                  onChange={e => onChange({ ...value, children: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Origem</Label>
              <Input value={value.origin || ""} onChange={e => onChange({ ...value, origin: e.target.value })} required />
            </div>
            <div>
              <Label>Destino</Label>
              <Input value={value.destination || ""} onChange={e => onChange({ ...value, destination: e.target.value })} required />
            </div>
            <div>
              <Label>Data Trecho 1</Label>
              <Input type="date" value={value.trecho1 || ""} onChange={e => onChange({ ...value, trecho1: e.target.value })} required />
            </div>
            <div>
              <Label>Data Trecho 2</Label>
              <Input type="date" value={value.trecho2 || ""} onChange={e => onChange({ ...value, trecho2: e.target.value })} />
            </div>
            <div>
              <Label>Cartão das Taxas</Label>
              <Input value={value.cardTaxes || ""} onChange={e => onChange({ ...value, cardTaxes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <Label>Qtd Milhas</Label>
                <Input
                  type="number"
                  min={0}
                  value={value.qtdMilhas ?? 0}
                  onChange={e => onChange({ ...value, qtdMilhas: Number(e.target.value) })}
                />
              </div>
              <div className="w-1/2">
                <Label>Custo por 1k</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value.custoMil ?? 0}
                  onChange={e => onChange({ ...value, custoMil: Number(e.target.value) })}
                />
              </div>
            </div>
            {/* Preview do lucro */}
            <div className="md:col-span-2 rounded-md mt-1 bg-gray-50 px-2 py-1 flex items-center justify-between">
              <span className="font-medium text-sm">Lucro Calculado:</span>
              <span className={`text-base font-bold ${computedProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                R$ {isNaN(computedProfit) ? "0,00" : computedProfit?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        );
      case "hotel":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label>Check-in</Label>
              <Input type="date" value={value.checkin || ""} onChange={e => onChange({ ...value, checkin: e.target.value })} />
            </div>
            <div>
              <Label>Check-out</Label>
              <Input type="date" value={value.checkout || ""} onChange={e => onChange({ ...value, checkout: e.target.value })} />
            </div>
          </div>
        );
      case "veiculo":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label>Categoria do Veículo</Label>
              <Input value={value.categoria || ""} onChange={e => onChange({ ...value, categoria: e.target.value })} />
            </div>
            <div>
              <Label>Período</Label>
              <Input value={value.periodo || ""} onChange={e => onChange({ ...value, periodo: e.target.value })} placeholder="Ex: 10/07 a 15/07" />
            </div>
          </div>
        );
      case "seguro":
        return (
          <div>
            <Label>Tipo de Cobertura</Label>
            <Input value={value.cobertura || ""} onChange={e => onChange({ ...value, cobertura: e.target.value })} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative border border-border rounded-lg p-4 mb-4 bg-card">
      {onRemove && (
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <Label>Tipo</Label>
          <select
            className="w-full mt-1 border border-input rounded-md h-10 px-3 bg-background"
            value={value.type ?? ""}
            onChange={e => {
              const newType = e.target.value === "" ? undefined : (e.target.value as ProductType);
              onChange({ ...EmptyProduct, ...value, type: newType });
            }}
            required
          >
            <option value="">Selecione</option>
            {typeOptions.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label>Nome/Descrição</Label>
          <Input
            value={value.name}
            onChange={e => onChange({ ...value, name: e.target.value })}
            required
            placeholder="Nome do produto ou serviço"
          />
        </div>
        <div>
          <Label>Qtd</Label>
          <Input
            type="number"
            min={1}
            value={value.quantity}
            onChange={e => onChange({ ...value, quantity: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Valor</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={value.price}
            onChange={e => onChange({ ...value, price: Number(e.target.value) })}
            placeholder="R$"
          />
        </div>
        
        {value.type && (
          <div className="md:col-span-6 mt-2">
            {renderExtraFields()}
          </div>
        )}
        
        <div className="md:col-span-6">
          <Label>Detalhes/Opcional</Label>
          <Input
            value={value.details}
            onChange={e => onChange({ ...value, details: e.target.value })}
            placeholder="Ex: Observações (vencimento, fornecedor...)"
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicProductForm;
