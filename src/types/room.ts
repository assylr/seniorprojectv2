import type { Building } from "./building";

export interface Room {
  id: number;
  buildingId: number;
  roomNumber: string;
  bedroomCount: number;
  totalArea: number;
  floorNumber: number | null;
  isAvailable: boolean;
  baseRent: number | null;
  building?: Building;
}
