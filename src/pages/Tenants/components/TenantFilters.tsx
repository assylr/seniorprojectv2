// src/pages/Tenants/components/TenantFilters.tsx
import React, { ChangeEvent } from 'react';
import { Building } from '../../../services/types'; // Adjust path
import styles from './TenantFilters.module.css';

// Re-use the filter state definition or import from a shared location
export interface TenantFilterState {
    status: 'active' | 'checked-out' | '';
    type: 'faculty' | 'staff' | '';
    buildingId: string;
    searchQuery: string;
}

interface TenantFiltersProps {
    filters: TenantFilterState;
    onFilterChange: <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => void;
    buildings: Building[]; // Pass buildings for the dropdown
    isLoading: boolean; // Disable inputs while loading/submitting actions
}

const TenantFilters: React.FC<TenantFiltersProps> = ({
    filters,
    onFilterChange,
    buildings,
    isLoading
}) => {

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Type assertion needed here as name is a string, but we want it typed as a key
        onFilterChange(name as keyof TenantFilterState, value as TenantFilterState[keyof TenantFilterState]);
    };

    const handleClearSearch = () => {
        onFilterChange('searchQuery', '');
    };

    return (
        <div className={styles.filtersContainer}>
            {/* Search Box */}
            <div className={styles.searchBox}>
                <input
                    type="text"
                    name="searchQuery" // Add name attribute
                    placeholder="Search by name, email, phone, room..."
                    value={filters.searchQuery}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Search tenants"
                 />
                {filters.searchQuery && (
                    <button
                        className={styles.clearSearch}
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        disabled={isLoading}
                        title="Clear search"
                    >
                        × {/* Use HTML entity for 'x' */}
                    </button>
                )}
                 <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            </div>

            {/* Filter Selects */}
            <div className={styles.selectFilters}>
                <select
                    name="status" // Add name attribute
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
                    name="type" // Add name attribute
                    value={filters.type}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Filter by type"
                 >
                    <option value="">All Types</option>
                    {/* Use updated type names */}
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                </select>

                <select
                    name="buildingId" // Add name attribute
                    value={filters.buildingId}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Filter by building"
                 >
                    <option value="">All Buildings</option>
                    {buildings.map(building => (
                        // Use building.id which should be number, convert to string for value
                        <option key={building.id} value={String(building.id)}>
                            Building {building.buildingNumber}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TenantFilters;