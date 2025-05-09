// src/pages/Tenants/components/TenantFilters.tsx
import React, { ChangeEvent } from 'react';
import { Building, TenantStatusType, TenantType } from '@/types';
import styles from './TenantFilters.module.css';

export interface TenantFilterState {
    // --- Match backend status values ---
    status: TenantStatusType | ''; // Example: Use backend values
    tenantType: TenantType | ''; // Assuming these are your types
    buildingId: string;
    searchQuery: string;
}

interface TenantFiltersProps {
    filters: TenantFilterState;
    onFilterChange: <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => void;
    buildings: Building[];
    isLoading: boolean;
    // Add tenantTypes prop if needed: tenantTypes: string[];
}

const TenantFilters: React.FC<TenantFiltersProps> = ({
    filters,
    onFilterChange,
    buildings,
    isLoading,
    // tenantTypes = [] // Default if passed
}) => {

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Ensure type safety if possible, otherwise cast
        onFilterChange(name as keyof TenantFilterState, value as TenantFilterState[keyof TenantFilterState]);
    };

    const handleClearSearch = () => {
        onFilterChange('searchQuery', '');
    };

    return (
        <div className={styles.filtersContainer}>
            {/* Search Box */}
            <div className={styles.searchBox}>
                 {/* ... Search input ... */}
                 <input
                    type="search"
                    name="searchQuery"
                    placeholder="Search tenants..."
                    value={filters.searchQuery}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Search tenants"
                 />
                {filters.searchQuery && (
                    <button type="button" className={styles.clearSearch} onClick={handleClearSearch} aria-label="Clear search" disabled={isLoading}>×</button>
                )}
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
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="PENDING">Pending</option>
                </select>

                <select
                    name="tenantType"
                    value={filters.tenantType}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-label="Filter by type"
                 >
                    <option value="">All Types</option>
                    {/* Populate dynamically if needed from tenantTypes prop */}
                    <option value="FACULTY">Faculty</option>
                    <option value="RENTER">Renter</option>
                </select>

                <select
                    name="buildingId"
                    value={filters.buildingId}
                    onChange={handleInputChange}
                    disabled={isLoading || buildings.length === 0}
                    aria-label="Filter by building"
                 >
                    <option value="">All Buildings</option>
                    {buildings.map(building => (
                        <option key={building.id} value={String(building.id)}>
                            {building.buildingNumber || `ID: ${building.id}`}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TenantFilters;