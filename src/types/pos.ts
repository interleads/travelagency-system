
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
}
