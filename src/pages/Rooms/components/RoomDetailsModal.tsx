import React from 'react';
import { RoomDetailDTO } from '@/types';
import styles from './RoomDetailsModal.module.css';

interface RoomDetailsModalProps {
    room: RoomDetailDTO;
    isOpen: boolean;
    onClose: () => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Room Details</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.section}>
                        <h3>Room Information</h3>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Building:</span>
                                <span className={styles.value}>{room.buildingName}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Room Number:</span>
                                <span className={styles.value}>{room.roomNumber}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Floor:</span>
                                <span className={styles.value}>{room.floorNumber}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Bedrooms:</span>
                                <span className={styles.value}>{room.bedroomCount}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Area:</span>
                                <span className={styles.value}>{room.totalArea} m²</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Status:</span>
                                <span className={`${styles.statusBadge} ${styles[room.status.toLowerCase()]}`}>
                                    {room.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {room.currentOccupancyCount > 0 && (
                        <div className={styles.section}>
                            <h3>Current Occupancy</h3>
                            <div className={styles.occupancyInfo}>
                                <span className={styles.occupancyCount}>
                                    {room.currentOccupancyCount} {room.currentOccupancyCount === 1 ? 'person' : 'people'} currently residing
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomDetailsModal; 