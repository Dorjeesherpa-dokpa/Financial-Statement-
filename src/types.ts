
export interface Client {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  size: string;
  category: 'Pail' | 'Drums' | 'IBC' | 'Small Bottles';
}

export type PaymentStatus = 'settled' | 'pending';

export interface TransactionEdit {
  date: Date;
  previousAmountPaid: number;
  newAmountPaid: number;
  previousStatus: PaymentStatus;
  newStatus: PaymentStatus;
}

export interface Transaction {
  id: string;
  clientId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  date: Date;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  editHistory?: TransactionEdit[];
  lastEditedAt?: Date;
}

export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  clientId?: string;
  paymentStatus?: PaymentStatus;
  reportType: 'weekly' | 'monthly' | 'quarterly';
}
