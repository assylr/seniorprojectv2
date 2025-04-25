import type { Room } from "./room";
import { FamilyMember } from "./familyMember";

export enum TenantType {
  FACULTY = 'FACULTY',
  RENTER = 'RENTER'
}

export enum TenantStatusType {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  PENDING = 'PENDING'
}

// Tenant Entity from spring boot models
export interface Tenant {
  id: number;
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  status: TenantStatusType;
  mobile: string;
  email: string;
  arrivalDate: string; // ISO date string
  departureDate: string | null; // ISO date string
  visitingGuests: string | null;
  deposit: number;
  room: Room;
  familyMembers: FamilyMember[] | null;
}

// Tenant Detail DTO
export interface TenantDetailDTO extends Omit<Tenant, 'room'> {
  roomId: number;
  roomNumber: string;
  buildingId: number;
  buildingName: string;
}

// Matches TenantCheckInRequest DTO from backend
export interface TenantFormData {
  // Basic Tenant Info
  name: string;
  surname: string;
  mobile: string;
  email: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;

  // Room and Building Info
  buildingId: number | null;  // Optional
  roomId: number;            // Required

  // Check-in Additional Info
  arrivalDate: string | null;     // Optional
  departureDate: string | null;   // Optional
  visitingGuests: string | null;  // Optional
  deposit: number | null;         // Optional
}
