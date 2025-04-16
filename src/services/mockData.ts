// src/services/mockData.ts
import { Building, Room, Tenant, Contract, Payment } from './types'; // Import your specific types

// == Mock Buildings ==
// Matches your Building interface
export const mockBuildings: Building[] = [
    { id: 1, buildingType: 'apartment', buildingNumber: 'Block 7', floorCount: 10, totalArea: 5000 },
    { id: 2, buildingType: 'townhouse', buildingNumber: '12A', floorCount: 2, totalArea: 250 },
    { id: 3, buildingType: 'cottage', buildingNumber: 'Cottage 3', floorCount: 1, totalArea: 120 },
    { id: 4, buildingType: 'apartment', buildingNumber: 'Block 5', floorCount: 8, totalArea: 4000 },
];

// == Mock Rooms ==
// Matches your Room interface (using buildingId, isAvailable, baseRent)
// Ensure isAvailable matches tenant assignments below
export const mockRooms: Room[] = [
    // Building 1 (Block 7) - ID 1
    { id: 101, buildingId: 1, roomNumber: '7-101', bedroomCount: 1, totalArea: 55, floorNumber: 1, isAvailable: false, baseRent: 150000 }, // Occupied by Tenant 1
    { id: 102, buildingId: 1, roomNumber: '7-102', bedroomCount: 2, totalArea: 70, floorNumber: 1, isAvailable: true, baseRent: 200000 },
    { id: 103, buildingId: 1, roomNumber: '7-201', bedroomCount: 1, totalArea: 55, floorNumber: 2, isAvailable: true, baseRent: 155000 },
    // Building 2 (12A) - ID 2
    { id: 201, buildingId: 2, roomNumber: '12A-1', bedroomCount: 3, totalArea: 120, floorNumber: 1, isAvailable: false, baseRent: 300000 }, // Occupied by Tenant 2
    { id: 202, buildingId: 2, roomNumber: '12A-2', bedroomCount: 3, totalArea: 130, floorNumber: 2, isAvailable: true, baseRent: 310000 },
    // Building 3 (Cottage 3) - ID 3
    { id: 301, buildingId: 3, roomNumber: 'C3', bedroomCount: 2, totalArea: 120, floorNumber: 1, isAvailable: true, baseRent: 280000 },
    // Building 4 (Block 5) - ID 4
    { id: 401, buildingId: 4, roomNumber: '5-101', bedroomCount: 2, totalArea: 65, floorNumber: 1, isAvailable: false, baseRent: 190000 }, // Occupied by Tenant 3
    { id: 402, buildingId: 4, roomNumber: '5-102', bedroomCount: 3, totalArea: 80, floorNumber: 1, isAvailable: true, baseRent: 240000 },
];

// == Mock Tenants ==
// Matches your Tenant interface (using firstName, lastName, currentRoomId, etc.)
// Ensure currentRoomId aligns with mockRooms isAvailable status
export const mockTenants: Tenant[] = [
    {
        id: 1, firstName: 'Alice', lastName: 'Wonder', schoolOrDepartment: 'Physics', position: 'Professor', tenantType: 'faculty',
        mobile: '+1-555-0101', email: 'alice.w@example.com', currentRoomId: 101, // Alice is in Room 101
        arrivalDate: new Date('2023-08-15'), expectedDepartureDate: null
    },
    {
        id: 2, firstName: 'Bob', lastName: 'Builder', schoolOrDepartment: 'Engineering', position: 'Researcher', tenantType: 'staff',
        mobile: '+1-555-0102', email: 'bob.b@example.com', currentRoomId: 201, // Bob is in Room 201
        arrivalDate: new Date('2023-09-01'), expectedDepartureDate: null
    },
     {
        id: 3, firstName: 'Charlie', lastName: 'Chaplin', schoolOrDepartment: 'Arts', position: 'Visiting Lecturer', tenantType: 'faculty',
        mobile: null, email: 'charlie.c@example.com', currentRoomId: 401, // Charlie is in Room 401
        arrivalDate: new Date('2024-01-10'), expectedDepartureDate: new Date('2024-06-30') // Checked out - Room 401 should be available now? Let's fix mockRooms
    },
    {
        id: 4, firstName: 'Diana', lastName: 'Prince', schoolOrDepartment: 'Administration', position: 'Coordinator', tenantType: 'staff',
        mobile: '+1-555-0104', email: null, currentRoomId: null, // No room assigned yet
        arrivalDate: null, expectedDepartureDate: null
    },
];

// --- Correction based on Tenant 3 checkout ---
// Find room 401 and mark it as available since Charlie checked out
const room401Index = mockRooms.findIndex(r => r.id === 401);
if (room401Index !== -1) {
    mockRooms[room401Index].isAvailable = true;
}
// --- End Correction ---


// == Mock Contracts (Example Structure - Uncomment/Populate if needed) ==
export const mockContracts: Contract[] = [
    // { id: 1001, tenantId: 1, roomId: 101, startDate: new Date('2023-08-15'), endDate: new Date('2024-08-14'), monthlyRentAmount: 150000, status: 'active' },
    // { id: 1002, tenantId: 2, roomId: 201, startDate: new Date('2023-09-01'), endDate: new Date('2024-08-31'), monthlyRentAmount: 300000, status: 'active' },
    // { id: 1003, tenantId: 3, roomId: 401, startDate: new Date('2024-01-10'), endDate: new Date('2024-06-30'), monthlyRentAmount: 190000, status: 'expired' },
];

// == Mock Payments (Example Structure - Uncomment/Populate if needed) ==
export const mockPayments: Payment[] = [
    // { id: 2001, contractId: 1001, tenantId: 1, paymentDate: new Date('2024-03-01'), amount: 150000, paymentMethod: 'bank_transfer' },
    // { id: 2002, contractId: 1002, tenantId: 2, paymentDate: new Date('2024-03-01'), amount: 300000, paymentMethod: 'bank_transfer' },
    // { id: 2003, contractId: 1001, tenantId: 1, paymentDate: new Date('2024-04-01'), amount: 150000, paymentMethod: 'bank_transfer' },
];


// Helper for generating NEW IDs during mock operations
// Ensure these start HIGHER than any manually assigned IDs above
let nextTenantId = 5;
let nextRoomId = 500; // Assuming no manually assigned room IDs go this high
let nextContractId = 2000;
let nextPaymentId = 3000;

export const getNextTenantId = () => nextTenantId++;
export const getNextRoomId = () => nextRoomId++;
export const getNextContractId = () => nextContractId++;
export const getNextPaymentId = () => nextPaymentId++;