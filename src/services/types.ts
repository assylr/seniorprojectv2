export interface Building {
    id: number;
    buildingType: "apartment" | "townhouse" | "cottage";
    buildingNumber: string;
    floorCount: number | null;
    totalArea: number | null;
    available: boolean;
}

export interface Room {
    id: number;
    building: Building;
    roomNumber: string; // Example format: "A-101"
    bedroomCount: number;
    totalArea: number;
    floorNumber: number | null; // Allow null if needed
    available: boolean;
    baseRent?: number; // Base monthly rent amount
}

export interface Tenant {
    id: number;  // Consistent naming
    name: string;
    surname: string;
    school?: string;
    position?: string;
    tenant_type: 'renter' | 'faculty';
    mobile?: string;
    email?: string;
    room: Room;  // No need for building since it's in Room
    arrival_date: Date;  // Use Date type
    departure_date: Date | null;
}

export interface TenantData {
    name: string;
    surname: string;
    school?: string;
    position?: string;
    room_id: number; // Consistency in naming
    tenant_type: 'renter' | 'faculty';
    mobile?: string;
    email?: string;
}

export interface BatchTenantData extends Omit<TenantData, 'room_id'> {
    room_id: number | null; // Allow null for initial batch entry
    building_id?: number; // Optional building filter for room selection
    status?: 'pending' | 'success' | 'error'; // Status for batch processing
    error_message?: string; // Error message if processing failed
}

export interface BatchCheckOutData {
    tenant_id: number;
    status?: 'pending' | 'success' | 'error';
    error_message?: string;
}

// Utility types for billing system
export interface UtilityRate {
    id: number;
    utilityType: 'electricity' | 'water' | 'heating' | 'internet';
    ratePerUnit: number;
    unit: string; // e.g., 'kWh', 'cubic meter', 'month'
    baseCharge?: number; // Optional base charge regardless of usage
}

export interface UtilityReading {
    id: number;
    roomId: number;
    utilityType: 'electricity' | 'water' | 'heating' | 'internet';
    readingDate: Date;
    value: number; // The meter reading value
    previousValue?: number; // Previous reading for calculation
}

export interface UtilityBill {
    id: number;
    tenantId: number;
    roomId: number;
    billingPeriod: {
        startDate: Date;
        endDate: Date;
    };
    issueDate: Date;
    dueDate: Date;
    items: UtilityBillItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'overdue';
    paymentDate?: Date;
}

export interface UtilityBillItem {
    utilityType: 'electricity' | 'water' | 'heating' | 'internet' | 'rent';
    usage?: number; // Usage amount (not applicable for fixed charges like rent)
    rate?: number; // Rate per unit (not applicable for fixed charges)
    baseCharge?: number; // Base charge amount
    amount: number; // Total amount for this item
}

// Maintenance types
export interface MaintenanceRequest {
    id: number;
    roomId: number;
    tenantId: number | null; // Can be null if submitted by admin for vacant room
    category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    submittedDate: Date;
    assignedTo?: string;
    scheduledDate?: Date;
    completedDate?: Date;
    notes?: string;
    images?: string[]; // URLs to images
}

export interface MaintenanceRequestData {
    roomId: number;
    tenantId?: number;
    category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    notes?: string;
}

export interface MaintenanceUpdate {
    id: number;
    requestId: number;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    updateDate: Date;
    updatedBy: string;
    notes: string;
}
