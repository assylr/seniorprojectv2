// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
// --- >>> Import Mock Data <<< ---
import {
    mockBuildings,
    mockRooms,
    mockTenants,
    // mockContracts, // Uncomment if needed
    // mockPayments, // Uncomment if needed
    getNextTenantId, // Import ID generator
    // getNextRoomId, // Import if mocking room creation
} from './mockData';
// --- >>> Make sure to import TenantFormData etc. from './types' as before <<< ---
import {
    Building, BuildingFormData, Room, RoomFormData, Tenant, TenantFormData,
    Contract, ContractFormData, Payment, PaymentFormData, /* ... other types ... */
} from '@/types';

// --- Axios Instance Setup --- (Keep this section as is)
// ... apiClient setup ...
// ... interceptors ...

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



// --- API Functions (Modified for Mocking) ---

const MOCK_DELAY = 300; // Simulate network delay (milliseconds)

// --- Buildings ---
export const getBuildings = async (): Promise<Building[]> => {
    console.log("MOCK API: getBuildings called");
    // ** MOCK IMPLEMENTATION **
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY)); // Simulate delay
    // Return a deep copy to prevent direct mutation issues if needed elsewhere
    return Promise.resolve(JSON.parse(JSON.stringify(mockBuildings)));
    // ** ORIGINAL IMPLEMENTATION (Commented Out) **
    // const response = await apiClient.get<Building[]>('/buildings');
    // return response.data;
};
// ... (getBuildingById - implement mock if needed)

// --- Rooms ---
export const getRooms = async (buildingId?: number): Promise<Room[]> => {
    console.log(`MOCK API: getRooms called (buildingId: ${buildingId})`);
    // ** MOCK IMPLEMENTATION **
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY)); // Simulate delay
    let roomsToReturn = JSON.parse(JSON.stringify(mockRooms));
    if (buildingId) {
        roomsToReturn = roomsToReturn.filter((room: Room) => room.buildingId === buildingId);
    }
    return Promise.resolve(roomsToReturn);
    // ** ORIGINAL IMPLEMENTATION (Commented Out) **
    // const endpoint = buildingId ? `/rooms?buildingId=${buildingId}` : '/rooms';
    // const response = await apiClient.get<Room[]>(endpoint);
    // return response.data;
};
// ... (getRoomById, createRoom, updateRoom, deleteRoom - implement mocks if needed)
// Example mock updateRoom to toggle availability:
export const updateRoom = async (id: number, roomData: Partial<RoomFormData>): Promise<Room> => {
     console.log("MOCK API: updateRoom called", id, roomData);
     await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
     const roomIndex = mockRooms.findIndex(r => r.id === id);
     if (roomIndex === -1) throw new Error("Mock Room not found");
     // Update properties - direct mutation for simplicity in mocking
     mockRooms[roomIndex] = { ...mockRooms[roomIndex], ...roomData };
     console.log("Mock room updated:", mockRooms[roomIndex]);
     return Promise.resolve(JSON.parse(JSON.stringify(mockRooms[roomIndex])));
};


// --- Tenants ---
export const getTenants = async (): Promise<Tenant[]> => {
    console.log("MOCK API: getTenants called");
    // ** MOCK IMPLEMENTATION **
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY)); // Simulate delay
    return Promise.resolve(JSON.parse(JSON.stringify(mockTenants)));
    // ** ORIGINAL IMPLEMENTATION (Commented Out) **
    // const response = await apiClient.get<Tenant[]>('/tenants');
    // return response.data;
};

export const createTenant = async (tenantData: TenantFormData): Promise<Tenant> => {
    console.log("MOCK API: createTenant called", tenantData);
    // ** MOCK IMPLEMENTATION **
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    if (!tenantData.roomId) { // Basic validation check
        throw new Error("Mock Error: Room ID is required for creating tenant.");
    }
    // Find the room to update its status
    const roomIndex = mockRooms.findIndex(r => r.id === tenantData.roomId);
    if (roomIndex === -1) throw new Error("Mock Error: Selected room not found.");
    if (!mockRooms[roomIndex].isAvailable) throw new Error("Mock Error: Selected room is already occupied.");

    // Create new tenant
    const newTenant: Tenant = {
        id: getNextTenantId(), // Use generated ID
        firstName: tenantData.firstName,
        lastName: tenantData.lastName,
        schoolOrDepartment: tenantData.schoolOrDepartment ?? null,
        position: tenantData.position ?? null,
        tenantType: tenantData.tenantType,
        mobile: tenantData.mobile ?? null,
        email: tenantData.email ?? null,
        currentRoomId: tenantData.roomId, // Assign the room
        arrivalDate: tenantData.arrivalDate ? new Date(tenantData.arrivalDate) : new Date(), // Default arrival if not provided
        expectedDepartureDate: tenantData.expectedDepartureDate ? new Date(tenantData.expectedDepartureDate) : null,
        // currentRoom might not be needed if we look it up, depends on type def
    };

    // Simulate database update (mutate mock data directly - ONLY FOR MOCKING)
    mockTenants.push(newTenant);
    mockRooms[roomIndex].isAvailable = false; // Mark room as occupied

    console.log("MOCK API: Tenant created, Room updated", { newTenant, updatedRoom: mockRooms[roomIndex] });
    return Promise.resolve(JSON.parse(JSON.stringify(newTenant))); // Return deep copy

    // ** ORIGINAL IMPLEMENTATION (Commented Out) **
    // const response = await apiClient.post<Tenant>('/tenants', tenantData);
    // return response.data;
};

export const updateTenant = async (id: number, tenantData: Partial<TenantFormData>): Promise<Tenant> => {
    console.log("MOCK API: updateTenant called", id, tenantData);
     // ** MOCK IMPLEMENTATION **
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const tenantIndex = mockTenants.findIndex(t => t.id === id);
    if (tenantIndex === -1) {
        throw new Error("Mock Error: Tenant not found");
    }

    const originalTenant = mockTenants[tenantIndex];
    const oldRoomId = originalTenant.currentRoomId;

    // Simulate update (mutate mock data directly - ONLY FOR MOCKING)
    // Convert date strings back to Date objects if present
    const updatedTenantData = { ...tenantData };
    if (tenantData.arrivalDate) updatedTenantData.arrivalDate = new Date(tenantData.arrivalDate).toDateString();
    if (tenantData.expectedDepartureDate) updatedTenantData.expectedDepartureDate = new Date(tenantData.expectedDepartureDate).toDateString();

    mockTenants[tenantIndex] = { ...originalTenant, ...updatedTenantData };
    const updatedTenant = mockTenants[tenantIndex];

    // --- Simulate room availability changes ---
    const newRoomId = updatedTenant.currentRoomId;

    // Case 1: Room changed
    if (newRoomId !== oldRoomId) {
        // Make old room available (if it existed)
        if (oldRoomId) {
            const oldRoomIndex = mockRooms.findIndex(r => r.id === oldRoomId);
            if (oldRoomIndex !== -1) mockRooms[oldRoomIndex].isAvailable = true;
        }
        // Make new room unavailable (if assigned)
        if (newRoomId) {
            const newRoomIndex = mockRooms.findIndex(r => r.id === newRoomId);
            if (newRoomIndex === -1) throw new Error("Mock Error: New room not found");
            if (!mockRooms[newRoomIndex].isAvailable && mockRooms[newRoomIndex].id !== oldRoomId) throw new Error("Mock Error: New room is already occupied");
            mockRooms[newRoomIndex].isAvailable = false;
        }
    }

    // Case 2: Check-out (Departure date set)
    if (tenantData.expectedDepartureDate && newRoomId) { // Make room available on checkout
         const roomIndex = mockRooms.findIndex(r => r.id === newRoomId);
         if (roomIndex !== -1) mockRooms[roomIndex].isAvailable = true;
         console.log("MOCK API: Marked room as available due to check-out", mockRooms[roomIndex]);
    }
    // --- End room simulation ---

    console.log("MOCK API: Tenant updated", updatedTenant);
    return Promise.resolve(JSON.parse(JSON.stringify(updatedTenant))); // Return deep copy

    // ** ORIGINAL IMPLEMENTATION (Commented Out) **
    // const response = await apiClient.put<Tenant>(`/tenants/${id}`, tenantData);
    // return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
    console.log("MOCK API: deleteTenant called", id);
     // ** MOCK IMPLEMENTATION **
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const tenantIndex = mockTenants.findIndex(t => t.id === id);
    if (tenantIndex === -1) {
        throw new Error("Mock Error: Tenant not found for deletion");
    }
    const tenantToDelete = mockTenants[tenantIndex];
    const roomId = tenantToDelete.currentRoomId;

    // Simulate deletion (mutate mock data directly - ONLY FOR MOCKING)
    mockTenants.splice(tenantIndex, 1);

    // Make room available if tenant was occupying one
    if (roomId) {
        const roomIndex = mockRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) mockRooms[roomIndex].isAvailable = true;
         console.log("MOCK API: Marked room as available due to tenant deletion", mockRooms[roomIndex]);
    }

    console.log("MOCK API: Tenant deleted", id);
    return Promise.resolve();

    // ** ORIGINAL IMPLEMENTATION (Commented Out) **
    // await apiClient.delete(`/tenants/${id}`);
};


// --- Contracts / Payments / etc ---
// Add mock implementations for getContracts, createContract, recordPayment etc.
// if you need to test features that depend on them, following similar patterns.
// Example:
export const getContracts = async (tenantId?: number): Promise<Contract[]> => {
    console.log("MOCK API: getContracts called");
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    // return Promise.resolve(JSON.parse(JSON.stringify(mockContracts))); // If using mockContracts
     return Promise.resolve([]); // Return empty array if not mocking contracts yet
};
export const createContract = async (contractData: ContractFormData): Promise<Contract> => {
    console.log("MOCK API: createContract called", contractData);
     await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
     throw new Error("Mock createContract not fully implemented yet"); // Or implement full mock
};
// ... other mocks


// --- Authentication --- (Update auth.ts similarly if needed)


// Keep Axios client export
export { apiClient };