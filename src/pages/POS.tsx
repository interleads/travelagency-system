import React, { useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from '@/components/ui/use-toast';
import { CartItem, Product, PaymentMethod } from '@/types/pos';
import ProductSelection from '@/components/pos/ProductSelection';
import CartTable from '@/components/pos/CartTable';
import PaymentInfo from '@/components/pos/PaymentInfo';

// Mock products
const PRODUCTS: Product[] = [
  // Pacotes
  { id: 1, name: "Pacote Cancún", price: 4750.0, category: "Pacote" },
  { id: 2, name: "Pacote Orlando", price: 5890.0, category: "Pacote" },
  { id: 3, name: "Pacote Paris", price: 6250.0, category: "Pacote" },
  { id: 4, name: "Pacote Gramado", price: 2980.0, category: "Pacote" },
  // Passagens
  { id: 5, name: "Passagem SP-MIA (ida/volta)", price: 3200.0, category: "Passagem" },
  { id: 6, name: "Passagem SP-LIS (ida/volta)", price: 4100.0, category: "Passagem" },
  { id: 7, name: "Passagem SP-CUN (ida/volta)", price: 2800.0, category: "Passagem" },
  // Hospedagem
  { id: 8, name: "Hotel Luxor - 5 diárias", price: 1890.0, category: "Hospedagem" },
  { id: 9, name: "Resort Paradise - 4 diárias", price: 2400.0, category: "Hospedagem" },
  { id: 10, name: "Pousada do Vale - 3 diárias", price: 890.0, category: "Hospedagem" },
  // Seguros
  { id: 11, name: "Seguro Viagem Internacional", price: 450.0, category: "Seguro" },
  { id: 12, name: "Seguro Viagem Nacional", price: 180.0, category: "Seguro" },
  // Veículos
  { id: 13, name: "Aluguel Carro Econômico - Diária", price: 150.0, category: "Veículo" },
  { id: 14, name: "Aluguel SUV - Diária", price: 280.0, category: "Veículo" },
  { id: 15, name: "Transfer Aeroporto", price: 120.0, category: "Veículo" }
];

// Mock payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, name: "Cartão de Crédito" },
  { id: 2, name: "Cartão de Débito" },
  { id: 3, name: "PIX" },
  { id: 4, name: "Dinheiro" },
  { id: 5, name: "Transferência Bancária" }
];

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Add product to cart
  const handleAddToCart = (item: CartItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity } 
          : cartItem
      ));
    } else {
      setCart([...cart, item]);
    }
  };
  
  // Remove item from cart
  const handleRemoveFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Complete sale
  const handleCompleteSale = (clientName: string, paymentMethod: string, installments: number) => {
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
    
    toast({
      title: "Venda realizada com sucesso!",
      description: `Total: R$ ${total.toFixed(2)}`,
    });
    
    setCart([]);
  };

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">PDV - Ponto de Venda</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductSelection 
            products={PRODUCTS}
            onAddToCart={handleAddToCart}
          />
          <CartTable 
            items={cart}
            onRemoveItem={handleRemoveFromCart}
          />
        </div>
        
        <div>
          <PaymentInfo 
            paymentMethods={PAYMENT_METHODS}
            total={total}
            onCompleteSale={handleCompleteSale}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default POS;
