
import { Product, PaymentMethod } from '@/types/pos';

// Produtos serão cadastrados dinamicamente pelo usuário
export const PRODUCTS: Product[] = [];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, name: "Cartão de Crédito" },
  { id: 2, name: "Cartão de Débito" },
  { id: 3, name: "PIX" },
  { id: 4, name: "Dinheiro" },
  { id: 5, name: "Transferência Bancária" }
];

