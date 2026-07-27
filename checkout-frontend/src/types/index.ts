// === Domain Types ===

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  created_at: string;
}

export interface Customer {
  id?: string;
  email: string;
  full_name: string;
  phone_number: string;
}

export interface Delivery {
  id?: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
}

export interface CardInfo {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface Transaction {
  id?: string;
  amount: number;
  base_fee: number;
  delivery_fee: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  wompi_transaction_id: string | null;
  product_id?: string;
  customer_id?: string;
  delivery_id?: string;
  created_at?: string;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateTransactionPayload {
  items: { productId: string; quantity: number }[];
  customer: Customer;
  delivery: Delivery;
  card: CardInfo;
  accept_terms: boolean;
}

export interface TransactionResponse {
  transaction: Transaction;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
}

// === Checkout Flow Step ===
export type CheckoutStep = 'product' | 'detail' | 'checkout' | 'summary' | 'result';

// === Form State ===
export interface CheckoutFormData {
  customer: Customer;
  delivery: Delivery;
  card: CardInfo;
  accept_terms: boolean;
}