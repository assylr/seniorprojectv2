import type { Tenant } from "./tenant";
import type { Room } from "./room";

export type ContractStatus = 'active' | 'expired' | 'terminated' | 'pending';

export interface Contract {
  id: number;
  tenantId: number;
  roomId: number;
  tenant?: Tenant;
  room?: Room;
  startDate: Date;
  endDate: Date;
  monthlyRentAmount: number;
  status: ContractStatus;
  
  leaseDocumentUrl?: string | null;
  notes?: string | null;
}
