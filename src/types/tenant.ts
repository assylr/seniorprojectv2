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
