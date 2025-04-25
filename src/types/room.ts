export enum StatusType {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE'
}

// RoomDTO
export interface Room {
  id: number;
  buildingId: number;
  roomNumber: string;
  bedroomCount: number;
  totalArea: number;
  floorNumber: number;
  status: StatusType | 'AVAILABLE'
}

// Room Detail
export interface RoomDetailDTO extends Room {
  buildingName: string;
  currentOccupancyCount: number;
}

// For editing Room
export interface RoomFormData {
  buildingId: number;
  roomNumber: string;
  bedroomCount: number;
  totalArea: number;
  floorNumber: number | null;
  status: StatusType;
}