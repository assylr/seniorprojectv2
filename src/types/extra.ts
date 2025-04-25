// Data Transfer Objects (for Forms / API Payloads)

// src/services/types.ts

export interface ContractFormData {
    tenantId: number;
    roomId: number; // Ensure room is available before allowing selection
    startDate: string; // Use string for form input
    endDate: string;   // Use string for form input
    monthlyRentAmount: number;
    notes?: string | null;
}

export interface PaymentFormData {
    contractId: number;
    paymentDate: string; // Use string for form input
    amount: number;
    paymentMethod: 'bank_transfer' | 'card' | 'cash' | 'other' | null;
    notes?: string | null;
}

// Remove all utility billing related types