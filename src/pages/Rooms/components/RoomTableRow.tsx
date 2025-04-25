import React, { useState } from 'react';
import { RoomDetailDTO } from '@/types'; // Use the DTO type
import styles from './RoomTableRow.module.css'; // Assuming styles are in RoomTableRow.module.css
import RoomDetailsModal from './RoomDetailsModal';

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

const RoomTableRow: React.FC<RoomTableRowProps> = ({ room }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = () => {
    setIsModalOpen(true);
  };

  const statusText = room.status;
  const statusClass = getStatusClass(room.status);

  return (
    <>
      <tr>
        <td>{room.buildingName}</td>
        <td>{room.roomNumber}</td>
        <td>{room.floorNumber ?? 'N/A'}</td>
        <td>{room.bedroomCount}</td>
        <td>{room.totalArea ?? 'N/A'}</td>
        <td>
          <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>
        </td>
        
        <td className={styles.actionsCell}>
          <button onClick={handleViewClick} className={styles.actionButton}>View</button>
        </td>
       
      </tr>
      <RoomDetailsModal
        room={room}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

// Memoization can be useful for table rows if props don't change often
export default React.memo(RoomTableRow);