import type { Room } from "./room";
import { FamilyMember } from "./familyMember";

export type TenantType = 'FACULTY' | 'STAFF' | 'RENTOR';

// TenantDTO (basic)
export interface Tenant {
  id: number;
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  mobile: string;
  email: string;
  familyMembers: FamilyMember | null;
  // status: 

  room?: Room;
}

export interface TenantDetailDTO {
  id: number;
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  // mobile: string;
  // email: string;
  status: string; // calculated by backend: e.g., 'Active', 'Checked-out', 'Pending'
  checkInDate: string;
  expectedDepartureDate: string;
  roomId: number;
  roomNumber: number;
  buildingId: number;
  buildingName: string; 
}

export interface TenantFormData {
  name: string;
  surname: string;
  school: string | null;
  position: string | null;
  tenantType: TenantType;
  mobile: string;
  email: string;
  familyMembers: FamilyMember | null;

  // assignment
  checkInDate: string | null;
  expectedDepartureDate: string | null;
  roomId: number;

}