import React from 'react';
import { Building } from '../../../types/building';
import styles from './BuildingCard.module.css';

export interface BuildingSummary extends Building {
    totalRooms: number;
    occupiedRooms: number;
    loadPercentage: number;
}

interface BuildingCardProps {
    building: BuildingSummary;
    // onViewDetails: (id: number) => void; // Placeholder for navigation
}

const BuildingCard: React.FC<BuildingCardProps> = ({
    building,
}) => {
    
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.buildingTypeBadge}>
                    {/* Capitalize building type */}
                    {building.buildingType.charAt(0).toUpperCase() + building.buildingType.slice(1)}
                </span>
            </div>

            <h2 className={styles.buildingNumber}>Building {building.buildingNumber}</h2>

            <div className={styles.buildingStats}>
                {/* Use conditional rendering for potentially null values */}
                {building.floorCount !== null && (
                    <div>
                        <span>Floors</span>
                        <span>{building.floorCount}</span>
                    </div>
                )}
                <div>
                    <span>Total Rooms</span>
                    <span>{building.totalRooms}</span>
                </div>
                <div>
                    <span>Occupied</span>
                    <span>{building.occupiedRooms}</span>
                </div>
                {building.totalArea !== null && (
                    <div>
                        <span>Area (m²)</span>
                        <span>{building.totalArea}</span>
                    </div>
                )}
            </div>

            <div className={styles.occupancySection}>
                <div className={styles.occupancyHeader}>
                    <span>Occupancy</span>
                    <span className={styles.occupancyPercentage}>
                        {building.loadPercentage.toFixed(1)}%
                    </span>
                </div>
                <div className={styles.occupancyBarContainer}>
                    <div
                        className={styles.occupancyBar}
                        style={{ width: `${building.loadPercentage}%` }}
                        aria-valuenow={building.loadPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        role="progressbar"
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default BuildingCard;