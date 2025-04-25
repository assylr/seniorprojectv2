import type { Room } from "./room";
import { FamilyMember } from "./familyMember";

export enum TenantType {
  FACULTY = 'FACULTY',
  RENTOR = 'RENTER'
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

// Tenant Form Data
export interface TenantFormData {
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  mobile: string;
  email: string;
  arrivalDate: string; // ISO date string
  departureDate: string | null; // ISO date string
  visitingGuests: string | null;
  deposit: number;
  familyMembers: FamilyMember[] | null;
}
