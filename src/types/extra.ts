import { Room } from "./room";
import { Tenant } from "./tenant";
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


// Maintenance Types (Standardized Naming)

export interface MaintenanceRequest {
    id: number;
    roomId: number;
    tenantId: number | null; // Can be null if submitted by admin for vacant room
    room?: Room;       // Optional nested data
    tenant?: Tenant;   // Optional nested data
    category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'general' | 'other'; // Added general
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    status: 'submitted' | 'acknowledged' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'rejected'; // Expanded status
    submittedDate: Date;
    assignedTo: string | null;
    scheduledDate: Date | null;
    completedDate: Date | null;
    notes?: string | null; // Allow null
    images?: string[]; // URLs to images
}

// Consider a simpler data type for form submission
export interface MaintenanceRequestFormData {
    roomId: number; // Need to select the room
    category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'general' | 'other';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    // tenantId might be inferred from logged-in user if submitted by tenant
    notes?: string | null;
    // Image uploads handled separately
}

// MaintenanceUpdate seems fine, maybe just standardize casing if needed elsewhere
export interface MaintenanceUpdate {
    id: number;
    requestId: number;
    // status: MaintenanceRequest['status']; // Use the status from MaintenanceRequest
    updateDate: Date;
    updatedByUserId: number; // Link to user who updated
    notes: string | null;
    // Optional: record specific status change
    newStatus?: MaintenanceRequest['status'];
}