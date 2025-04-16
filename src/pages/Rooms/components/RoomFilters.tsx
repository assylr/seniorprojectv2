// src/pages/Rooms/components/RoomFilters.tsx
import React, { ChangeEvent } from 'react';
// Adjust path as necessary
import { Building } from '../../../services/types';
import styles from './RoomFilters.module.css';

// Define the filter state structure (can also be imported if defined centrally)
export interface RoomFilterState {
    buildingId: string; // Store ID as string for select value
    availability: 'available' | 'occupied' | ''; // Use descriptive values
    bedrooms: string; // Store as string for select value
}

interface RoomFiltersProps {
    filters: RoomFilterState; // Current filter values
    // Callback function to update parent state
    onFilterChange: <K extends keyof RoomFilterState>(key: K, value: RoomFilterState[K]) => void;
    buildings: Building[]; // List of buildings for the dropdown
    uniqueBedroomCounts: number[]; // List of unique bedroom counts for the dropdown
    isLoading: boolean; // To disable inputs during loading
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
        // Use the name attribute to know which filter to update
        onFilterChange(name as keyof RoomFilterState, value as RoomFilterState[keyof RoomFilterState]);
    };

    return (
        <div className={styles.filtersContainer}>
            {/* Building Filter */}
            <select
                name="buildingId" // Matches key in RoomFilterState
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
                name="availability" // Matches key in RoomFilterState
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
                name="bedrooms" // Matches key in RoomFilterState
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