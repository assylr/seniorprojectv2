export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED'
}

export interface Assignment {
  id: number;
  tenantId: number;
  roomId: number;
  checkInDate: string; // use Date if you're parsing it, otherwise string
  expectedDepartureDate: string;
  actualDepartureDate: string | null;
  status: AssignmentStatus;
}
