// src/pages/Tenants/components/TenantTable.tsx
import React from 'react';
import { Tenant, Room, Building } from '../../../services/types'; // Adjust path
import { LoadingSpinner } from '../../../components/common'; // Adjust path
import styles from './TenantTable.module.css';

interface TenantTableProps {
    tenants: Tenant[];
    rooms: Room[]; // Pass rooms to look up details
    buildings: Building[]; // Pass buildings to look up details
    isLoading: boolean; // To show loading state within the table body perhaps
    isSubmitting: boolean; // To disable action buttons
    onEditTenant: (tenant: Tenant) => void;
    onCheckOutTenant: (tenant: Tenant) => void;
    // Optional: Add handlers for delete, view details etc.
}

const TenantTable: React.FC<TenantTableProps> = ({
    tenants,
    rooms,
    buildings,
    isLoading, // Note: Parent usually handles overall loading, this might be for inline indicators
    isSubmitting,
    onEditTenant,
    onCheckOutTenant,
}) => {

    // Helper function to get room/building details - can be optimized
    const getRoomInfo = (roomId: number | null): string => {
        if (!roomId) return 'N/A';
        const room = rooms.find(r => r.id === roomId);
        if (!room) return 'N/A';
        const building = buildings.find(b => b.id === room.buildingId);
        return `${building?.buildingNumber || '?'}-${room.roomNumber}`;
    };

    // Helper function to determine status
    const getTenantStatus = (tenant: Tenant): { text: string; className: string } => {
        // Example logic - adjust based on how you define 'checked-out'
        const isCheckedOut = !!tenant.expectedDepartureDate && new Date(tenant.expectedDepartureDate) <= new Date();
        if (isCheckedOut) {
            return { text: 'Checked Out', className: styles.statusCheckedOut };
        }
        // Add other statuses if needed (e.g., Pending Arrival)
        return { text: 'Active', className: styles.statusActive };
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.tenantTable}>
                <thead>
                    <tr>
                        {/* Define your table headers */}
                        <th>Name</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Arrival</th>
                        <th>Departure</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Handle case where parent is loading initially */}
                    {isLoading && tenants.length === 0 && (
                         <tr>
                             <td colSpan={8} className={styles.loadingCell}>
                                 <LoadingSpinner size="medium" />
                                 <span>Loading tenants...</span>
                             </td>
                         </tr>
                    )}

                    {/* Handle no results after filtering */}
                    {!isLoading && tenants.length === 0 && (
                        <tr>
                            <td colSpan={8} className={styles.noResultsCell}>
                                No tenants match the current filters.
                            </td>
                        </tr>
                    )}

                    {/* Render tenant rows */}
                    {!isLoading && tenants.map((tenant) => {
                        const statusInfo = getTenantStatus(tenant);
                        return (
                            <tr key={tenant.id}>
                                <td>{tenant.firstName} {tenant.lastName}</td>
                                <td>{tenant.tenantType}</td>
                                <td>
                                    {/* Display contact info concisely */}
                                    {tenant.email && <div>{tenant.email}</div>}
                                    {tenant.mobile && <div>{tenant.mobile}</div>}
                                </td>
                                <td>{getRoomInfo(tenant.currentRoomId)}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                                        {statusInfo.text}
                                    </span>
                                </td>
                                <td>
                                    {tenant.arrivalDate
                                        ? new Date(tenant.arrivalDate).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td>
                                    {tenant.expectedDepartureDate
                                        ? new Date(tenant.expectedDepartureDate).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td className={styles.actionsCell}>
                                    <button
                                        onClick={() => onEditTenant(tenant)}
                                        className={styles.actionButton}
                                        title="Edit Tenant"
                                        disabled={isSubmitting}
                                    >
                                        ✏️ Edit
                                    </button>
                                    {/* Only show Check Out if tenant is active */}
                                    {!tenant.expectedDepartureDate && (
                                        <button
                                            onClick={() => onCheckOutTenant(tenant)}
                                            className={`${styles.actionButton} ${styles.checkOutButton}`}
                                            title="Check Out Tenant"
                                            disabled={isSubmitting}
                                        >
                                            🚪 Check Out
                                        </button>
                                    )}
                                    {/* Add Delete button if needed */}
                                    {/* <button
                                        onClick={() => onDeleteTenant(tenant)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        title="Delete Tenant"
                                        disabled={isSubmitting}
                                    >
                                        🗑️ Delete
                                    </button> */}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TenantTable;