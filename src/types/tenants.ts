export type Tenant = {
  tenant_id: string;
  name: string;
  surname: string;
  school: string;
  position: string;
  tenant_type: string;
  mobile: string;
  email: string;
  arrival_date: string;
  departure_date: string | null;
  building_id: string;
  room_id: string;
};

export type NewTenant = Omit<Tenant, 'tenant_id' | 'departure_date'>;