// Authentication service for the Housing Management System
// In a real application, this would connect to a backend API

// Mock admin users
const ADMIN_USERS = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123', // In a real app, passwords would never be stored in plaintext
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 2,
        username: 'manager',
        password: 'manager123',
        name: 'Housing Manager',
        role: 'admin'
    }
];

// User session interface
export interface UserSession {
    id: number;
    username: string;
    name: string;
    role: string;
    token: string;
}

// Login function
export const login = async (username: string, password: string): Promise<UserSession> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user
    const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
    
    if (!user) {
        throw new Error('Invalid username or password');
    }
    
    // Create session
    const session: UserSession = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        token: `mock-jwt-token-${Math.random().toString(36).substring(2, 15)}`
    };
    
    // Store in localStorage
    localStorage.setItem('user_session', JSON.stringify(session));
    
    return session;
};

// Logout function
export const logout = (): void => {
    localStorage.removeItem('user_session');
};

// Get current user session
export const getCurrentUser = (): UserSession | null => {
    const sessionData = localStorage.getItem('user_session');
    if (!sessionData) return null;
    
    try {
        return JSON.parse(sessionData) as UserSession;
    } catch (error) {
        console.error('Failed to parse user session:', error);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return getCurrentUser() !== null;
};

// Check if user has admin role
export const isAdmin = (): boolean => {
    const user = getCurrentUser();
    return user !== null && user.role === 'admin';
};
