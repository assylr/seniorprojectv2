import { TenantData } from "./types";

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};

export const validateTenantData = (data: TenantData): void => {
    if (!data.name?.trim()) throw new Error('Name is required');
    if (!data.surname?.trim()) throw new Error('Surname is required');
    if (!data.tenant_type) throw new Error('Tenant type is required');
    if (!data.room_id) throw new Error('Room is required');
    if (data.email && !validateEmail(data.email)) throw new Error('Invalid email format');
    if (data.mobile && !validatePhone(data.mobile)) throw new Error('Invalid phone format');
};
