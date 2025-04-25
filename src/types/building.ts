export type BuildingType = "APARTMENT" | "TOWNHOUSE" | "COTTAGE";

export interface Building {
  id: number;
  buildingType: BuildingType;
  buildingNumber: string;
  floorCount: number | null;
  totalArea: number | null;
}

export interface BuildingFormData {
  buildingType: BuildingType;
  buildingNumber: string;
  floorCount: number | null;
  totalArea: number | null;
}