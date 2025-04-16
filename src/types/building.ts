export type BuildingType = "apartment" | "townhouse" | "cottage";

export interface Building {
  id: number;
  buildingType: BuildingType;
  buildingNumber: string;
  floorCount: number | null;
  totalArea: number | null;
}
