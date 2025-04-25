// src/pages/Tenants/components/TenantTableRow.tsx
import React from 'react';
import { TenantDetailDTO } from '@/types'; // Adjust path if needed
import styles from './TenantTable.module.css'; // Assuming styles are shared or adjust path

interface TenantTableRowProps {
    tenant: TenantDetailDTO;
    isSubmitting: boolean;
    onCheckOutTenant: (tenant: TenantDetailDTO) => void;
    onViewTenant: (tenant: TenantDetailDTO) => void;
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
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return styles.statusActive;
        case 'CHECKED_OUT':
            return styles.statusCheckedOut;
        case 'PENDING':
            return styles.statusPending;
        default:
            return '';
    }
};

// Helper function for status text formatting
const formatStatusText = (status: string | undefined): string => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').toUpperCase();
};

const TenantTableRow: React.FC<TenantTableRowProps> = ({
    tenant,
    isSubmitting,
    onCheckOutTenant,
    onViewTenant,
}) => {
    console.log('Rendering TenantTableRow for tenant:', tenant);
    console.log('Tenant ID in row:', tenant.id);

    // Prepare display data within the row component
    const statusText = formatStatusText(tenant.status);
    const statusClass = getStatusClass(tenant.status);
    const locationInfo = tenant.buildingName && tenant.roomNumber
        ? `${tenant.buildingName} - ${tenant.roomNumber}`
        : (tenant.buildingName || tenant.roomNumber || 'N/A');

    return (
        <tr key={tenant.id}> {/* Key remains important */}
            <td>{tenant.name} {tenant.surname}</td>
            <td>{tenant.tenantType || 'N/A'}</td>
            <td>{locationInfo}</td>
            <td>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                    {statusText}
                </span>
            </td>
            <td>{formatDate(tenant.arrivalDate)}</td>
            <td>{formatDate(tenant.departureDate)}</td>
            <td className={styles.actionsCell}>
                <button
                    onClick={() => onViewTenant(tenant)}
                    className={`${styles.actionButton} ${styles.viewButton}`}
                    disabled={isSubmitting}
                    aria-label="View tenant details"
                >
                    View
                </button>
                {tenant.status === 'ACTIVE' && (
                    <button
                        onClick={() => {
                            console.log('Checkout button clicked for tenant:', tenant);
                            console.log('Tenant ID in button click:', tenant.id);
                            onCheckOutTenant(tenant);
                        }}
                        className={`${styles.actionButton} ${styles.checkOutButton}`}
                        disabled={isSubmitting}
                        aria-label="Check out tenant"
                    >
                        Check Out
                    </button>
                )}
            </td>
        </tr>
    );
};

// Wrap with React.memo for performance optimization
export default React.memo(TenantTableRow);