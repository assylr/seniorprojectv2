// src/pages/Rooms/components/RoomTable.tsx
import React from 'react';
// Adjust path as necessary
import { Room, Tenant, Building } from '../../../services/types';
import { LoadingSpinner } from '../../../components/common';
import styles from './RoomTable.module.css';

interface RoomTableProps {
    rooms: Room[]; // The filtered list of rooms to display
    buildingsMap: Map<number, Building>; // Map for efficient building lookup
    activeTenantsMap: Map<number, Tenant>; // Map for efficient tenant lookup (roomId -> Tenant)
    isLoading: boolean; // Indicates if the parent is loading data (for empty/loading states)
    // Optional action handlers (add if functionality is needed)
    // onEditRoom?: (room: Room) => void;
    // onDeleteRoom?: (room: Room) => void;
}

const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    buildingsMap,
    activeTenantsMap,
    isLoading,
    // onEditRoom,
    // onDeleteRoom,
}) => {

    // Helper to get building number from the map
    const getBuildingNumber = (buildingId: number): string => {
        return buildingsMap.get(buildingId)?.buildingNumber || `ID: ${buildingId}`;
    };

     // Helper to get tenant name from the map
    const getTenantName = (roomId: number): string => {
        const tenant = activeTenantsMap.get(roomId);
        // Check if tenant exists before accessing properties
        return tenant ? `${tenant.firstName} ${tenant.lastName}` : '---';
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.roomTable}>
                <thead>
                    <tr>
                        <th>Room #</th>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Bedrooms</th>
                        <th>Area (m²)</th>
                        <th>Base Rent</th>
                        <th>Status</th>
                        <th>Occupant</th>
                        {/* Uncomment if actions are added */}
                        {/* <th>Actions</th> */}
                    </tr>
                </thead>
                <tbody>
                    {/* Show loading state row only if parent says it's loading AND table has no data yet */}
                    {isLoading && rooms.length === 0 && (
                         <tr>
                             <td colSpan={8} className={styles.loadingCell}> {/* Adjust colSpan */}
                                 <LoadingSpinner size="medium" />
                                 <span>Loading rooms...</span>
                             </td>
                         </tr>
                    )}

                    {/* Show "no results" row if not loading and the filtered list is empty */}
                    {!isLoading && rooms.length === 0 && (
                        <tr>
                            <td colSpan={8} className={styles.noResultsCell}> {/* Adjust colSpan */}
                                No rooms match the current filters.
                            </td>
                        </tr>
                    )}

                    {/* Render room rows if not loading or if rows exist */}
                    {rooms.map((room) => {
                        // Determine status based on tenant map
                        const isOccupied = activeTenantsMap.has(room.id);
                        const statusText = isOccupied ? 'Occupied' : 'Available';
                        const statusClass = isOccupied ? styles.statusOccupied : styles.statusAvailable;

                        return (
                            <tr key={room.id}>
                                <td>{room.roomNumber}</td>
                                <td>{getBuildingNumber(room.buildingId)}</td>
                                <td>{room.floorNumber ?? 'N/A'}</td>
                                <td className={styles.centerAlign}>{room.bedroomCount}</td>
                                <td className={styles.rightAlign}>{room.totalArea}</td>
                                <td className={styles.rightAlign}>
                                    {/* Handle null/undefined for baseRent */}
                                    {room.baseRent != null ? `$${room.baseRent.toFixed(2)}` : 'N/A'}
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${statusClass}`}>
                                        {statusText}
                                    </span>
                                </td>
                                <td>{getTenantName(room.id)}</td>
                                {/* Actions Cell - Uncomment and populate if actions are added */}
                                {/*
                                <td className={styles.actionsCell}>
                                    {onEditRoom && (
                                        <button onClick={() => onEditRoom(room)} className={styles.actionButton} title="Edit Room">✏️ Edit</button>
                                    )}
                                    {onDeleteRoom && (
                                        <button onClick={() => onDeleteRoom(room)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Delete Room">🗑️ Delete</button>
                                    )}
                                </td>
                                */}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;