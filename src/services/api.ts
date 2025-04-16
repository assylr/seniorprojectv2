import { Building, Room, Tenant, TenantData, BatchTenantData, BatchCheckOutData, UtilityRate, UtilityReading, UtilityBill, UtilityBillItem, MaintenanceRequest, MaintenanceRequestData, MaintenanceUpdate } from './types';
import { MOCK_DATA } from './mockData';
import { v4 as uuidv4 } from 'uuid';
import { validateTenantData, validateEmail, validatePhone } from './validation';

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
    if (!localStorage.getItem('utilityRates')) {
        localStorage.setItem('utilityRates', JSON.stringify(MOCK_DATA.utilityRates));
    }
    if (!localStorage.getItem('utilityReadings')) {
        localStorage.setItem('utilityReadings', JSON.stringify(MOCK_DATA.utilityReadings));
    }
    if (!localStorage.getItem('utilityBills')) {
        localStorage.setItem('utilityBills', JSON.stringify(MOCK_DATA.utilityBills));
    }
    if (!localStorage.getItem('maintenanceRequests')) {
        localStorage.setItem('maintenanceRequests', JSON.stringify(MOCK_DATA.maintenanceRequests));
    }
    if (!localStorage.getItem('maintenanceUpdates')) {
        localStorage.setItem('maintenanceUpdates', JSON.stringify(MOCK_DATA.maintenanceUpdates));
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
    const room = rooms.find(r => r.id === tenantData.room_id);
    if (!room) throw new Error('Room not found');
    if (!room.available) throw new Error('Room is not available');

    // Check for existing active tenant
    const existingTenant = tenants.find(t =>
        !t.departure_date &&
        t.room.id === tenantData.room_id
    );
    if (existingTenant) throw new Error('Room already occupied');

    // Create new tenant with secure ID
    const newTenant: Tenant = {
        id: parseInt(uuidv4().replace(/-/g, '').slice(0, 8), 16), // Generate numeric ID from UUID
        name: tenantData.name.trim(),
        surname: tenantData.surname.trim(),
        school: tenantData.school?.trim(),
        position: tenantData.position?.trim(),
        tenant_type: tenantData.tenant_type,
        mobile: tenantData.mobile?.trim(),
        email: tenantData.email?.toLowerCase().trim(),
        room: room,
        arrival_date: new Date(),
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
    const tenant = tenants.find(t => t.id === tenantId);

    if (!tenant) {
        throw new Error('Tenant not found');
    }

    const updatedTenants = tenants.map(t =>
        t.id === tenantId
            ? { ...t, departure_date: new Date() }
            : t
    );

    localStorage.setItem('tenants', JSON.stringify(updatedTenants));
    await updateRoomAvailability(tenant.room.id, true);
};

// Batch operations
export const batchCheckInTenants = async (batchData: BatchTenantData[]): Promise<BatchTenantData[]> => {
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]') as Room[];
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]') as Tenant[];
    const results: BatchTenantData[] = [...batchData];
    const successfulCheckIns: Tenant[] = [];
    const roomsToUpdate: number[] = [];

    // Process each tenant in the batch
    for (let i = 0; i < results.length; i++) {
        const tenantData = results[i];

        try {
            // Skip entries that already have a status (from previous attempts)
            if (tenantData.status) continue;

            // Validate tenant data
            if (!tenantData.name?.trim()) throw new Error('Name is required');
            if (!tenantData.surname?.trim()) throw new Error('Surname is required');
            if (!tenantData.tenant_type) throw new Error('Tenant type is required');
            if (!tenantData.room_id) throw new Error('Room is required');
            if (tenantData.email && !validateEmail(tenantData.email)) throw new Error('Invalid email format');
            if (tenantData.mobile && !validatePhone(tenantData.mobile)) throw new Error('Invalid phone format');

            // Validate room
            const room = rooms.find(r => r.id === tenantData.room_id);
            if (!room) throw new Error('Room not found');
            if (!room.available) throw new Error('Room is not available');

            // Check for existing active tenant
            const existingTenant = tenants.find(t =>
                !t.departure_date &&
                t.room.id === tenantData.room_id
            );
            if (existingTenant) throw new Error('Room already occupied');

            // Create new tenant
            const newTenant: Tenant = {
                id: parseInt(uuidv4().replace(/-/g, '').slice(0, 8), 16),
                name: tenantData.name.trim(),
                surname: tenantData.surname.trim(),
                school: tenantData.school?.trim(),
                position: tenantData.position?.trim(),
                tenant_type: tenantData.tenant_type,
                mobile: tenantData.mobile?.trim(),
                email: tenantData.email?.toLowerCase().trim(),
                room: room,
                arrival_date: new Date(),
                departure_date: null
            };

            // Mark for success
            successfulCheckIns.push(newTenant);
            roomsToUpdate.push(room.id);
            results[i] = { ...tenantData, status: 'success' };

        } catch (error) {
            // Mark as error with message
            results[i] = {
                ...tenantData,
                status: 'error',
                error_message: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // If any successful check-ins, update storage
    if (successfulCheckIns.length > 0) {
        const updatedTenants = [...tenants, ...successfulCheckIns];
        localStorage.setItem('tenants', JSON.stringify(updatedTenants));

        // Update room availability
        const updatedRooms = rooms.map(room => {
            if (roomsToUpdate.includes(room.id)) {
                return { ...room, available: false };
            }
            return room;
        });
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));

        // Update building availability
        const buildings = JSON.parse(localStorage.getItem('buildings') || '[]') as Building[];
        const updatedBuildings = buildings.map(building => {
            const buildingRooms = updatedRooms.filter(r => r.building.id === building.id);
            const hasAvailableRooms = buildingRooms.some(r => r.available);
            return { ...building, available: hasAvailableRooms };
        });
        localStorage.setItem('buildings', JSON.stringify(updatedBuildings));
    }

    return results;
};

export const batchCheckOutTenants = async (tenantIds: number[]): Promise<BatchCheckOutData[]> => {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]') as Tenant[];
    const results: BatchCheckOutData[] = tenantIds.map(id => ({ tenant_id: id, status: 'pending' }));
    const roomsToUpdate: number[] = [];

    // Process each tenant check-out
    for (let i = 0; i < results.length; i++) {
        const { tenant_id } = results[i];

        try {
            const tenant = tenants.find(t => t.id === tenant_id);
            if (!tenant) throw new Error('Tenant not found');
            if (tenant.departure_date) throw new Error('Tenant already checked out');

            // Mark tenant for check-out
            tenants.forEach(t => {
                if (t.id === tenant_id) {
                    t.departure_date = new Date();
                }
            });

            roomsToUpdate.push(tenant.room.id);
            results[i].status = 'success';

        } catch (error) {
            results[i].status = 'error';
            results[i].error_message = error instanceof Error ? error.message : String(error);
        }
    }

    // Update storage if any successful check-outs
    if (roomsToUpdate.length > 0) {
        localStorage.setItem('tenants', JSON.stringify(tenants));

        // Update room availability
        const rooms = JSON.parse(localStorage.getItem('rooms') || '[]') as Room[];
        const updatedRooms = rooms.map(room => {
            if (roomsToUpdate.includes(room.id)) {
                return { ...room, available: true };
            }
            return room;
        });
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));

        // Update building availability
        const buildings = JSON.parse(localStorage.getItem('buildings') || '[]') as Building[];
        const updatedBuildings = buildings.map(building => {
            const buildingRooms = updatedRooms.filter(r => r.building.id === building.id);
            const hasAvailableRooms = buildingRooms.some(r => r.available);
            return { ...building, available: hasAvailableRooms };
        });
        localStorage.setItem('buildings', JSON.stringify(updatedBuildings));
    }

    return results;
};

export const resetMockData = (): void => {
    localStorage.setItem('buildings', JSON.stringify(MOCK_DATA.buildings));
    localStorage.setItem('rooms', JSON.stringify(MOCK_DATA.rooms));
    localStorage.setItem('tenants', JSON.stringify([]));
    localStorage.setItem('utilityRates', JSON.stringify(MOCK_DATA.utilityRates));
    localStorage.setItem('utilityReadings', JSON.stringify([]));
    localStorage.setItem('utilityBills', JSON.stringify([]));
    localStorage.setItem('maintenanceRequests', JSON.stringify([]));
    localStorage.setItem('maintenanceUpdates', JSON.stringify([]));
};

// Utility billing API methods
export const getUtilityRates = async (): Promise<UtilityRate[]> => {
    return JSON.parse(localStorage.getItem('utilityRates') || '[]') as UtilityRate[];
};

export const getUtilityReadings = async (roomId?: number): Promise<UtilityReading[]> => {
    const readings = JSON.parse(localStorage.getItem('utilityReadings') || '[]') as UtilityReading[];
    if (roomId) {
        return readings.filter(reading => reading.roomId === roomId);
    }
    return readings;
};

export const getUtilityBills = async (tenantId?: number): Promise<UtilityBill[]> => {
    const bills = JSON.parse(localStorage.getItem('utilityBills') || '[]') as UtilityBill[];
    if (tenantId) {
        return bills.filter(bill => bill.tenantId === tenantId);
    }
    return bills;
};

export const addUtilityReading = async (reading: Omit<UtilityReading, 'id'>): Promise<UtilityReading> => {
    const readings = JSON.parse(localStorage.getItem('utilityReadings') || '[]') as UtilityReading[];

    // Get the previous reading for this room and utility type
    const previousReadings = readings
        .filter(r => r.roomId === reading.roomId && r.utilityType === reading.utilityType)
        .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());

    const previousValue = previousReadings.length > 0 ? previousReadings[0].value : 0;

    const newReading: UtilityReading = {
        id: readings.length > 0 ? Math.max(...readings.map(r => r.id)) + 1 : 1,
        ...reading,
        previousValue
    };

    const updatedReadings = [...readings, newReading];
    localStorage.setItem('utilityReadings', JSON.stringify(updatedReadings));

    return newReading;
};

export const generateUtilityBill = async (tenantId: number, billingPeriod: { startDate: Date, endDate: Date }): Promise<UtilityBill> => {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]') as Tenant[];
    const tenant = tenants.find(t => t.id === tenantId);

    if (!tenant) {
        throw new Error('Tenant not found');
    }

    const roomId = tenant.room.id;
    const baseRent = tenant.room.baseRent || 0;

    // Get utility rates
    const utilityRates = await getUtilityRates();

    // Get readings for this room within the billing period
    const allReadings = await getUtilityReadings(roomId);
    const periodReadings = allReadings.filter(r => {
        const readingDate = new Date(r.readingDate);
        return readingDate >= new Date(billingPeriod.startDate) && readingDate <= new Date(billingPeriod.endDate);
    });

    // Group readings by utility type
    const readingsByType: Record<string, UtilityReading[]> = {};
    periodReadings.forEach(reading => {
        if (!readingsByType[reading.utilityType]) {
            readingsByType[reading.utilityType] = [];
        }
        readingsByType[reading.utilityType].push(reading);
    });

    // Calculate bill items
    const items: UtilityBillItem[] = [];

    // Add rent as a bill item
    items.push({
        utilityType: 'rent',
        amount: baseRent
    });

    // Add utility items
    let totalAmount = baseRent;

    utilityRates.forEach(rate => {
        const readings = readingsByType[rate.utilityType] || [];

        if (rate.utilityType === 'internet') {
            // Internet is a fixed monthly charge
            const amount = rate.ratePerUnit;
            items.push({
                utilityType: rate.utilityType,
                rate: rate.ratePerUnit,
                amount
            });
            totalAmount += amount;
        } else if (readings.length > 0) {
            // Calculate usage and amount for metered utilities
            const latestReading = readings.sort((a, b) =>
                new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
            )[0];

            const usage = latestReading.value - (latestReading.previousValue || 0);
            const baseCharge = rate.baseCharge || 0;
            const usageCharge = usage * rate.ratePerUnit;
            const amount = baseCharge + usageCharge;

            items.push({
                utilityType: rate.utilityType,
                usage,
                rate: rate.ratePerUnit,
                baseCharge,
                amount
            });

            totalAmount += amount;
        }
    });

    // Create the bill
    const bills = JSON.parse(localStorage.getItem('utilityBills') || '[]') as UtilityBill[];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

    const newBill: UtilityBill = {
        id: bills.length > 0 ? Math.max(...bills.map(b => b.id)) + 1 : 1,
        tenantId,
        roomId,
        billingPeriod,
        issueDate: new Date(),
        dueDate,
        items,
        totalAmount,
        status: 'pending'
    };

    const updatedBills = [...bills, newBill];
    localStorage.setItem('utilityBills', JSON.stringify(updatedBills));

    return newBill;
};

export const updateBillStatus = async (billId: number, status: 'pending' | 'paid' | 'overdue', paymentDate?: Date): Promise<UtilityBill> => {
    const bills = JSON.parse(localStorage.getItem('utilityBills') || '[]') as UtilityBill[];
    const bill = bills.find(b => b.id === billId);

    if (!bill) {
        throw new Error('Bill not found');
    }

    const updatedBill = {
        ...bill,
        status,
        paymentDate: status === 'paid' ? paymentDate || new Date() : bill.paymentDate
    };

    const updatedBills = bills.map(b => b.id === billId ? updatedBill : b);
    localStorage.setItem('utilityBills', JSON.stringify(updatedBills));

    return updatedBill;
};

// Maintenance API methods
export const getMaintenanceRequests = async (filters?: { roomId?: number, tenantId?: number, status?: string }): Promise<MaintenanceRequest[]> => {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]') as MaintenanceRequest[];

    if (!filters) return requests;

    return requests.filter(req => {
        if (filters.roomId && req.roomId !== filters.roomId) return false;
        if (filters.tenantId && req.tenantId !== filters.tenantId) return false;
        if (filters.status && req.status !== filters.status) return false;
        return true;
    });
};

export const getMaintenanceRequestById = async (requestId: number): Promise<MaintenanceRequest | null> => {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]') as MaintenanceRequest[];
    return requests.find(req => req.id === requestId) || null;
};

export const getMaintenanceUpdates = async (requestId: number): Promise<MaintenanceUpdate[]> => {
    const updates = JSON.parse(localStorage.getItem('maintenanceUpdates') || '[]') as MaintenanceUpdate[];
    return updates.filter(update => update.requestId === requestId);
};

export const createMaintenanceRequest = async (requestData: MaintenanceRequestData): Promise<MaintenanceRequest> => {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]') as MaintenanceRequest[];
    const currentUser = JSON.parse(localStorage.getItem('user_session') || '{}');

    // Validate room exists
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]') as Room[];
    const room = rooms.find(r => r.id === requestData.roomId);
    if (!room) throw new Error('Room not found');

    // Create new request
    const newRequest: MaintenanceRequest = {
        id: requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1,
        roomId: requestData.roomId,
        tenantId: requestData.tenantId || null,
        category: requestData.category,
        description: requestData.description,
        priority: requestData.priority,
        status: 'pending',
        submittedDate: new Date(),
        notes: requestData.notes
    };

    // Save request
    const updatedRequests = [...requests, newRequest];
    localStorage.setItem('maintenanceRequests', JSON.stringify(updatedRequests));

    // Create initial update
    const updates = JSON.parse(localStorage.getItem('maintenanceUpdates') || '[]') as MaintenanceUpdate[];
    const newUpdate: MaintenanceUpdate = {
        id: updates.length > 0 ? Math.max(...updates.map(u => u.id)) + 1 : 1,
        requestId: newRequest.id,
        status: 'pending',
        updateDate: new Date(),
        updatedBy: currentUser.name || 'Admin User',
        notes: `Maintenance request created: ${requestData.description}`
    };

    const updatedUpdates = [...updates, newUpdate];
    localStorage.setItem('maintenanceUpdates', JSON.stringify(updatedUpdates));

    return newRequest;
};

export const updateMaintenanceRequest = async (
    requestId: number,
    updates: {
        status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
        assignedTo?: string,
        scheduledDate?: Date,
        completedDate?: Date,
        notes?: string
    },
    updateNote: string
): Promise<MaintenanceRequest> => {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]') as MaintenanceRequest[];
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        throw new Error('Maintenance request not found');
    }

    // Update request
    const updatedRequest = {
        ...request,
        ...updates
    };

    const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);
    localStorage.setItem('maintenanceRequests', JSON.stringify(updatedRequests));

    // Create update record
    const currentUser = JSON.parse(localStorage.getItem('user_session') || '{}');
    const allUpdates = JSON.parse(localStorage.getItem('maintenanceUpdates') || '[]') as MaintenanceUpdate[];

    const newUpdate: MaintenanceUpdate = {
        id: allUpdates.length > 0 ? Math.max(...allUpdates.map(u => u.id)) + 1 : 1,
        requestId: requestId,
        status: updates.status || request.status,
        updateDate: new Date(),
        updatedBy: currentUser.name || 'Admin User',
        notes: updateNote
    };

    const updatedUpdates = [...allUpdates, newUpdate];
    localStorage.setItem('maintenanceUpdates', JSON.stringify(updatedUpdates));

    return updatedRequest;
};
