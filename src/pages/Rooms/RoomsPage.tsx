// src/pages/Rooms/RoomsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import Types
import { Room, Tenant, Building } from '../../services/types';

// Import API Functions
import { getRooms, getTenants, getBuildings } from '../../services/api';

// Import Common Components
import { LoadingSpinner, AlertMessage } from '../../components/common';

// --- >>> Import the ACTUAL components now <<< ---
import RoomFilters, { RoomFilterState } from './components/RoomFilters';
import RoomTable from './components/RoomTable';

// Import Styles
import styles from './RoomsPage.module.css';

// Helper to create a map for quick lookups
const createMapById = <T extends { id: number }>(items: T[]): Map<number, T> => {
    return new Map(items.map(item => [item.id, item]));
};

// Filter state interface
interface RoomFilterState {
    buildingId: string;
    availability: 'available' | 'occupied' | '';
    bedrooms: string;
}

const RoomsPage: React.FC = () => {
    // --- State Definitions --- (No changes)
    const [rooms, setRooms] = useState<Room[]>([]);
    const [buildingsMap, setBuildingsMap] = useState<Map<number, Building>>(new Map());
    const [activeTenantsMap, setActiveTenantsMap] = useState<Map<number, Tenant>>(new Map());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<RoomFilterState>({
        buildingId: '', availability: '', bedrooms: ''
    });

    const location = useLocation();
    const navigate = useNavigate();

    // --- Data Fetching --- (No changes)
    useEffect(() => { /* ... fetchData logic ... */
        const fetchData = async () => {
            setIsLoading(true); setError(null); console.log("RoomsPage: Starting data fetch...");
            try {
                const [roomsData, tenantsData, buildingsData] = await Promise.all([ getRooms(), getTenants(), getBuildings() ]);
                console.log("RoomsPage: Data received", { rooms: roomsData.length, tenants: tenantsData.length, buildings: buildingsData.length });
                setRooms(roomsData); setBuildingsMap(createMapById(buildingsData));
                const tenantMap = new Map<number, Tenant>();
                tenantsData.forEach(tenant => {
                    const isCheckedOut = !!tenant.expectedDepartureDate && new Date(tenant.expectedDepartureDate) <= new Date();
                    if (tenant.currentRoomId && !isCheckedOut) { tenantMap.set(tenant.currentRoomId, tenant); }
                });
                setActiveTenantsMap(tenantMap); console.log("RoomsPage: State updated with fetched data and maps.");
            } catch (err: any) {
                 const message = err?.message || "Failed to fetch room data"; console.error("RoomsPage: Fetch error -", err); setError(message);
            } finally { setIsLoading(false); console.log("RoomsPage: Data fetching finished."); }
        };
        fetchData();
     }, []);

     // Effect to check for buildingId query parameter (No changes)
     useEffect(() => { /* ... query param logic ... */
        const params = new URLSearchParams(location.search);
        const buildingIdFromQuery = params.get('buildingId');
        if (buildingIdFromQuery) {
            console.log("RoomsPage: Setting building filter from query param:", buildingIdFromQuery);
            setFilters(prev => ({ ...prev, buildingId: buildingIdFromQuery }));
        }
    }, [location.search]);

    // --- Filtering Logic --- (No changes)
    const filteredRooms = useMemo(() => { /* ... filtering logic ... */
         console.log("RoomsPage: Recalculating filtered rooms with filters:", filters);
         return rooms.filter(room => {
            const isOccupied = activeTenantsMap.has(room.id);
            const roomAvailability = isOccupied ? 'occupied' : 'available';
            const buildingMatch = !filters.buildingId || room.buildingId.toString() === filters.buildingId;
            const availabilityMatch = !filters.availability || roomAvailability === filters.availability;
            const bedroomMatch = !filters.bedrooms || room.bedroomCount.toString() === filters.bedrooms;
            return buildingMatch && availabilityMatch && bedroomMatch;
        });
    }, [rooms, filters, activeTenantsMap]);

    // --- Unique Bedroom Counts --- (No changes)
    const uniqueBedroomCounts = useMemo(() => { /* ... unique counts logic ... */
         const counts = new Set(rooms.map(room => room.bedroomCount));
         const sortedCounts = Array.from(counts).sort((a, b) => a - b);
          console.log("RoomsPage: Calculated unique bedroom counts:", sortedCounts);
         return sortedCounts;
    }, [rooms]);

    // --- Action Handlers --- (No changes)
    const handleFilterChange = <K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) => {
         console.log(`RoomsPage: Filter changed - ${key}: ${value}`);
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };
    // const handleEditRoom = (room: Room) => { /* ... */ };
    // const handleDeleteRoom = (room: Room) => { /* ... */ };


    // --- Render Logic ---
    return (
        <div className={styles.pageContainer}>
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>Rooms</h1>
                {/* Add Create button if rooms are manageable */}
                {/* <button className={styles.primaryButton} disabled={isLoading}>+ Add Room</button> */}
            </div>

            {/* Integrate RoomFilters */}
            <RoomFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                // Convert map values to array for the prop
                buildings={Array.from(buildingsMap.values())}
                uniqueBedroomCounts={uniqueBedroomCounts}
                isLoading={isLoading} // Disable filters while initially loading
            />

            {/* Integrate RoomTable */}
            {/* Conditionally render table or initial loading spinner */}
            {isLoading && rooms.length === 0 ? (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>Loading rooms...</p>
                </div>
            ) : (
                <RoomTable
                    rooms={filteredRooms} // Pass the memoized filtered list
                    buildingsMap={buildingsMap}
                    activeTenantsMap={activeTenantsMap}
                    isLoading={isLoading} // Let table know if parent is still loading (e.g., for refetch)
                    // Pass action handlers if implemented
                    // onEditRoom={handleEditRoom}
                    // onDeleteRoom={handleDeleteRoom}
                />
            )}
        </div>
    );
};

export default RoomsPage;