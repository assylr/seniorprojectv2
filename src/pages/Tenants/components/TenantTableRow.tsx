// src/pages/Tenants/components/TenantTableRow.tsx
import React from 'react';
import { TenantDetailDTO } from '@/types'; // Adjust path if needed
import styles from './TenantTable.module.css'; // Assuming styles are shared or adjust path

interface TenantTableRowProps {
    tenant: TenantDetailDTO;
    isSubmitting: boolean;
    onEditTenant: (tenant: TenantDetailDTO) => void;
    onCheckOutTenant: (tenant: TenantDetailDTO) => void;
    // Add other handlers like onViewDetails if needed
}

// Helper function for date formatting specific to the row
const formatDate = (dateInput: string | null | undefined): string => {
    if (!dateInput) return 'N/A';
    try {
        // Format string date (YYYY-MM-DD or ISO)
        return new Date(dateInput + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC' }); // Ensure consistent date parsing
    } catch (error) {
        console.error("Date formatting error:", dateInput, error);
        return 'Invalid Date';
    }
};

// Helper function for status class specific to the row
const getStatusClass = (status: string | undefined): string => {
    const lowerStatus = status?.toLowerCase() || '';
    switch (lowerStatus) {
        case 'active': return styles.statusActive;
        case 'checked-out': return styles.statusCheckedOut;
        case 'pending': return styles.statusPending;
        default: return styles.statusUnknown;
    }
}

const TenantTableRow: React.FC<TenantTableRowProps> = ({
    tenant,
    isSubmitting,
    onEditTenant,
    onCheckOutTenant,
}) => {
    // Prepare display data within the row component
    const statusText = tenant.status || 'Unknown';
    const statusClass = getStatusClass(tenant.status);
    const locationInfo = tenant.buildingName && tenant.roomNumber
        ? `${tenant.buildingName} - ${tenant.roomNumber}`
        : (tenant.buildingName || tenant.roomNumber || 'N/A');

    return (
        <tr key={tenant.id}> {/* Key remains important */}
            <td>{tenant.name} {tenant.name}</td> {/* Use firstName/lastName if DTO has them */}
            <td>{tenant.tenantType || 'N/A'}</td>
            <td>{locationInfo}</td>
            <td>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                    {statusText}
                </span>
            </td>
            <td>{formatDate(tenant.checkInDate)}</td>
            <td>{formatDate(tenant.expectedDepartureDate)}</td>
            <td className={styles.actionsCell}>
                <button
                    type="button"
                    onClick={() => onEditTenant(tenant)} // Pass the specific tenant object
                    className={`${styles.actionButton} ${styles.editButton}`}
                    title="Edit Tenant"
                    disabled={isSubmitting}
                    aria-label={`Edit ${tenant.name} ${tenant.surname}`}
                >
                    Edit
                </button>
                {tenant.status?.toLowerCase() === 'active' && (
                    <button
                        type="button"
                        onClick={() => onCheckOutTenant(tenant)} // Pass the specific tenant object
                        className={`${styles.actionButton} ${styles.checkOutButton}`}
                        title="Check Out Tenant"
                        disabled={isSubmitting}
                        aria-label={`Check out ${tenant.name} ${tenant.surname}`}
                    >
                        Check Out
                    </button>
                )}
                {/* Add other action buttons here */}
            </td>
        </tr>
    );
};

// Wrap with React.memo for performance optimization
export default React.memo(TenantTableRow);