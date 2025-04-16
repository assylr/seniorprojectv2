import { Building, Room, Tenant, UtilityRate, UtilityReading, UtilityBill, MaintenanceRequest, MaintenanceUpdate } from './types';

export const MOCK_DATA: {
    buildings: Building[];
    rooms: Room[];
    tenants: Tenant[];
    utilityRates: UtilityRate[];
    utilityReadings: UtilityReading[];
    utilityBills: UtilityBill[];
    maintenanceRequests: MaintenanceRequest[];
    maintenanceUpdates: MaintenanceUpdate[];
} = {
    buildings: [
        {
            id: 1,
            buildingType: "apartment",
            buildingNumber: "101",
            floorCount: 4,
            totalArea: 1200.5,
            available: true
        },
        {
            id: 2,
            buildingType: "townhouse",
            buildingNumber: "102",
            floorCount: 2,
            totalArea: 800.0,
            available: false
        }
    ],
    rooms: [
        {
            id: 1,
            building: {
                id: 1,
                buildingType: "apartment",
                buildingNumber: "101",
                floorCount: 4,
                totalArea: 1200.5,
                available: true
            },
            roomNumber: "101A",
            bedroomCount: 2,
            totalArea: 75.5,
            floorNumber: 1,
            available: false,
            baseRent: 450
        },
        {
            id: 2,
            building: {
                id: 1,
                buildingType: "apartment",
                buildingNumber: "101",
                floorCount: 4,
                totalArea: 1200.5,
                available: true
            },
            roomNumber: "101B",
            bedroomCount: 1,
            totalArea: 45.0,
            floorNumber: 1,
            available: true,
            baseRent: 350
        },
        {
            id: 3,
            building: {
                id: 2,
                buildingType: "townhouse",
                buildingNumber: "102",
                floorCount: 2,
                totalArea: 800.0,
                available: false
            },
            roomNumber: "102A",
            bedroomCount: 3,
            totalArea: 95.0,
            floorNumber: 1,
            available: false,
            baseRent: 550
        }
    ],
    tenants: [
        {
            id: 1, // Changed from tenant_id
            name: "John",
            surname: "Doe",
            school: "Engineering School",
            position: "Professor",
            tenant_type: "faculty",
            mobile: "+1234567890",
            email: "john.doe@university.edu",
            room: {
                id: 1,
                building: {
                    id: 1,
                    buildingType: "apartment",
                    buildingNumber: "101",
                    floorCount: 4,
                    totalArea: 1200.5,
                    available: true
                },
                roomNumber: "101A",
                bedroomCount: 2,
                totalArea: 75.5,
                floorNumber: 1,
                available: false,
                baseRent: 450
            },
            arrival_date: new Date("2023-01-15"), // Changed to Date type
            departure_date: null
        },
        {
            id: 2, // Changed from tenant_id
            name: "Jane",
            surname: "Smith",
            school: "Business School",
            position: "Student",
            tenant_type: "renter",
            mobile: "+1987654321",
            email: "jane.smith@university.edu",
            room: {
                id: 3,
                building: {
                    id: 2,
                    buildingType: "townhouse",
                    buildingNumber: "102",
                    floorCount: 2,
                    totalArea: 800.0,
                    available: false
                },
                roomNumber: "102A",
                bedroomCount: 3,
                totalArea: 95.0,
                floorNumber: 1,
                available: false,
                baseRent: 550
            },
            arrival_date: new Date("2023-02-01"), // Changed to Date type
            departure_date: null
        }
    ],
    utilityRates: [
        {
            id: 1,
            utilityType: "electricity",
            ratePerUnit: 0.15,
            unit: "kWh",
            baseCharge: 10
        },
        {
            id: 2,
            utilityType: "water",
            ratePerUnit: 2.5,
            unit: "cubic meter",
            baseCharge: 5
        },
        {
            id: 3,
            utilityType: "heating",
            ratePerUnit: 0.08,
            unit: "kWh",
            baseCharge: 15
        },
        {
            id: 4,
            utilityType: "internet",
            ratePerUnit: 30,
            unit: "month"
        }
    ],
    utilityReadings: [
        {
            id: 1,
            roomId: 1,
            utilityType: "electricity",
            readingDate: new Date("2023-02-01"),
            value: 250,
            previousValue: 150
        },
        {
            id: 2,
            roomId: 1,
            utilityType: "water",
            readingDate: new Date("2023-02-01"),
            value: 18,
            previousValue: 12
        },
        {
            id: 3,
            roomId: 3,
            utilityType: "electricity",
            readingDate: new Date("2023-02-01"),
            value: 320,
            previousValue: 200
        },
        {
            id: 4,
            roomId: 3,
            utilityType: "water",
            readingDate: new Date("2023-02-01"),
            value: 25,
            previousValue: 15
        }
    ],
    utilityBills: [
        {
            id: 1,
            tenantId: 1,
            roomId: 1,
            billingPeriod: {
                startDate: new Date("2023-01-01"),
                endDate: new Date("2023-01-31")
            },
            issueDate: new Date("2023-02-05"),
            dueDate: new Date("2023-02-20"),
            items: [
                {
                    utilityType: "rent",
                    amount: 450
                },
                {
                    utilityType: "electricity",
                    usage: 100,
                    rate: 0.15,
                    baseCharge: 10,
                    amount: 25
                },
                {
                    utilityType: "water",
                    usage: 6,
                    rate: 2.5,
                    baseCharge: 5,
                    amount: 20
                },
                {
                    utilityType: "internet",
                    rate: 30,
                    amount: 30
                }
            ],
            totalAmount: 525,
            status: "paid",
            paymentDate: new Date("2023-02-15")
        },
        {
            id: 2,
            tenantId: 2,
            roomId: 3,
            billingPeriod: {
                startDate: new Date("2023-02-01"),
                endDate: new Date("2023-02-28")
            },
            issueDate: new Date("2023-03-05"),
            dueDate: new Date("2023-03-20"),
            items: [
                {
                    utilityType: "rent",
                    amount: 550
                },
                {
                    utilityType: "electricity",
                    usage: 120,
                    rate: 0.15,
                    baseCharge: 10,
                    amount: 28
                },
                {
                    utilityType: "water",
                    usage: 10,
                    rate: 2.5,
                    baseCharge: 5,
                    amount: 30
                },
                {
                    utilityType: "internet",
                    rate: 30,
                    amount: 30
                }
            ],
            totalAmount: 638,
            status: "pending"
        }
    ],
    maintenanceRequests: [
        {
            id: 1,
            roomId: 1,
            tenantId: 1,
            category: "plumbing",
            description: "Leaking faucet in kitchen sink",
            priority: "medium",
            status: "completed",
            submittedDate: new Date("2023-01-10"),
            assignedTo: "John Maintenance",
            scheduledDate: new Date("2023-01-12"),
            completedDate: new Date("2023-01-12"),
            notes: "Replaced washer and fixed leak"
        },
        {
            id: 2,
            roomId: 3,
            tenantId: 2,
            category: "electrical",
            description: "Power outlet not working in bedroom",
            priority: "high",
            status: "in_progress",
            submittedDate: new Date("2023-02-15"),
            assignedTo: "Electrical Team",
            scheduledDate: new Date("2023-02-17")
        },
        {
            id: 3,
            roomId: 2,
            tenantId: null,
            category: "hvac",
            description: "AC unit needs servicing before new tenant arrives",
            priority: "low",
            status: "pending",
            submittedDate: new Date("2023-03-01")
        }
    ],
    maintenanceUpdates: [
        {
            id: 1,
            requestId: 1,
            status: "assigned",
            updateDate: new Date("2023-01-11"),
            updatedBy: "Admin User",
            notes: "Assigned to John Maintenance"
        },
        {
            id: 2,
            requestId: 1,
            status: "completed",
            updateDate: new Date("2023-01-12"),
            updatedBy: "John Maintenance",
            notes: "Fixed the leaking faucet by replacing the washer"
        },
        {
            id: 3,
            requestId: 2,
            status: "assigned",
            updateDate: new Date("2023-02-16"),
            updatedBy: "Admin User",
            notes: "Assigned to Electrical Team"
        },
        {
            id: 4,
            requestId: 2,
            status: "in_progress",
            updateDate: new Date("2023-02-17"),
            updatedBy: "Electrical Team",
            notes: "Initial inspection complete. Need to replace wiring behind the outlet."
        }
    ]
  };
