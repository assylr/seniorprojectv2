import { MOCK_DATA } from './mockData';

// Initialize localStorage with mock data if empty
const initializeMockData = () => {
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

// Call this when your app starts
initializeMockData();

// API functions
export const getBuildings = async () => {
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  return buildings;
};

export const getRooms = async () => {
  const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
  return rooms;
};

export const getTenants = async () => {
  const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
  return tenants;
};

export const updateRoomAvailability = async (roomId, isAvailable) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
  
  const updatedRooms = rooms.map(room => 
    room.room_id === roomId 
      ? { ...room, available: isAvailable }
      : room
  );
  
  localStorage.setItem('rooms', JSON.stringify(updatedRooms));
  
  // Update building available rooms count
  const room = rooms.find(r => r.room_id === roomId);
  if (room) {
    const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
    const updatedBuildings = buildings.map(building => {
      if (building.building_id === room.building_id) {
        const availableRooms = updatedRooms
          .filter(r => r.building_id === building.building_id && r.available)
          .length;
        return { ...building, available_rooms: availableRooms };
      }
      return building;
    });
    localStorage.setItem('buildings', JSON.stringify(updatedBuildings));
  }
};

export const checkInTenant = async (tenantData) => {
  const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
  const room = rooms.find(r => r.room_id === parseInt(tenantData.room_id));
  
  if (!room) {
    throw new Error('Room not found');
  }
  if (!room.available) {
    throw new Error('Room is not available');
  }

  const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
  const newTenant = {
    ...tenantData,
    tenant_id: Date.now(),
    building_id: room.building_id,
    // arrival_date: new Date().toISOString(), // Removed this line
    departure_date: null
  };
  
  tenants.push(newTenant);
  localStorage.setItem('tenants', JSON.stringify(tenants));

  await updateRoomAvailability(parseInt(newTenant.room_id), false);
  return newTenant;
};

export const checkOutTenant = async (tenantId) => {
  const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
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

  if (tenant.room_id) {
    await updateRoomAvailability(parseInt(tenant.room_id), true);
  }
};

// Utility function for development/testing
export const resetMockData = () => {
  localStorage.setItem('buildings', JSON.stringify(MOCK_DATA.buildings));
  localStorage.setItem('rooms', JSON.stringify(MOCK_DATA.rooms));
  localStorage.setItem('tenants', JSON.stringify([]));
};
