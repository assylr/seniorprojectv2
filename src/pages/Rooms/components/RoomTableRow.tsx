import React from 'react';
import { RoomDetailDTO } from '@/types'; // Use the DTO type
import styles from './RoomTable.module.css'; // Assuming styles are in RoomTable.module.css

interface RoomTableRowProps {
  room: RoomDetailDTO;
  onView?: (room: RoomDetailDTO) => void;
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

const RoomTableRow: React.FC<RoomTableRowProps> = ({ room, onView }) => {
  const statusText = room.status;
  const statusClass = getStatusClass(room.status);

  return (
    <tr>
      <td>{room.buildingName}</td>
      <td>{room.roomNumber}</td>
      <td>{room.floorNumber ?? 'N/A'}</td>
      <td className={styles.centerAlign}>{room.bedroomCount}</td>
      <td className={styles.rightAlign}>{room.totalArea ?? 'N/A'}</td>
      <td>
        <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>
      </td>
      
      <td className={styles.actionsCell}>
        <button onClick={() => onView?.(room)} className={styles.actionButton}>View</button>
      </td>
     
    </tr>
  );
};

// Memoization can be useful for table rows if props don't change often
export default React.memo(RoomTableRow);