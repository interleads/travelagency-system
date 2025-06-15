
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type ProductType = "passagem" | "hotel" | "veiculo" | "seguro" | "outros";

export interface SaleProduct {
  type?: ProductType;
  name: string;
  quantity: number;
  price: number;
  details: string;
  // Dados especiais
  [key: string]: any;
}

// EmptyProduct: type is optional/undefined initially
export const EmptyProduct: SaleProduct = {
  type: undefined,
  name: "",
  quantity: 1,
  price: 0,
  details: "",
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
  // Dynamic fields for each type
  const renderExtraFields = () => {
    switch (value.type) {
      case "passagem":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Localizador (PNR)</Label>
              <Input value={value.localizador || ""} onChange={e => onChange({ ...value, localizador: e.target.value })} />
            </div>
            <div>
              <Label>Bagagens</Label>
              <Input value={value.bagagens || ""} onChange={e => onChange({ ...value, bagagens: e.target.value })} placeholder="Ex: 1x23kg" />
            </div>
          </div>
        );
      case "hotel":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border-b pb-4 mb-4">
      <div className="md:col-span-2">
        <Label>Tipo</Label>
        <select
          className="w-full mt-1 border rounded-md h-10"
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
          value={value.price}
          onChange={e => onChange({ ...value, price: Number(e.target.value) })}
          placeholder="R$"
        />
      </div>
      <div className="md:col-span-6 py-2">
        {renderExtraFields()}
      </div>
      <div className="md:col-span-6">
        <Label>Detalhes/Opcional</Label>
        <Input
          value={value.details}
          onChange={e => onChange({ ...value, details: e.target.value })}
          placeholder="Ex: Observações (vencimento, fornecedor...)"
        />
      </div>
      {onRemove && (
        <div className="md:col-span-6 flex justify-end">
          <Button size="sm" variant="destructive" type="button" onClick={onRemove}>Remover</Button>
        </div>
      )}
    </div>
  );
};

export default DynamicProductForm;
