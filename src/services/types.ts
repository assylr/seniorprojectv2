export interface Building {
    id: number;
    buildingType: "apartment" | "townhouse" | "cottage";
    buildingNumber: string;
    floorCount: number | null;
    totalArea: number | null;
    available: boolean;
}

export interface Room {
    id: number;
    building: Building;
    roomNumber: string;  // Add format validation
    bedroomCount: number;
    totalArea: number;
    floorNumber: number;
    available: boolean;
}

export interface Tenant {
    tenant_id: number;
    name: string;
    surname: string;
    school?: string;
    position?: string;
    tenant_type: 'renter' | 'faculty';
    mobile?: string;
    email?: string;
    room: Room;
    building: Building;
    arrival_date: string;  // Should use proper date format
    departure_date: string | null;
}

export interface TenantData {
    name: string;
    surname: string;
    school?: string;
    position?: string;
    roomId: number;
    tenant_type: 'renter' | 'faculty';
    mobile?: string;
    email?: string;
}

