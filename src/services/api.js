const BASE_URL = 'https://spring-backend-latest.onrender.com/api';

// API functions
export const getBuildings = async () => {
  const res = await fetch(`${BASE_URL}/buildings`);
  if (!res.ok) throw new Error('Failed to fetch buildings');
  return await res.json();
};

export const getRooms = async () => {
  const res = await fetch(`${BASE_URL}/rooms`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return await res.json();
};

export const getTenants = async () => {
  const res = await fetch(`${BASE_URL}/tenants`);
  if (!res.ok) throw new Error('Failed to fetch tenants');
  return await res.json();
};

export const updateRoomAvailability = async (roomId, isAvailable) => {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
    method: 'PATCH', // Or PUT if your backend uses it
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ available: isAvailable }),
  });
  if (!res.ok) throw new Error('Failed to update room availability');
  return await res.json();
};

export const checkInTenant = async (tenantData) => {
  const res = await fetch(`${BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tenantData),
  });
  if (!res.ok) throw new Error('Failed to check in tenant');
  return await res.json();
};

export const checkOutTenant = async (tenantId) => {
  const res = await fetch(`${BASE_URL}/tenants/${tenantId}/checkout`, {
    method: 'PATCH', // Or POST/PUT based on your backend
  });
  if (!res.ok) throw new Error('Failed to check out tenant');
  return await res.json();
};
