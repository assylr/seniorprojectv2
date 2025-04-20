import { Tenant } from '../types/tenants'
import { api } from './api'

export const getTenants = async (): Promise<Tenant[]> => {
  const { data } = await api.get('/tenants');
  return data;
};

export const checkInTenant = async (tenant: Partial<Tenant>) => {
  await api.post('/tenants/check-in', tenant);
};

export const checkOutTenant = async (tenantId: string) => {
  await api.post(`/tenants/${tenantId}/check-out`);
};
