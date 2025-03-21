import { Building, Room, Tenant } from './types';

export const MOCK_DATA: {
    buildings: Building[];
    rooms: Room[];
    tenants: Tenant[];
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
            available: false
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
            available: true
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
            available: false
        }
    ],
    tenants: [
        {
            tenant_id: 1,
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
                available: false
            },
            building: {
                id: 1,
                buildingType: "apartment",
                buildingNumber: "101",
                floorCount: 4,
                totalArea: 1200.5,
                available: true
            },
            arrival_date: "2023-01-15",
            departure_date: null
        },
        {
            tenant_id: 2,
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
                available: false
            },
            building: {
                id: 2,
                buildingType: "townhouse",
                buildingNumber: "102",
                floorCount: 2,
                totalArea: 800.0,
                available: false
            },
            arrival_date: "2023-02-01",
            departure_date: null
        }
    ]
  };
