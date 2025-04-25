import { Product, PaymentMethod } from '@/types/pos';

export const PRODUCTS: Product[] = [
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

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, name: "Cartão de Crédito" },
  { id: 2, name: "Cartão de Débito" },
  { id: 3, name: "PIX" },
  { id: 4, name: "Dinheiro" },
  { id: 5, name: "Transferência Bancária" }
];
