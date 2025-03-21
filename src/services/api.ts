import { Building, Room, Tenant, TenantData } from './types';
import { MOCK_DATA } from './mockData';
import { v4 as uuidv4 } from 'uuid';
import { validateTenantData } from './validation';

// Initialize localStorage with mock data if empty
const initializeMockData = (): void => {
    if (!localStorage.getItem('buildings')) {
        localStorage.setItem('buildings', JSON.stringify(MOCK_DATA.buildings));
    }
    if (!localStorage.getItem('rooms')) {
        localStorage.setItem('rooms', JSON.stringify(MOCK_DATA.rooms));
    }
    if (!localStorage.getItem('tenants')) {
        localStorage.setItem('tenants', JSON.stringify(MOCK_DATA.tenants));
    }
};

initializeMockData();

export const getBuildings = async (): Promise<Building[]> => {
    return JSON.parse(localStorage.getItem('buildings') || '[]') as Building[];
};

export const getRooms = async (): Promise<Room[]> => {
    return JSON.parse(localStorage.getItem('rooms') || '[]') as Room[];
};

export const getTenants = async (): Promise<Tenant[]> => {
    return JSON.parse(localStorage.getItem('tenants') || '[]') as Tenant[];
};

export const updateRoomAvailability = async (roomId: number, isAvailable: boolean): Promise<void> => {
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]') as Room[];
    
    const updatedRooms = rooms.map(room => 
        room.id === roomId 
            ? { ...room, available: isAvailable }
            : room
    );
    
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        const buildings = JSON.parse(localStorage.getItem('buildings') || '[]') as Building[];
        const updatedBuildings = buildings.map(building => {
            if (building.id === room.building.id) {
                const hasAvailableRooms = updatedRooms
                    .some(r => r.building.id === building.id && r.available);
                return { ...building, available: hasAvailableRooms };
            }
            return building;
        });
        localStorage.setItem('buildings', JSON.stringify(updatedBuildings));
    }
};

export const checkInTenant = async (tenantData: TenantData): Promise<Tenant> => {
    // Validate input data
    validateTenantData(tenantData);

    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]') as Room[];
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]') as Tenant[];
    
    // Validate room
    const room = rooms.find(r => r.id === tenantData.roomId);
    if (!room) throw new Error('Room not found');
    if (!room.available) throw new Error('Room is not available');

    // Check for existing active tenant
    const existingTenant = tenants.find(t => 
        !t.departure_date && 
        t.room.id === tenantData.roomId
    );
    if (existingTenant) throw new Error('Room already occupied');

    // Create new tenant with secure ID
    const newTenant: Tenant = {
        tenant_id: parseInt(uuidv4().replace(/-/g, '').slice(0, 8), 16), // Generate numeric ID from UUID
        name: tenantData.name.trim(),
        surname: tenantData.surname.trim(),
        school: tenantData.school?.trim(),
        position: tenantData.position?.trim(),
        tenant_type: tenantData.tenant_type,
        mobile: tenantData.mobile?.trim(),
        email: tenantData.email?.toLowerCase().trim(),
        room: room,
        building: room.building,
        arrival_date: new Date().toISOString(),
        departure_date: null
    };

    try {
        // Atomic update
        const updatedTenants = [...tenants, newTenant];
        localStorage.setItem('tenants', JSON.stringify(updatedTenants));
        await updateRoomAvailability(room.id, false);
        return newTenant;
    } catch (error) {
        // Rollback on failure
        await updateRoomAvailability(room.id, true);
        throw new Error('Failed to check in tenant due to: ' + error);
    }
};

export const checkOutTenant = async (tenantId: number): Promise<void> => {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]') as Tenant[];
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    
    if (!tenant) {
        throw new Error('Tenant not found');
    }

    const updatedTenants = tenants.map(t => 
        t.tenant_id === tenantId 
            ? { ...t, departure_date: new Date().toISOString() }
            : t
    );
    
    localStorage.setItem('tenants', JSON.stringify(updatedTenants));
    await updateRoomAvailability(tenant.room.id, true);
};

export const resetMockData = (): void => {
    localStorage.setItem('buildings', JSON.stringify(MOCK_DATA.buildings));
    localStorage.setItem('rooms', JSON.stringify(MOCK_DATA.rooms));
    localStorage.setItem('tenants', JSON.stringify([]));
};
