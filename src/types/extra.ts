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


// Utility Billing Types (Standardized Naming)

export interface UtilityRate {
    id: number;
    utilityType: 'electricity' | 'water' | 'heating' | 'internet'; // Consider if 'gas' is needed
    ratePerUnit: number;
    unit: string; // e.g., 'kWh', 'm3', 'month'
    baseCharge?: number; // Optional base charge regardless of usage
}

export interface UtilityReading {
    id: number;
    roomId: number;
    utilityType: 'electricity' | 'water' | 'heating'; // Internet is likely fixed rate, maybe not read?
    readingDate: Date;
    value: number; // The meter reading value
    // previousValue?: number; // Maybe calculated on backend? Or stored?
}

export interface UtilityBill {
    id: number;
    contractId: number; // Link to contract instead of tenant/room directly?
    tenantId: number; // Denormalized for convenience
    roomId: number;   // Denormalized for convenience
    billingPeriodStartDate: Date; // Split period for clarity
    billingPeriodEndDate: Date;
    issueDate: Date;
    dueDate: Date;
    items: UtilityBillItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'; // Added cancelled
    paymentId?: number | null; // Link to the payment record if paid
}

export interface UtilityBillItem {
    // Removed 'rent' - assuming rent is handled via Contract/Payment
    utilityType: 'electricity' | 'water' | 'heating' | 'internet' | 'other_charge'; // Added other_charge
    description: string; // e.g., "Electricity Usage", "Base Internet Fee"
    usage?: number; // Usage amount (kWh, m3)
    unit?: string; // Unit for usage
    rate?: number; // Rate per unit
    baseCharge?: number; // Fixed charge amount
    amount: number; // Total amount for this item (calculated: usage*rate + baseCharge)
}