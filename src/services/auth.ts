import { apiClient } from './api'; // Import the configured Axios instance
import { Tenant } from './types'; // Assuming Tenant contains user details like name, role, id
// Or define a specific User type if the backend returns something different:
// export interface UserProfile {
//   id: number;
//   username: string; // Or email
//   name: string; // Or firstName, lastName
//   role: 'admin' | 'staff'; // Adjust roles as needed
// }

// --- Constants for Storage Keys ---
const AUTH_TOKEN_KEY = 'authToken'; // Key for storing the JWT
const USER_DATA_KEY = 'userData';   // Key for storing user profile data

// --- Define Expected API Responses ---

// Matches the LoginResponse used in the api.ts example
interface LoginResponse {
    token: string;
    user: Tenant; // Or UserProfile if you defined one
}

// --- Authentication Functions ---

/**
 * Logs in the user by sending credentials to the backend.
 * Stores the received token and user data upon success.
 * @param username The user's username or email.
 * @param password The user's password.
 * @returns The user profile data from the backend.
 * @throws Throws an error if login fails (handled by Axios interceptor or caught here).
 */
export const login = async (username: string, password: string): Promise<Tenant> => { // Return Tenant or UserProfile
    try {
        // Replace '/auth/login' with your actual login endpoint
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            username: username, // Or 'email' depending on backend requirement
            password: password,
        });

        const { token, user } = response.data;

        if (!token || !user) {
            throw new Error('Login successful, but token or user data missing in response.');
        }

        // Store token and user data
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

        // Optional: You might want to set the token directly on the apiClient instance
        // if the interceptor doesn't pick it up immediately for subsequent requests
        // in the same synchronous block (usually not necessary).
        // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return user;

    } catch (error: unknown) {
        console.error('Login failed:', error);
        // Clear any potentially leftover stale data on failed login
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        // Re-throw the error so the calling component knows login failed.
        // The error might already be formatted by the Axios interceptor.
        throw error;
    }
};

/**
 * Logs out the user by removing local session data.
 * Optionally calls a backend endpoint to invalidate the token server-side.
 */
export const logout = async (): Promise<void> => {
    try {
        // Optional: Call backend logout endpoint first (replace '/auth/logout')
        // This might require the token, so call before removing it locally.
        await apiClient.post('/auth/logout');
        console.log('Server logout successful (if endpoint exists).');
    } catch (error) {
        // Log error but proceed with local logout regardless
        console.error('Server logout failed (if endpoint exists):', error);
    } finally {
        // ALWAYS remove local token and user data
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);

        // Optional: Clear the Authorization header from the default Axios instance
        // delete apiClient.defaults.headers.common['Authorization'];

        console.log('Local logout completed.');
        // No need to return anything. UI should react to the absence of auth state.
    }
};

/**
 * Retrieves the stored auth token.
 * @returns The token string or null if not found.
 */
export const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Retrieves the stored user profile data.
 * Note: This data might be stale if the profile was updated on the backend
 * after login. Consider fetching profile data fresh when needed for critical info.
 * @returns The user profile object (Tenant or UserProfile) or null.
 */
export const getCurrentUser = (): Tenant | null => { // Return Tenant or UserProfile
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;

    try {
        return JSON.parse(userData) as Tenant; // Or UserProfile
    } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Corrupted data, remove it
        localStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY); // Also remove token if user data is corrupt
        return null;
    }
};

/**
 * Checks if a user token exists in storage.
 * This is the primary check for potential authentication status.
 * @returns True if a token exists, false otherwise.
 */
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

/**
 * Checks if the currently stored user data indicates an admin role.
 * Relies on potentially stale data stored at login.
 * @returns True if user data exists and role is 'admin', false otherwise.
 */
export const isAdmin = (): boolean => {
    const user = getCurrentUser();
    // Adjust the role check based on your actual role names ('admin', 'manager', etc.)
    // Use optional chaining `?.` for safety.
    return user?.tenantType === 'faculty' || user?.position === 'manager' // Example: Check type or position? Adjust based on your 'Tenant' type logic for admin role.
    // OR if using UserProfile: return user?.role === 'admin';
};

// Optional: Function to fetch fresh user profile from backend
// export const fetchUserProfile = async (): Promise<Tenant | null> => { // Or UserProfile
//     if (!isAuthenticated()) {
//         return null; // Don't attempt if no token
//     }
//     try {
//         // Replace '/auth/me' with your actual profile endpoint
//         const response = await apiClient.get<Tenant>('/auth/me'); // Or UserProfile
//         // Update stored user data with fresh data
//         localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
//         return response.data;
//     } catch (error) {
//         console.error('Failed to fetch user profile:', error);
//         // If profile fetch fails (e.g., token expired), trigger logout?
//         // await logout(); // Uncomment this line for aggressive session clearing
//         return null;
//     }
// }