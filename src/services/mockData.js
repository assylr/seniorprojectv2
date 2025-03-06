export const MOCK_DATA = {
  buildings: [
    { building_id: 1, building_number: "101" },
    { building_id: 2, building_number: "102" }
  ],
  rooms: [
    { room_id: 1, room_number: "101A", building_id: 1, available: false },
    { room_id: 2, room_number: "101B", building_id: 1, available: true },
    { room_id: 3, room_number: "102A", building_id: 2, available: false }
  ],
  tenants: [
    {
      tenant_id: 1,
      name: "John",
      surname: "Doe",
      tenant_type: "Student",
      school: "Engineering",
      position: "PhD Student",
      mobile: "123-456-7890",
      email: "john.doe@university.edu",
      building_id: 1,
      room_id: 1,
      arrival_date: "2023-01-15",
      departure_date: null
    },
    {
      tenant_id: 2,
      name: "Jane",
      surname: "Smith",
      tenant_type: "Faculty",
      school: "Medicine",
      position: "Assistant Professor",
      mobile: "098-765-4321",
      email: "jane.smith@university.edu",
      building_id: 2,
      room_id: 3,
      arrival_date: "2023-02-01",
      departure_date: null
    }
  ]
};