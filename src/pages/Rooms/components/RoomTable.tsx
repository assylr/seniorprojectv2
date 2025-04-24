import React from 'react';
import { RoomDetailDTO } from '@/types'; // Use the DTO type
import { LoadingSpinner } from '@/components/common';
import styles from './RoomTable.module.css';
import RoomTableRow from './RoomTableRow';

interface RoomTableProps {
    rooms: RoomDetailDTO[]; // Expecting the DTO array
    isLoading: boolean; // To show loading/empty states correctly
    // Add action handlers later
    // onEditRoom?: (room: RoomDetailDTO) => void;
    // onDeleteRoom?: (room: RoomDetailDTO) => void;
}

const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    isLoading,
    // onEditRoom,
    // onDeleteRoom,
}) => {

    // Adjust column count based on the final columns in RoomTableRow
    const columnCount = 8; // Update if you add/remove columns

    return (
        <div className={styles.tableContainer}>
            <table className={styles.roomTable}>
                <thead>
                    <tr>
                        <th>Room #</th>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Capacity</th>
                        <th>Area (m²)</th>
                        <th>Status / Occupancy</th>
                        {/* <th>Actions</th> */}
                    </tr>
                </thead>
                <tbody>
                    {/* Initial loading state */}
                    {isLoading && rooms.length === 0 && (
                         <tr>
                             <td colSpan={columnCount} className={styles.loadingCell}>
                                 <LoadingSpinner size="medium" />
                                 <span>Loading rooms...</span>
                             </td>
                         </tr>
                    )}

                    {/* No results state */}
                    {!isLoading && rooms.length === 0 && (
                        <tr>
                            <td colSpan={columnCount} className={styles.noResultsCell}>
                                No rooms match the current filters.
                            </td>
                        </tr>
                    )}

                    {/* Render room rows from DTO */}
                    {/* Only map if not initial loading */}
                    {!isLoading && rooms.map((room) => (
                        <RoomTableRow
                            key={room.id}
                            room={room} // Pass the entire RoomDetailDto object
                            // Pass action handlers down if needed
                            // onEdit={onEditRoom}
                            // onDelete={onDeleteRoom}
                        />
                    ))}
                </tbody>
            </table>
            {/* Optional: Add subtle loading indicator when refetching */}
            {/* {isLoading && rooms.length > 0 && <div className={styles.refetchOverlay}>Updating...</div>} */}
        </div>
    );
};

export default RoomTable;