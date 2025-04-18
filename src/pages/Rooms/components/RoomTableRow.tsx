import React from 'react';
import { Room, Tenant, Building } from '@/types';
import styles from './RoomTable.module.css';

interface RoomTableRowProps {
  room: Room;
  building: Building | undefined;
  tenant: Tenant | undefined;
}

const RoomTableRow: React.FC<RoomTableRowProps> = ({ room, building, tenant }) => {
  const isOccupied = !!tenant;
  const statusText = isOccupied ? 'Occupied' : 'Available';
  const statusClass = isOccupied ? styles.statusOccupied : styles.statusAvailable;

  return (
    <tr>
      <td>{room.roomNumber}</td>
      <td>{building ? building.buildingNumber : `ID: ${room.buildingId}`}</td>
      <td>{room.floorNumber ?? 'N/A'}</td>
      <td className={styles.centerAlign}>{room.bedroomCount}</td>
      <td className={styles.rightAlign}>{room.totalArea}</td>
      <td className={styles.rightAlign}>
        {room.baseRent != null ? `$${room.baseRent.toFixed(2)}` : 'N/A'}
      </td>
      <td>
        <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>
      </td>
      <td>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '---'}</td>
    </tr>
  );
};

export default React.memo(RoomTableRow);
