export interface Building {
  id: string;
  buildingNumber: string;
  buildingType: string;
  floorCount?: number;
  totalArea?: number;
  available?: boolean;
}