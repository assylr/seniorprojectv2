import { useLanguage } from '@/contexts/LanguageContext';
import React, { useEffect, useMemo, useState } from 'react';
import { AlertMessage, LoadingSpinner } from '../../components/common';
import { getBuildings, getRooms } from '../../services/api';
import styles from './BuildingsPage.module.css';
import BuildingCard, { BuildingSummary } from './components/BuildingCard';

const BuildingsPage: React.FC = () => {
    const { t } = useLanguage();
    const [buildings, setBuildings] = useState<BuildingSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<keyof BuildingSummary | 'buildingNumber'>('buildingNumber');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [buildingsData, roomsData] = await Promise.all([
                    getBuildings(),
                    getRooms()
                ]);

                const buildingSummaries = buildingsData.map(building => {
                    const buildingRooms = roomsData.filter(room => room.buildingId === building.id);
                    const totalRooms = buildingRooms.length;
                    const occupiedRooms = buildingRooms.filter(room => room.status === 'OCCUPIED').length;
                    const loadPercentage = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

                    return {
                        ...building,
                        totalRooms,
                        occupiedRooms,
                        loadPercentage
                    };
                });

                setBuildings(buildingSummaries);
            } catch (err: unknown) {
                let errorMessage = t('buildings.error');
                if (err instanceof Error) errorMessage = err.message;
                setError(errorMessage);
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [t]);

    const sortedBuildings = useMemo(() => {
        return [...buildings].sort((a, b) => {
            switch(sortBy) {
                case 'loadPercentage':
                    return b.loadPercentage - a.loadPercentage;
                case 'totalRooms':
                    return b.totalRooms - a.totalRooms;
                case 'buildingNumber':
                default:
                    return (a.buildingNumber ?? '').localeCompare(b.buildingNumber ?? '');
            }
        });
    }, [buildings, sortBy]);

    return (
        <div className={styles.pageContainer}>
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>{t('buildings.title')}</h1>
                <div className={styles.controls}>
                    <div className={styles.sortControls}>
                        <label htmlFor="sortBy">{t('buildings.sortBy')}</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as keyof BuildingSummary | 'buildingNumber')}
                            disabled={isLoading}
                        >
                            <option value="buildingNumber">{t('buildings.buildingNumber')}</option>
                            <option value="loadPercentage">{t('buildings.occupancyHighest')}</option>
                            <option value="totalRooms">{t('buildings.totalRoomsHighest')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>{t('buildings.loading')}</p>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {sortedBuildings.length === 0 ? (
                        <p className={styles.noDataMessage}>{t('buildings.noData')}</p>
                    ) : (
                        <div className={styles.cardGrid}>
                            {sortedBuildings.map((building) => (
                                <BuildingCard
                                    key={building.id}
                                    building={building}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BuildingsPage;