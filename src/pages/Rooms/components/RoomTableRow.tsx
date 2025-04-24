import React from 'react';
import { RoomDetailDTO } from '@/types'; // Use the DTO type
import styles from './RoomTable.module.css'; // Assuming styles are in RoomTable.module.css

interface RoomTableRowProps {
  room: RoomDetailDTO; // Expecting the DTO object
  // Add action handlers passed from parent if needed
  // onEdit?: (room: RoomDetailDTO) => void;
  // onDelete?: (room: RoomDetailDTO) => void;
}

// Helper function to get status class (optional, can do inline)
const getStatusClass = (status: RoomDetailDTO['status']): string => {
    switch (status) {
        case 'OCCUPIED': return styles.statusOccupied;
        case 'MAINTENANCE': return styles.statusMaintenance;
        case 'AVAILABLE':
        default: return styles.statusAvailable;
    }
}

const RoomTableRow: React.FC<RoomTableRowProps> = ({ room /*, onEdit, onDelete */ }) => {
  // Get status and class directly from DTO
  const statusText = room.status;
  const statusClass = getStatusClass(room.status);

  // Format occupancy string
  const occupancyText = `${room.currentOccupancyCount} / ${room.bedroomCount}`;

  return (
    <tr>
      {/* Access data directly from the room DTO */}
      <td>{room.roomNumber}</td>
      <td>{room.buildingName}</td> {/* Use joined building name/number */}
      <td>{room.floorNumber ?? 'N/A'}</td>
      <td className={styles.centerAlign}>{room.bedroomCount}</td>
      <td className={styles.rightAlign}>{room.totalArea ?? 'N/A'}</td>
      {/* Display Status Badge and Occupancy */}
      <td>
        <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>
        {/* Optionally show occupancy count next to status */}
        {/* {statusText !== 'Maintenance' && ( <span> ({occupancyText})</span> )} */}
         <span className={styles.occupancyCount}>({occupancyText})</span>
      </td>
      {/* Add Actions cell later */}
      {/*
      <td className={styles.actionsCell}>
        <button onClick={() => onEdit?.(room)} className={styles.actionButton}>Edit</button>
        <button onClick={() => onDelete?.(room)} className={styles.actionButtonDelete}>Delete</button>
      </td>
      */}
    </tr>
  );
};

// Memoization can be useful for table rows if props don't change often
export default React.memo(RoomTableRow);