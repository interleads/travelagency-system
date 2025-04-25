
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock products
const PRODUCTS = [
  { id: 1, name: "Pacote Cancún", price: 4750.0 },
  { id: 2, name: "Pacote Orlando", price: 5890.0 },
  { id: 3, name: "Pacote Paris", price: 6250.0 },
  { id: 4, name: "Pacote Gramado", price: 2980.0 },
  { id: 5, name: "Seguro Viagem", price: 450.0 },
  { id: 6, name: "Transfer Aeroporto", price: 180.0 }
];

// Mock payment methods
const PAYMENT_METHODS = [
  { id: 1, name: "Cartão de Crédito" },
  { id: 2, name: "Cartão de Débito" },
  { id: 3, name: "PIX" },
  { id: 4, name: "Dinheiro" },
  { id: 5, name: "Transferência Bancária" }
];

// Cart item interface
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [clientName, setClientName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [installments, setInstallments] = useState<number>(1);
  const { toast } = useToast();

  // Add product to cart
  const addToCart = () => {
    if (!selectedProduct) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um produto para adicionar ao carrinho"
      });
      return;
    }

    const productId = parseInt(selectedProduct);
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (product) {
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
        setCart(cart.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        ));
      } else {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity
        }]);
      }
      
      setSelectedProduct("");
      setQuantity(1);
      toast({
        title: "Produto adicionado",
        description: `${quantity}x ${product.name} adicionado ao carrinho`
      });
    }
  };
  
  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O carrinho está vazio"
      });
      return;
    }

    if (!clientName) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Informe o nome do cliente"
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um método de pagamento"
      });
      return;
    }
    
    // Here you would save the sale to the database
    toast({
      title: "Venda realizada com sucesso!",
      description: `Total: R$ ${total.toFixed(2)}`,
    });
    
    // Reset form
    setCart([]);
    setClientName("");
    setPaymentMethod("");
    setInstallments(1);
  };

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">PDV - Ponto de Venda</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <Card className="lg:col-span-2">
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
                    {PRODUCTS.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - R$ {product.price.toFixed(2)}
                      </SelectItem>
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
            
            <Button onClick={addToCart} className="w-full">
              Adicionar ao Carrinho
            </Button>
          </CardContent>
          
          <CardHeader>
            <CardTitle>Carrinho de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço Un.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Carrinho vazio
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        R$ {item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-lg font-bold">Total:</div>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {total.toFixed(2)}
            </div>
          </CardFooter>
        </Card>
        
        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Nome do Cliente</Label>
                <Input 
                  id="client" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <Label htmlFor="payment">Método de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment">
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(paymentMethod === "1") && (
                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <Select 
                    value={installments.toString()} 
                    onValueChange={(val) => setInstallments(parseInt(val))}
                  >
                    <SelectTrigger id="installments">
                      <SelectValue placeholder="Número de parcelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x {num === 1 ? 'à vista' : 
                            `de R$ ${(total / num).toFixed(2)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="pt-4">
                <Button onClick={completeSale} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Finalizar Venda
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default POS;
