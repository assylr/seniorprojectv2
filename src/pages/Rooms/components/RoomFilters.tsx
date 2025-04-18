import React, { ChangeEvent } from 'react';
import { Building } from '@/types';
import styles from './RoomFilters.module.css';

export interface RoomFilterState {
    buildingId: string;
    availability: 'available' | 'occupied' | '';
    bedrooms: string;
}

interface RoomFiltersProps {
    filters: RoomFilterState;
    onFilterChange: <K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) => void;
    buildings: Building[];
    uniqueBedroomCounts: number[];
    isLoading: boolean;
}

const RoomFilters: React.FC<RoomFiltersProps> = ({
    filters,
    onFilterChange,
    buildings,
    uniqueBedroomCounts,
    isLoading
}) => {

    // Generic handler for select changes
    const handleInputChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange(name as keyof RoomFilterState, value as RoomFilterState[keyof RoomFilterState]);
    };

    return (
        <div className={styles.filtersContainer}>

            {/* Building Filter */}
            <select
                name="buildingId"
                value={filters.buildingId}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-label="Filter by building"
            >
                <option value="">All Buildings</option>

                {buildings.map(building => (
                    // Convert building ID to string for the value attribute
                    <option key={building.id} value={String(building.id)}>
                        Building {building.buildingNumber}
                    </option>
                ))}
            </select>

            {/* Availability Filter */}
            <select
                name="availability"
                value={filters.availability}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-label="Filter by status"
            >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
            </select>

            {/* Bedrooms Filter */}
            <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-label="Filter by bedroom count"
            >
                <option value="">All Sizes</option>
                {uniqueBedroomCounts.map(count => (
                    // Convert count to string for the value attribute
                    <option key={count} value={String(count)}>
                        {count} Bedroom(s)
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RoomFilters;