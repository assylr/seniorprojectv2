// Core Entities

export interface Building {
    id: number;
    buildingType: "apartment" | "townhouse" | "cottage";
    buildingNumber: string; // e.g., "Block 5", "12A"
    floorCount: number | null;
    totalArea: number | null; // Maybe overall building area?
    // Consider removing 'available', or clarifying its meaning (e.g., 'isOperational')
    // Room availability is usually tracked at the Room level.
}

export interface Room {
    id: number;
    buildingId: number; // Use ID for relation, fetch Building separately if needed
    building?: Building; // Optional: Include full object if API provides it nested
    roomNumber: string; // Example format: "A-101", "5-2B"
    bedroomCount: number;
    totalArea: number; // Area of the room itself
    floorNumber: number | null;
    isAvailable: boolean; // Renamed for clarity
    baseRent: number | null; // Use null if rent varies or isn't set directly on the room
}

export interface Tenant {
    id: number;
    firstName: string; // Changed from 'name' for clarity
    lastName: string;  // Changed from 'surname' for clarity
    schoolOrDepartment: string | null; // More descriptive, allow null
    position: string | null; // Allow null
    tenantType: 'faculty' | 'staff'; // Standardized values and casing
    mobile: string | null;
    email: string | null; // Make required if it's the primary identifier/login?
    // Tenant might not always have a room assigned yet
    currentRoomId: number | null; // Relation via ID
    currentRoom?: Room; // Optional: For display if API provides nested data
    arrivalDate: Date | null; // Use null if not yet arrived/set
    expectedDepartureDate: Date | null; // More descriptive name

    // addition of new fields

    deposit: number;
}

// --- Missing Core Types ---

export interface Contract {
    id: number;
    tenantId: number;
    roomId: number;
    tenant?: Tenant; // Optional nested data for display
    room?: Room;     // Optional nested data for display
    startDate: Date;
    endDate: Date;
    monthlyRentAmount: number;
    status: 'active' | 'expired' | 'terminated' | 'pending'; // Added pending/terminated
    // Optional: Link to related documents (e.g., lease agreement URL)
    leaseDocumentUrl?: string | null;
    notes?: string | null;
}

export interface Payment {
    id: number;
    contractId: number;
    tenantId: number; // Denormalized for easier querying/display
    paymentDate: Date;
    amount: number;
    paymentMethod: 'bank_transfer' | 'card' | 'cash' | 'other' | null; // Example methods
    notes?: string | null;
    // Optional: Link to invoice if applicable
    invoiceId?: number | null;
}


// Data Transfer Objects (for Forms / API Payloads)

export interface TenantFormData {
    // Used for creating or updating a tenant
    firstName: string;
    lastName: string;
    schoolOrDepartment: string | null;
    position: string | null;
    tenantType: 'faculty' | 'staff';
    mobile: string | null;
    email: string | null; // Make required if used for login/primary contact
    arrivalDate: string | null; // Use string for form input, convert to Date on submission/retrieval
    expectedDepartureDate: string | null; // Use string for form input
    // Assigning room might be part of Contract creation, not Tenant creation itself
    // currentRoomId?: number | null; // Optionally include if assigning directly
}

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

export interface RoomFormData {
    buildingId: number;
    roomNumber: string;
    bedroomCount: number;
    totalArea: number;
    floorNumber: number | null;
    isAvailable: boolean;
    baseRent: number | null;
}

export interface BuildingFormData {
    buildingType: "apartment" | "townhouse" | "cottage";
    buildingNumber: string;
    floorCount: number | null;
    totalArea: number | null;
}


// Batch Operations Types (Standardized Naming)

export interface BatchTenantData extends Omit<TenantFormData, 'currentRoomId' | 'arrivalDate' | 'expectedDepartureDate'> {
    // Fields needed specifically for batch upload, might differ from single Tenant form
    roomIdToAssign: number | null; // Explicitly name the target room ID for assignment
    buildingId?: number; // Optional building filter for room selection
    status?: 'pending' | 'success' | 'error'; // Status for batch processing
    errorMessage?: string; // Standardized casing
}

export interface BatchCheckOutData {
    tenantId: number;
    // Optional: Add departure date for batch check-out?
    // departureDate?: string;
    status?: 'pending' | 'success' | 'error';
    errorMessage?: string; // Standardized casing
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