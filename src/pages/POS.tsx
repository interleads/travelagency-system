
import React, { useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from '@/components/ui/use-toast';
import { CartItem, Product, PaymentMethod } from '@/types/pos';
import ProductSelection from '@/components/pos/ProductSelection';
import CartTable from '@/components/pos/CartTable';
import PaymentInfo from '@/components/pos/PaymentInfo';
import { PRODUCTS, PAYMENT_METHODS } from '@/data/products';

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
