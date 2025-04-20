import type { Room } from "./room";

export type TenantType = 'faculty' | 'staff' | 'rentor';

export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  schoolOrDepartment: string | null;
  position: string | null;
  tenantType: TenantType;
  mobile: string | null;
  email: string | null;
  currentRoomId: number | null;
  arrivalDate: Date | null;
  expectedDepartureDate: Date | null;
  currentRoom?: Room;
}

export interface TenantFormData {
  // ... other fields (firstName, lastName, tenantType, etc.) ...
  firstName: string;
  lastName: string;
  schoolOrDepartment: string | null;
  position: string | null;
  tenantType: 'faculty' | 'staff';
  mobile: string | null;
  email: string | null;
  arrivalDate: string | null;
  expectedDepartureDate: string | null;

  // Add roomId - make it optional initially for edit mode where room isn't changed,
  // but required logically for *new* check-ins. Validation schema will enforce.
  roomId: number | null; // Store the selected room ID
}