import { useLanguage } from '@/contexts/LanguageContext';
import { Building } from '@/types';
import React, { ChangeEvent } from 'react';
import styles from './RoomFilters.module.css';

export interface RoomFilterState {
    buildingId: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | '';
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
    const { t } = useLanguage();

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
                aria-label={t('rooms.filters.building')}
            >
                <option value="">{t('rooms.filters.all')} {t('rooms.filters.building')}</option>

                {buildings.map(building => (
                    // Convert building ID to string for the value attribute
                    <option key={building.id} value={String(building.id)}>
                        {t('nav.blocks')} {building.buildingNumber}
                    </option>
                ))}
            </select>

            {/* Availability Filter */}
            <select
                name="status"
                value={filters.status}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-label={t('rooms.filters.status')}
            >
                <option value="">{t('rooms.filters.all')} {t('rooms.filters.status')}</option>
                <option value="AVAILABLE">{t('rooms.status.available')}</option>
                <option value="OCCUPIED">{t('rooms.status.occupied')}</option>
                <option value="MAINTENANCE">{t('rooms.status.maintenance')}</option>
            </select>

            {/* Bedrooms Filter */}
            <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-label={t('rooms.filters.bedrooms')}
            >
                <option value="">{t('rooms.filters.all')} {t('rooms.filters.bedrooms')}</option>
                {uniqueBedroomCounts.map(count => (
                    // Convert count to string for the value attribute
                    <option key={count} value={String(count)}>
                        {count} {t('rooms.filters.bedrooms')}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RoomFilters;