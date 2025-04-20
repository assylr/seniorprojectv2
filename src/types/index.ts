export interface Building {
  building_id: string;
  building_number: string;
}

export interface Room {
  room_id: string;
  room_number: string;
  building_id: string;
  floor_number: string;
  bedroom_count: number;
  total_area: number;
  available: boolean;
}

export interface Tenant {
  tenant_id: string;
  room_id: string;
  building_id: string;
  name: string;
  surname: string;
  tenant_type: string;
  school?: string;
  position?: string;
  mobile?: string;
  email?: string;
  arrival_date: string;
  departure_date: string | null;
}

export interface NewTenant {
  name: string;
  surname: string;
  school: string;
  position: string;
  tenant_type: string;
  mobile: string;
  email: string;
  arrival_date: string;
  building_id: string;
  room_id: string;
} 