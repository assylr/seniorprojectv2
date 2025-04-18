import React from 'react';
import { Room, Tenant, Building } from '@/types';
import { LoadingSpinner } from '@/components/common';
import styles from './RoomTable.module.css';
import RoomTableRow from './RoomTableRow';

interface RoomTableProps {
    rooms: Room[];
    buildingsMap: Map<number, Building>;
    activeTenantsMap: Map<number, Tenant>;
    isLoading: boolean;

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
                    {rooms.map((room) => (
                        <RoomTableRow
                            key={room.id}
                            room={room}
                            building={buildingsMap.get(room.buildingId)}
                            tenant={activeTenantsMap.get(room.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;