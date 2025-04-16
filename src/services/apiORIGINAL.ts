import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    Building, BuildingFormData,
    Room, RoomFormData,
    Tenant, TenantFormData,
    Contract, ContractFormData, // <-- Added Contract types
    Payment, PaymentFormData,   // <-- Added Payment types
    BatchTenantData,
    BatchCheckOutData,
    UtilityRate,
    UtilityReading,
    UtilityBill,
    MaintenanceRequest, MaintenanceRequestData, MaintenanceRequestFormData, // <-- Added Maintenance Form Data
    MaintenanceUpdate
    // Remove imports for mockData, uuid, and potentially validation if handled elsewhere
} from './types'; // Assuming your revised types.ts is in place

// --- Axios Instance Setup ---

// 1. Get Base URL from Environment Variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("Error: VITE_API_BASE_URL is not defined in your environment variables (.env file).");
    // You might want to throw an error or provide a default fallback for local dev,
    // but failing loudly is often better during development.
}

// 2. Create an Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // You can add other default headers here if needed
    },
    // Optional: Set timeout
    // timeout: 10000, // 10 seconds
});

// 3. Axios Request Interceptor (for adding Auth Token)
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Retrieve the token from where you store it (e.g., localStorage)
        const token = localStorage.getItem('authToken'); // Adjust 'authToken' key if needed

        if (token) {
            // Ensure config.headers is defined before setting Authorization
             if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
             }
        }
        return config;
    },
    (error: AxiosError) => {
        // Handle request configuration errors
        console.error('Axios request error:', error);
        return Promise.reject(error);
    }
);

// 4. Axios Response Interceptor (Optional: for global error handling)
apiClient.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx causes this function to trigger
        return response;
    },
    (error: AxiosError) => {
        // Any status codes outside the range of 2xx causes this function to trigger
        console.error('Axios response error:', error.response?.data || error.message);

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { status } = error.response;

            if (status === 401) {
                // Unauthorized: Token expired or invalid
                console.error('Unauthorized access - 401. Redirecting to login.');
                // Clear invalid token
                localStorage.removeItem('authToken'); // Adjust 'authToken' key if needed
                // Redirect to login page - Ensure you have access to router history or use window.location
                window.location.href = '/login'; // Simple redirect, adjust if using React Router history
            } else if (status === 403) {
                // Forbidden: User does not have permission
                console.error('Forbidden - 403. User lacks permission.');
                // You might want to show a notification to the user
            } else {
                // Handle other server errors (4xx, 5xx)
                console.error(`API Error: ${status} - ${error.response.data}`);
            }
        } else if (error.request) {
            // The request was made but no response was received (e.g., network error)
            console.error('Network error or no response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }

        // Return a rejected promise to propagate the error to the calling function
        // You might want to return a more user-friendly error object here
        return Promise.reject(error.response?.data || new Error(error.message || 'An unknown API error occurred'));
    }
);


// --- API Functions ---
// Replace placeholder endpoints (`/buildings`, `/rooms/{id}`, etc.)
// with your actual backend API endpoints.

// == Buildings ==
export const getBuildings = async (): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>('/buildings'); // <-- Replace '/buildings'
    return response.data;
};

export const getBuildingById = async (id: number): Promise<Building> => {
    const response = await apiClient.get<Building>(`/buildings/${id}`); // <-- Replace '/buildings/{id}'
    return response.data;
};

export const createBuilding = async (buildingData: BuildingFormData): Promise<Building> => {
    const response = await apiClient.post<Building>('/buildings', buildingData); // <-- Replace '/buildings'
    return response.data;
};

export const updateBuilding = async (id: number, buildingData: Partial<BuildingFormData>): Promise<Building> => {
    const response = await apiClient.put<Building>(`/buildings/${id}`, buildingData); // Or PATCH: apiClient.patch(...) <-- Replace '/buildings/{id}'
    return response.data;
};

export const deleteBuilding = async (id: number): Promise<void> => {
    await apiClient.delete(`/buildings/${id}`); // <-- Replace '/buildings/{id}'
};

// == Rooms ==
export const getRooms = async (buildingId?: number): Promise<Room[]> => {
    // Adjust endpoint based on how your backend handles filtering
    const endpoint = buildingId ? `/rooms?buildingId=${buildingId}` : '/rooms'; // <-- Replace '/rooms' and query param
    const response = await apiClient.get<Room[]>(endpoint);
    return response.data;
};

export const getRoomById = async (id: number): Promise<Room> => {
    const response = await apiClient.get<Room>(`/rooms/${id}`); // <-- Replace '/rooms/{id}'
    return response.data;
};

export const createRoom = async (roomData: RoomFormData): Promise<Room> => {
    const response = await apiClient.post<Room>('/rooms', roomData); // <-- Replace '/rooms'
    return response.data;
};

export const updateRoom = async (id: number, roomData: Partial<RoomFormData>): Promise<Room> => {
    // Note: Backend should handle updating Building availability if all its rooms become occupied/vacant
    const response = await apiClient.put<Room>(`/rooms/${id}`, roomData); // Or PATCH <-- Replace '/rooms/{id}'
    return response.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`); // <-- Replace '/rooms/{id}'
};

// == Tenants ==
export const getTenants = async (): Promise<Tenant[]> => {
    const response = await apiClient.get<Tenant[]>('/tenants'); // <-- Replace '/tenants'
    return response.data;
};

export const getTenantById = async (id: number): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`); // <-- Replace '/tenants/{id}'
    return response.data;
};

export const createTenant = async (tenantData: TenantFormData): Promise<Tenant> => {
    // Validation should happen in the form/component *before* calling this
    const response = await apiClient.post<Tenant>('/tenants', tenantData); // <-- Replace '/tenants'
    // Note: Assigning a room is likely handled via Contract creation now.
    return response.data;
};

export const updateTenant = async (id: number, tenantData: Partial<TenantFormData>): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, tenantData); // Or PATCH <-- Replace '/tenants/{id}'
    return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
    // Be careful: Usually you 'deactivate' or 'check-out' tenants, not hard delete.
    // This might be an endpoint like PATCH /tenants/{id}/deactivate
    await apiClient.delete(`/tenants/${id}`); // <-- Replace '/tenants/{id}' or use appropriate endpoint
};


// == Contracts == (Assuming these types/endpoints exist)
export const getContracts = async (tenantId?: number): Promise<Contract[]> => {
    const endpoint = tenantId ? `/contracts?tenantId=${tenantId}` : '/contracts'; // <-- Replace '/contracts' and query param
    const response = await apiClient.get<Contract[]>(endpoint);
    return response.data;
};

export const getContractById = async (id: number): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`/contracts/${id}`); // <-- Replace '/contracts/{id}'
    return response.data;
};

export const createContract = async (contractData: ContractFormData): Promise<Contract> => {
    // Backend should validate room availability and mark it as occupied upon contract creation.
    const response = await apiClient.post<Contract>('/contracts', contractData); // <-- Replace '/contracts'
    return response.data;
};

export const updateContract = async (id: number, contractData: Partial<ContractFormData>): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${id}`, contractData); // Or PATCH <-- Replace '/contracts/{id}'
    return response.data;
};

// Example: Terminate a contract (likely a PATCH operation)
export const terminateContract = async (id: number, terminationDate: string): Promise<Contract> => {
     const response = await apiClient.patch<Contract>(`/contracts/${id}/terminate`, { terminationDate }); // <-- Example endpoint
     return response.data;
};

// == Payments == (Assuming these types/endpoints exist)
export const getPayments = async (contractId?: number): Promise<Payment[]> => {
    const endpoint = contractId ? `/payments?contractId=${contractId}` : '/payments'; // <-- Replace '/payments' and query param
    const response = await apiClient.get<Payment[]>(endpoint);
    return response.data;
};

export const recordPayment = async (paymentData: PaymentFormData): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/payments', paymentData); // <-- Replace '/payments'
    return response.data;
};

// == Batch Operations == (Adapt based on actual backend implementation)
// These likely need specific backend endpoints

export const batchCheckInTenants = async (batchData: BatchTenantData[]): Promise<any> => { // Return type depends heavily on backend response
    // Requires a dedicated backend endpoint e.g., POST /tenants/batch-check-in
    // The complex logic moves to the backend. Frontend just sends the data.
    console.warn("batchCheckInTenants: Ensure backend endpoint '/tenants/batch' exists and handles this request.");
    const response = await apiClient.post('/tenants/batch', batchData); // <-- Replace with actual batch endpoint
    return response.data; // Adjust based on what the backend returns (e.g., results array with status/errors)
};

export const batchCheckOutTenants = async (tenantIds: number[]): Promise<any> => { // Return type depends heavily on backend response
    // Requires a dedicated backend endpoint e.g., POST /contracts/batch-terminate or PATCH /tenants/batch-checkout
    console.warn("batchCheckOutTenants: Ensure backend endpoint exists and handles this request.");
    const response = await apiClient.post('/tenants/batch-checkout', { tenantIds }); // <-- Replace with actual batch endpoint and payload
    return response.data; // Adjust based on backend response
};


// == Utility Billing == (Adapt endpoints as needed)
export const getUtilityRates = async (): Promise<UtilityRate[]> => {
    const response = await apiClient.get<UtilityRate[]>('/utility-rates'); // <-- Replace '/utility-rates'
    return response.data;
};

export const getUtilityReadings = async (roomId?: number): Promise<UtilityReading[]> => {
    const endpoint = roomId ? `/utility-readings?roomId=${roomId}` : '/utility-readings'; // <-- Replace '/utility-readings'
    const response = await apiClient.get<UtilityReading[]>(endpoint);
    return response.data;
};

export const addUtilityReading = async (readingData: Omit<UtilityReading, 'id' | 'previousValue'>): Promise<UtilityReading> => {
    // Backend should calculate/store previousValue if needed
    const response = await apiClient.post<UtilityReading>('/utility-readings', readingData); // <-- Replace '/utility-readings'
    return response.data;
};

export const getUtilityBills = async (contractId?: number): Promise<UtilityBill[]> => {
    const endpoint = contractId ? `/utility-bills?contractId=${contractId}` : '/utility-bills'; // <-- Replace '/utility-bills'
    const response = await apiClient.get<UtilityBill[]>(endpoint);
    return response.data;
};

export const generateUtilityBill = async (contractId: number, billingPeriod: { startDate: string, endDate: string }): Promise<UtilityBill> => {
    // Logic moves to backend. Frontend just triggers generation.
    const response = await apiClient.post<UtilityBill>('/utility-bills/generate', { contractId, billingPeriod }); // <-- Replace endpoint
    return response.data;
};

export const updateBillStatus = async (billId: number, status: UtilityBill['status'], paymentDetails?: { paymentDate?: string, paymentId?: number }): Promise<UtilityBill> => {
    const response = await apiClient.patch<UtilityBill>(`/utility-bills/${billId}/status`, { status, ...paymentDetails }); // <-- Replace endpoint
    return response.data;
};

// == Maintenance == (Adapt endpoints as needed)
export const getMaintenanceRequests = async (filters?: { roomId?: number, status?: MaintenanceRequest['status'] }): Promise<MaintenanceRequest[]> => {
    const response = await apiClient.get<MaintenanceRequest[]>('/maintenance-requests', { params: filters }); // <-- Replace endpoint
    return response.data;
};

export const getMaintenanceRequestById = async (requestId: number): Promise<MaintenanceRequest> => {
    const response = await apiClient.get<MaintenanceRequest>(`/maintenance-requests/${requestId}`); // <-- Replace endpoint
    return response.data;
};

export const createMaintenanceRequest = async (requestData: MaintenanceRequestFormData): Promise<MaintenanceRequest> => {
    // Backend should handle creating initial update record if needed
    const response = await apiClient.post<MaintenanceRequest>('/maintenance-requests', requestData); // <-- Replace endpoint
    return response.data;
};

export const updateMaintenanceRequest = async (requestId: number, updateData: Partial<Omit<MaintenanceRequest, 'id' | 'submittedDate' | 'roomId' | 'tenantId'>>): Promise<MaintenanceRequest> => {
    // Backend should handle creating the MaintenanceUpdate record automatically
    const response = await apiClient.patch<MaintenanceRequest>(`/maintenance-requests/${requestId}`, updateData); // <-- Replace endpoint
    return response.data;
};

export const getMaintenanceUpdates = async (requestId: number): Promise<MaintenanceUpdate[]> => {
    const response = await apiClient.get<MaintenanceUpdate[]>(`/maintenance-requests/${requestId}/updates`); // <-- Replace endpoint
    return response.data;
};


// == Authentication == (Separate file recommended, but example here)
// It's better to move auth-related calls (login, logout, register, getProfile) to a dedicated `auth.ts` service file.

interface LoginResponse {
    token: string;
    user: Tenant; // Or a dedicated User type
}

export const login = async (credentials: { email: string, password: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials); // <-- Replace endpoint
    // IMPORTANT: Store the token after successful login
    if (response.data.token) {
        localStorage.setItem('authToken', response.data.token); // Adjust 'authToken' key if needed
        // Optionally: Set user data in context or local storage
        // localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = async (): Promise<void> => {
    // Optional: Call backend logout endpoint to invalidate token server-side
    // await apiClient.post('/auth/logout'); // <-- Replace endpoint

    // ALWAYS remove local token and user data
    localStorage.removeItem('authToken'); // Adjust 'authToken' key if needed
    localStorage.removeItem('userData'); // Adjust if you store user data

    // No need to return anything, redirect happens in UI based on auth state change
};

// --- End of API Functions ---

// Export the configured client if needed elsewhere (though usually not)
export { apiClient };