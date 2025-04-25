import React, { useEffect, useState, useMemo } from 'react';
import { getBuildings, getRooms } from '../../services/api';
import { LoadingSpinner, AlertMessage } from '../../components/common';
import BuildingCard, { BuildingSummary } from './components/BuildingCard';
import styles from './BuildingsPage.module.css';

const BuildingsPage: React.FC = () => {

    const [buildings, setBuildings] = useState<BuildingSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<keyof BuildingSummary | 'buildingNumber'>('buildingNumber'); // Use keys for type safety

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

                let errorMessage = "Failed to fetch building data";

                if (err instanceof Error) errorMessage = err.message;

                setError(errorMessage);
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []); // Empty dependency array runs once on mount

    // --- Sorting Logic (Memoized) ---
    const sortedBuildings = useMemo(() => {
        return [...buildings].sort((a, b) => {
            switch(sortBy) {
                case 'loadPercentage':
                    return b.loadPercentage - a.loadPercentage;
                case 'totalRooms':
                    return b.totalRooms - a.totalRooms;
                case 'buildingNumber': // Fallback to buildingNumber
                default:
                    // Handle potential null/undefined if buildingNumber isn't guaranteed
                    return (a.buildingNumber ?? '').localeCompare(b.buildingNumber ?? '');
            }
        });
    }, [buildings, sortBy]); // Recalculate only when buildings or sortBy changes


    // --- Render Logic ---
    return (
        <div className={styles.pageContainer}>
            {/* Use AlertMessage for feedback */}
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>Blocks</h1>
                <div className={styles.controls}>
                     {/* Sort Controls */}
                    <div className={styles.sortControls}>
                        <label htmlFor="sortBy">Sort by:</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as keyof BuildingSummary | 'buildingNumber')}
                            disabled={isLoading} // Disable while loading
                        >
                            <option value="buildingNumber">Building Number</option>
                            <option value="loadPercentage">Occupancy (Highest)</option>
                            <option value="totalRooms">Total Rooms (Highest)</option>
                        </select>
                    </div>
                 </div>

            </div>

            {/* Loading State */}
            {isLoading && (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>Loading buildings...</p>
                </div>
            )}

            {/* Data Display */}
            {!isLoading && !error && (
                <>
                    {sortedBuildings.length === 0 ? (
                         <p className={styles.noDataMessage}>No buildings found.</p>
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