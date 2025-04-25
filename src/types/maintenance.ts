import { Room } from "./room";
import { Tenant } from "./tenant";

export enum MaintenanceStatus {
    SUBMITTED = 'submitted',
    ACKNOWLEDGED = 'acknowledged',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REJECTED = 'rejected'
}

export enum MaintenancePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    EMERGENCY = 'emergency'
}

export enum MaintenanceCategory {
    PLUMBING = 'plumbing',
    ELECTRICAL = 'electrical',
    HVAC = 'hvac',
    APPLIANCE = 'appliance',
    STRUCTURAL = 'structural',
    GENERAL = 'general',
    OTHER = 'other'
}

export interface MaintenanceRequest {
    id: number;
    roomId: number | null; // Can be null if the request is not associated with a specific room
    tenantId: number | null; // Can be null if submitted by admin for vacant room
    room?: Room;       // Optional nested data
    tenant?: Tenant;   // Optional nested data
    category: MaintenanceCategory;
    description: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    submittedDate: string;
    assignedTo: string | null;
    scheduledDate: string | null;
    completedDate: string | null;
    notes?: string | null;
    images?: string[]; // URLs to images
}

export interface MaintenanceRequestFormData {
    roomId: number;
    category: MaintenanceCategory;
    description: string;
    priority: MaintenancePriority;
    notes?: string | null;
}

export interface MaintenanceUpdate {
    id: number;
    requestId: number;
    status: MaintenanceStatus;
    notes: string;
    updateDate: string;
    updatedBy: string;
} 