
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type SaleProductFormValues = {
  type: string;
  name: string;
  quantity: number;
  details: string;
  price: number;
};

interface SaleProductFormProps {
  value: SaleProductFormValues;
  onChange: (value: SaleProductFormValues) => void;
  onRemove?: () => void;
}

const productTypes = [
  { value: "passagem", label: "Passagem" },
  { value: "hotel", label: "Diária de Hotel" },
  { value: "veiculo", label: "Diária de Veículo" },
  { value: "seguro", label: "Seguro" },
  { value: "outros", label: "Outros" }
];

const SaleProductForm: React.FC<SaleProductFormProps> = ({ value, onChange, onRemove }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border-b pb-4 mb-4">
      <div className="md:col-span-2">
        <Label>Tipo</Label>
        <select
          className="w-full mt-1 border rounded-md h-10"
          value={value.type}
          onChange={e => onChange({ ...value, type: e.target.value })}
          required
        >
          <option value="">Selecione</option>
          {productTypes.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
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
      <div className="md:col-span-6">
        <Label>Detalhes/Opcional</Label>
        <Input
          value={value.details}
          onChange={e => onChange({ ...value, details: e.target.value })}
          placeholder="Ex: Data, endereço, observações..."
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

export default SaleProductForm;
