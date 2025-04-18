import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tenant, Room, Building } from '@/types';
import { getRooms, getTenants, getBuildings } from '../../services/api';
import { LoadingSpinner, AlertMessage } from '../../components/common';
import RoomFilters from './components/RoomFilters';
import RoomTable from './components/RoomTable';
import styles from './RoomsPage.module.css';

const createMapById = <T extends { id: number }>(items: T[]): Map<number, T> => {
    return new Map(items.map(item => [item.id, item]));
};

interface RoomFilterState {
    buildingId: string;
    availability: 'available' | 'occupied' | '';
    bedrooms: string;
}

const RoomsPage: React.FC = () => {

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

    useEffect(() => { /* ... fetchData logic ... */
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [roomsData, tenantsData, buildingsData] = await Promise.all([ getRooms(), getTenants(), getBuildings() ]);
                setRooms(roomsData);
                setBuildingsMap(createMapById(buildingsData));
                const tenantMap = new Map<number, Tenant>();
                tenantsData.forEach(tenant => {
                    const isCheckedOut = !!tenant.expectedDepartureDate && new Date(tenant.expectedDepartureDate) <= new Date();
                    if (tenant.currentRoomId && !isCheckedOut) {
                        tenantMap.set(tenant.currentRoomId, tenant);
                    }
                });
                setActiveTenantsMap(tenantMap);
            } catch (err: unknown) {
                
                let message = 'Failed to fetch room data';

                if (err instanceof Error) {
                    message = err?.message;
                    console.error(err.stack);
                }
                console.error("RoomsPage: Fetch error -", err);
                setError(message);

            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
     }, []);

    useEffect(() => { /* ... query param logic ... */
        const params = new URLSearchParams(location.search);
        const buildingIdFromQuery = params.get('buildingId') || '';
        const availabilityFromQuery = params.get('availability') as 'available' | 'occupied' | '' || '';
        const bedroomsFromQuery = params.get('bedrooms') || '';

        setFilters({
            buildingId: buildingIdFromQuery,
            availability: availabilityFromQuery,
            bedrooms: bedroomsFromQuery,
        });
    }, [location.search]);

    const filteredRooms = useMemo(() => { /* ... filtering logic ... */
         return rooms.filter(room => {
            const isOccupied = activeTenantsMap.has(room.id);
            const roomAvailability = isOccupied ? 'occupied' : 'available';
            const buildingMatch = !filters.buildingId || room.buildingId.toString() === filters.buildingId;
            const availabilityMatch = !filters.availability || roomAvailability === filters.availability;
            const bedroomMatch = !filters.bedrooms || room.bedroomCount.toString() === filters.bedrooms;
            return buildingMatch && availabilityMatch && bedroomMatch;
        });
    }, [rooms, filters, activeTenantsMap]);

    const uniqueBedroomCounts = useMemo(() => { /* ... unique counts logic ... */
        const counts = new Set(rooms.map(room => room.bedroomCount));
        const sortedCounts = Array.from(counts).sort((a, b) => a - b);
        return sortedCounts;
    }, [rooms]);

    // --- Action Handlers --- (No changes)
    const handleFilterChange = <K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) => {
        setFilters(prevFilters => {
            const updatedFilters = {...prevFilters, [key]: value};

            // Sync updated filters to the URL
            const query = new URLSearchParams();

            if (updatedFilters.buildingId) query.set('buildingId', updatedFilters.buildingId);
            if (updatedFilters.availability) query.set('availability', updatedFilters.availability);
            if (updatedFilters.bedrooms) query.set('bedrooms', updatedFilters.bedrooms);

            navigate(`?${query.toString()}`);

            return updatedFilters;
        })
    };
    // const handleEditRoom = (room: Room) => { /* ... */ };
    // const handleDeleteRoom = (room: Room) => { /* ... */ };


    // --- Render Logic ---
    return (
        <div className={styles.pageContainer}>

            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>Rooms</h1>
                {/* !TODO: Add Create button if rooms are manageable */}
                {/* <button className={styles.primaryButton} disabled={isLoading}>+ Add Room</button> */}
            </div>

            {/* Integrate RoomFilters */}
            <RoomFilters
                filters={filters}
                onFilterChange={handleFilterChange}
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