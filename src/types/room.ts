export type StatusType = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

// RoomDTO (base)
export interface Room {
  id: number;
  roomNumber: string;
  bedroomCount: number;
  totalArea: number;
  floorNumber: number;
  status: StatusType | 'AVAILABLE'

  buildingId: number;
}

export interface RoomDetailDTO {
  id: number;
  roomNumber: string;
  bedroomCount: number;
  totalArea: number;
  floorNumber: number;
  status: StatusType | 'AVAILABLE';

  buildingId: number;
  buildingName: string;
  currentOccupancyCount: number;
}

// TODO: Adjust it according to Room
export interface RoomFormData {
  buildingId: number;
  roomNumber: string;
  bedroomCount: number;
  totalArea: number;
  floorNumber: number | null;
  isAvailable: boolean;
  baseRent: number | null;
}