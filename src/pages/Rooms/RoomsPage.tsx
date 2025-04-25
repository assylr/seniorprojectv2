import { AlertMessage, LoadingSpinner } from '@/components/common';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBuildings, getRoomDetails } from '@/services/api'; // Use new API functions
import { Building, RoomDetailDTO } from '@/types'; // Import RoomDetailDto
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RoomFilters, { RoomFilterState } from './components/RoomFilters'; // RoomFilterState might need adjustment
import RoomTable from './components/RoomTable';
import styles from './RoomsPage.module.css';

// Initial filter state remains similar
const initialFilters: RoomFilterState = {
    buildingId: '',
    status: '', // This now maps to backend 'status' filter
    bedroomCount: '' // change to bedroomCount
};

const STATIC_BEDROOM_COUNTS: number[] = [1, 2, 3, 4, 5];

const RoomsPage: React.FC = () => {
    const { t } = useLanguage();
    const [rooms, setRooms] = useState<RoomDetailDTO[]>([]);
    const [filterBuildings, setFilterBuildings] = useState<Building[]>([]);

    const [uniqueBedroomCounts, setUniqueBedroomCounts] = useState<number[]>(STATIC_BEDROOM_COUNTS);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFetchingFilters, setIsFetchingFilters] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<RoomFilterState>(initialFilters);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFilterData = async () => {
            setIsFetchingFilters(true);
            try {
                const buildingsData = await getBuildings();
                setFilterBuildings(buildingsData);
                setUniqueBedroomCounts(STATIC_BEDROOM_COUNTS);
            } catch (err: unknown) {
                console.error("Failed to fetch filter data:", err);
                setError(t('rooms.error.filters'));
            } finally {
                setIsFetchingFilters(false);
            }
        };
        fetchFilterData();
    }, [t]);

    // Effect to synchronize URL query parameters to filter state
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setFilters({
            buildingId: params.get('buildingId') || '',
            status: (params.get('status') as RoomFilterState['status']) || '',
            bedroomCount: params.get('bedroomCount') || '',
        });
    }, [location.search]);

    const fetchRooms = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.buildingId) queryParams.set('buildingId', filters.buildingId);
            if (filters.status) queryParams.set('status', filters.status);
            if (filters.bedroomCount) queryParams.set('bedroomCount', filters.bedroomCount);

            // Call the new API function
            const roomsData = await getRoomDetails(queryParams);
            setRooms(roomsData);
            setError(null);
        } catch (err: unknown) {
            let message = t('rooms.error.fetch');
            if (err instanceof Error) message = err.message;
            console.error("RoomsPage: Fetch error -", err);
            setError(message);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters, t]);

    useEffect(() => {
        if (!isFetchingFilters) {
            fetchRooms();
        }
    }, [fetchRooms, isFetchingFilters]);


    const handleFilterChange = <K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) => {
        // const updatedFilters = { ...filters, [key]: value };

        const query = new URLSearchParams(location.search);
        if (value) {
            query.set(key, value);
        } else {
            query.delete(key);
        }
        navigate(`?${query.toString()}`, { replace: true });

        // Setting filters state is handled by the useEffect listening to location.search
        // setFilters(updatedFilters); // No longer needed here if using location.search effect
    };

    const showInitialLoading = isLoading && rooms.length === 0 && !error;
    const filtersDisabled = isFetchingFilters || isLoading;

    return (
        <div className={styles.pageContainer}>
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>{t('rooms.title')}</h1>
                {/* Add Create button later */}
            </div>

            <RoomFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                buildings={filterBuildings}
                uniqueBedroomCounts={uniqueBedroomCounts}
                isLoading={filtersDisabled}
            />

            {showInitialLoading ? (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>{t('rooms.loading')}</p>
                </div>
            ) : (
                <RoomTable
                    rooms={rooms}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default RoomsPage;