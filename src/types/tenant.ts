import type { Room } from "./room";
import { FamilyMember } from "./familyMember";

export type TenantType = 'FACULTY' | 'STAFF' | 'RENTOR';
export type TenantStatus = 'ACTIVE' | 'CHECKED_OUT' | 'PENDING';

/** Base tenant information */
export interface Tenant {
  id: number;
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  mobile: string;
  email: string;
  status: TenantStatus;
  familyMembers: FamilyMember[] | null;
  room?: Room;
}

/** Detailed tenant information including room and building details */
export interface TenantDetailDTO extends Omit<Tenant, 'room'> {
  checkInDate: string;  // ISO date string
  expectedDepartureDate: string;  // ISO date string
  roomId: number;
  roomNumber: string;
  buildingId: number;
  buildingName: string;
}

/** Data structure for tenant creation/update forms */
export interface TenantFormData {
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  mobile: string;
  email: string;
  familyMembers: FamilyMember[] | null;
  checkInDate: string | null;
  expectedDepartureDate: string | null;
  roomId: number;
}