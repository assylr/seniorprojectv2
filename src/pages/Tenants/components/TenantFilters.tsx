// src/pages/Tenants/components/TenantFilters.tsx
import React, { ChangeEvent } from 'react';
import { Building } from '@/types'; // Adjust path
import styles from './TenantFilters.module.css';

// Ensure this interface matches or is imported from a shared location
export interface TenantFilterState {
    status: 'active' | 'checked-out' | '';
    type: 'faculty' | 'staff' | ''; // Assuming these are your types
    buildingId: string;
    searchQuery: string;
}

interface TenantFiltersProps {
    filters: TenantFilterState;
    onFilterChange: <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => void;
    buildings: Building[];
    isLoading: boolean;
}

const TenantFilters: React.FC<TenantFiltersProps> = ({
    filters,
    onFilterChange,
    buildings,
    isLoading
}) => {

    // Generic handler works well
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange(name as keyof TenantFilterState, value); // Simplified assertion
    };

    // Clear search is fine
    const handleClearSearch = () => {
        onFilterChange('searchQuery', '');
    };

    return (
        <div className={styles.filtersContainer}>
            {/* Search Box */}
            <div className={styles.searchBox}>
                <input
                    type="search" // Use type="search" for potential browser enhancements
                    name="searchQuery"
                    placeholder="Search by name, email, phone, room..."
                    value={filters.searchQuery}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Search tenants"
                 />
                {/* Use type="button" for buttons not submitting forms */}
                {filters.searchQuery && (
                    <button
                        type="button"
                        className={styles.clearSearch}
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        disabled={isLoading}
                        title="Clear search"
                    >
                        × {/* Use HTML entity for 'x' */}
                    </button>
                )}
                 {/* Consider using an icon library instead of emoji */}
                 <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            </div>

            {/* Filter Selects */}
            <div className={styles.selectFilters}>
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Filter by status"
                 >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="checked-out">Checked Out</option>
                </select>

                <select
                    name="type"
                    value={filters.type}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Filter by type"
                 >
                    <option value="">All Types</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                    {/* Add other types if they exist */}
                </select>

                <select
                    name="buildingId"
                    value={filters.buildingId}
                    onChange={handleInputChange}
                    disabled={isLoading || buildings.length === 0} // Also disable if buildings haven't loaded
                    aria-label="Filter by building"
                 >
                    <option value="">All Buildings</option>
                    {buildings.map(building => (
                        // Key should be unique, value should be string
                        <option key={building.id} value={String(building.id)}>
                            {/* Provide more context if needed, e.g., Bldg Number */}
                            {building.buildingNumber || `ID: ${building.id}`}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TenantFilters;