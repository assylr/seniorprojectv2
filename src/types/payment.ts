export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'other' | null;

export interface Payment {
  id: number;
  contractId: number;
  tenantId: number;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  
  notes?: string | null;
  invoiceId?: number | null;
}
