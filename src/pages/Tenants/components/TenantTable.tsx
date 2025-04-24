// src/pages/Tenants/components/TenantTable.tsx
import React from 'react';
import { Tenant, Room, Building } from '@/types'; // Adjust path
import { LoadingSpinner } from '@/components/common'; // Adjust path
import styles from './TenantTable.module.css';

interface TenantTableProps {
    tenants: Tenant[];
    // Receive maps instead of arrays
    roomsMap: Map<number, Room>;
    buildingsMap: Map<number, Building>;
    isSubmitting: boolean; // For disabling row actions
    onEditTenant: (tenant: Tenant) => void;
    onCheckOutTenant: (tenant: Tenant) => void;
    // Optional: Add handlers for delete, view details etc.
    // onDeleteTenant?: (tenant: Tenant) => void;
}

const TenantTable: React.FC<TenantTableProps> = ({
    tenants,
    roomsMap,
    buildingsMap,
    isSubmitting,
    onEditTenant,
    onCheckOutTenant,
    // onDeleteTenant,
}) => {

    // Helper uses maps now - much faster
    const getRoomInfo = (roomId: number | null | undefined): string => {
        if (!roomId) return 'N/A';
        const room = roomsMap.get(roomId);
        if (!room) return 'Unknown Room'; // Handle case where room ID is invalid
        const building = buildingsMap.get(room.buildingId);
        // Combine building number and room number
        return `${building?.buildingNumber ?? '?'}-${room.roomNumber}`;
    };

    // Status calculation remains the same conceptually
    const getTenantStatus = (tenant: Tenant): { text: string; className: string } => {
        const isCheckedOut = !!tenant.expectedDepartureDate && new Date(tenant.expectedDepartureDate) <= new Date();
        if (isCheckedOut) {
            return { text: 'Checked Out', className: styles.statusCheckedOut };
        }
        return { text: 'Active', className: styles.statusActive };
    };

    // Helper for date formatting
    const formatDate = (dateInput: Date | string | null | undefined): string => {
        if (!dateInput) return 'N/A';
        try {
            // Handles both Date objects and valid date strings
            return new Date(dateInput).toLocaleDateString();
        } catch (error: unknown) {
            let msg = null;
            if (error instanceof Error)
                msg = error.message
            return `Invalid Date: ${msg}`;
        }
    };


    return (
        <div className={styles.tableContainer}>
            <table className={styles.tenantTable}>
                <thead>
                    <tr>
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
                    {/* Loading/No Results handled by parent, only render rows */}
                    {tenants.length === 0 && (
                        <tr>
                            <td colSpan={8} className={styles.noResultsCell}>
                                No tenants match the current filters.
                            </td>
                        </tr>
                    )}

                    {tenants.map((tenant) => {
                        const statusInfo = getTenantStatus(tenant);
                        const locationInfo = getRoomInfo(tenant.currentRoomId);

                        return (
                            <tr key={tenant.id}>
                                <td>
                                    {tenant.name} {tenant.surname}
                                </td>
                                <td>{tenant.tenantType}</td>
                                <td className={styles.contactCell}>
                                    {tenant.email && <div>{tenant.email}</div>}
                                    {tenant.mobile && <div>{tenant.mobile}</div>}
                                    {!tenant.email && !tenant.mobile && 'N/A'}
                                </td>
                                <td>{locationInfo}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                                        {statusInfo.text}
                                    </span>
                                </td>
                                <td>{formatDate(tenant.arrivalDate)}</td>
                                <td>{formatDate(tenant.expectedDepartureDate)}</td>
                                <td className={styles.actionsCell}>
                                    <button
                                        type="button"
                                        onClick={() => onEditTenant(tenant)}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                        title="Edit Tenant"
                                        disabled={isSubmitting}
                                        aria-label={`Edit ${tenant.firstName} ${tenant.lastName}`}
                                    >
                                        {/* Use text or icons consistently */}
                                        Edit
                                    </button>
                                    {/* Only show Check Out if tenant is active (not already checked out) */}
                                    {statusInfo.text === 'Active' && (
                                        <button
                                            type="button"
                                            onClick={() => onCheckOutTenant(tenant)}
                                            className={`${styles.actionButton} ${styles.checkOutButton}`}
                                            title="Check Out Tenant"
                                            disabled={isSubmitting}
                                            aria-label={`Check out ${tenant.firstName} ${tenant.lastName}`}
                                        >
                                             Check Out
                                        </button>
                                    )}
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