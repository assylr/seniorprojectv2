// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
// --- >>> Import Mock Data <<< ---
// import {
//     mockBuildings,
//     mockRooms,
//     mockTenants,
//     getNextTenantId,
// } from './mockData';
import {
    Building,
    Contract, ContractFormData,
    Room, RoomFormData, Tenant, TenantFormData
} from '@/types'

// --- Axios Instance Setup ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("Error: VITE_API_BASE_URL is not defined in your environment variables (.env file).");
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken');
  
      // ❌ Don't send token if logging in or registering
      if (
        token &&
        !config.url?.includes('/auth/login') &&
        !config.url?.includes('/auth/register')
      ) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error: AxiosError) => {
      console.error('Axios request error:', error);
      return Promise.reject(error);
    }
  );
  

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('Axios response error:', error.response?.data || error.message);
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Forbidden - 403. User lacks permission.');
            }
        }
        return Promise.reject(error.response?.data || new Error(error.message || 'An unknown API error occurred'));
    }
);

export const setAuthToken = (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

// --- API Functions ---

// --- Buildings ---
export const getBuildings = async (): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>('/buildings');
    return response.data;
};

// --- Rooms ---
export const getRooms = async (buildingId?: number): Promise<Room[]> => {
    const endpoint = buildingId ? `/rooms?buildingId=${buildingId}` : '/rooms';
    const response = await apiClient.get<Room[]>(endpoint);
    return response.data;
};

export const updateRoom = async (id: number, roomData: Partial<RoomFormData>): Promise<Room> => {
    const response = await apiClient.patch<Room>(`/rooms/${id}`, roomData);
    return response.data;
};

// --- Tenants ---
export const getTenants = async (): Promise<Tenant[]> => {
    const response = await apiClient.get<Tenant[]>('/tenants');
    return response.data;
};

export const createTenant = async (tenantData: TenantFormData): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>('/tenants', tenantData);
    return response.data;
};

export const updateTenant = async (
    id: number,
    tenantData: Partial<TenantFormData>
): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`/tenants/${id}/checkout`, tenantData);
    return response.data;
};


export const deleteTenant = async (id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
};

// --- Contracts ---
export const getContracts = async (tenantId?: number): Promise<Contract[]> => {
    const endpoint = tenantId ? `/contracts?tenantId=${tenantId}` : '/contracts';
    const response = await apiClient.get<Contract[]>(endpoint);
    return response.data;
};

export const createContract = async (contractData: ContractFormData): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/contracts', contractData);
    return response.data;
};

// Keep Axios client export
export { apiClient }
