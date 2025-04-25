import { useLanguage } from '@/contexts/LanguageContext';
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
}

const BuildingCard: React.FC<BuildingCardProps> = ({
    building,
}) => {
    const { t } = useLanguage();
    
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.buildingTypeBadge}>
                    {building.buildingType.toUpperCase()}
                </span>
            </div>

            <h2 className={styles.buildingNumber}>Block {building.buildingNumber}</h2>

            <div className={styles.buildingStats}>
                {/* Use conditional rendering for potentially null values */}
                {building.floorCount !== null && (
                    <div>
                        <span>{t('buildings.floors')}</span>
                        <span>{building.floorCount}</span>
                    </div>
                )}
                <div>
                    <span>{t('buildings.totalRooms')}</span>
                    <span>{building.totalRooms}</span>
                </div>
                <div>
                    <span>{t('buildings.occupied')}</span>
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
                    <span>{t('buildings.occupancy')}</span>
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