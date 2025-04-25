import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import {
    Building,
    Room, RoomDetailDTO, RoomFormData, Tenant, TenantDetailDTO, TenantFormData
} from '@/types'

import { AUTH_TOKEN_KEY } from './auth';


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
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
  
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
                localStorage.removeItem(AUTH_TOKEN_KEY);
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Forbidden - 403. User lacks permission.');
            }
        }
        return Promise.reject(error.response?.data || new Error(error.message || 'An unknown API error occurred'));
    }
);

const handleAxiosResponse = <T>(response: AxiosResponse<T>): T => {
    // For successful responses (2xx), axios puts the data directly in response.data
    return response.data;
};

const handleAxiosError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as AxiosError<any>; // Type assertion for more specific access
        let errorMessage = `API Error: ${axiosError.message}`; // Default message

        // Check if the error response has data and a message property
        if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            // Adjust based on your backend error structure (e.g., errorData.message, errorData.error)
            errorMessage = errorData?.message || errorData?.error || errorMessage;
        } else if (axiosError.request) {
            // The request was made but no response was received (network error, timeout)
            errorMessage = 'Network Error: No response received from server.';
        }
        // Log the detailed error
        console.error(`API Request Failed: ${errorMessage}`, axiosError.config?.url, axiosError.response?.status, axiosError.response?.data);
        // Return a standard Error object with the extracted message
        return new Error(errorMessage);
    } else {
        // Handle non-Axios errors (e.g., setup errors, synchronous errors)
        console.error('An unexpected error occurred:', error);
        return error instanceof Error ? error : new Error('An unknown error occurred.');
    }
};



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
export const getRooms = async (): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>('/rooms');
    return response.data;
};


export const getRoomDetails = async (params: URLSearchParams): Promise<RoomDetailDTO[]> => {
    const endpoint = '/rooms/view'; // Relative to baseURL
    console.log(`Fetching rooms from: ${apiClient.defaults.baseURL}${endpoint}?${params.toString()}`); // For debugging
    try {
        const response = await apiClient.get<RoomDetailDTO[]>(endpoint, {
            params: params,
        });
        return handleAxiosResponse(response);
    } catch (error) {
        throw handleAxiosError(error);
    }
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

export const getTenantDetails = async (params: URLSearchParams): Promise<TenantDetailDTO[]> => {
    const endpoint = '/tenants/view'; // Endpoint for the tenant DTO list
    console.log(`Fetching tenants from: ${apiClient.defaults.baseURL}${endpoint}?${params.toString()}`);

    try {
        const response = await apiClient.get<TenantDetailDTO[]>(endpoint, {
            params: params, // Pass URLSearchParams directly
        });
        return handleAxiosResponse(response);
    } catch (error) {
        throw handleAxiosError(error); // Process and re-throw the standardized error
    }
};

export const createTenant = async (tenantData: TenantFormData): Promise<TenantDetailDTO> => {
    const response = await apiClient.post<TenantDetailDTO>('/tenants', tenantData);
    return response.data;
};

export const checkOutTenant = async (tenantId: number): Promise<void> => {
    const endpoint = `/tenants/${tenantId}/checkout`;
    console.log(`Checking out tenant from: ${apiClient.defaults.baseURL}${endpoint}`);

    try {
        await apiClient.post(endpoint);
        return;
    } catch (error) {
        throw handleAxiosError(error);
    }
};

export const updateTenant = async (id: number, tenantData: Partial<TenantFormData>): Promise<TenantDetailDTO> => {
    const response = await apiClient.put<TenantDetailDTO>(`/tenants/${id}`, tenantData);
    return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
};

export { apiClient }
