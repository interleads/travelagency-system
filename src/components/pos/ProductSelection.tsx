
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItem, Product } from "@/types/pos";
import { useToast } from '@/components/ui/use-toast';

interface ProductSelectionProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({ products, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um produto para adicionar ao carrinho"
      });
      return;
    }

    const productId = parseInt(selectedProduct);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity
      });
      
      setSelectedProduct("");
      setQuantity(1);
      toast({
        title: "Produto adicionado",
        description: `${quantity}x ${product.name} adicionado ao carrinho`
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label htmlFor="product">Produto</Label>
            <Select 
              value={selectedProduct} 
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(
                  products.reduce((acc, product) => ({
                    ...acc,
                    [product.category]: [...(acc[product.category] || []), product]
                  }), {} as Record<string, typeof products>)
                ).map(([category, products]) => (
                  <div key={category}>
                    <span className="text-xs text-gray-500 px-2">{category}</span>
                    {(products as Product[]).map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - R$ {product.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input 
              id="quantity"
              type="number" 
              min={1} 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
            />
          </div>
        </div>
        <Button onClick={handleAddToCart} className="w-full">
          Adicionar ao Carrinho
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductSelection;
