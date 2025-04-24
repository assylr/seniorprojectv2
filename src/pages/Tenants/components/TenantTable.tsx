// src/pages/Tenants/components/TenantTable.tsx
import React from 'react';
import { TenantDetailDTO } from '@/types'; // Adjust path if needed
import styles from './TenantTable.module.css';
import TenantTableRow from './TenantTableRow'; // Import the new component

interface TenantTableProps {
    tenants: TenantDetailDTO[];
    isSubmitting: boolean;
    onEditTenant: (tenant: TenantDetailDTO) => void;
    onCheckOutTenant: (tenant: TenantDetailDTO) => void;
    // Add other handlers if needed by TenantTableRow
}

const TenantTable: React.FC<TenantTableProps> = ({
    tenants,
    isSubmitting,
    onEditTenant,
    onCheckOutTenant,
    // Pass down other handlers if added
}) => {

    // Adjust column count based on the actual headers
    const columnCount = 7; // Name, Type, Location, Status, Arrival, Departure, Actions

    return (
        <div className={styles.tableContainer}>
            <table className={styles.tenantTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Arrival</th>
                        <th>Departure (Exp.)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Handle empty state */}
                    {tenants.length === 0 && (
                        <tr>
                            <td colSpan={columnCount} className={styles.noResultsCell}>
                                No tenants match the current filters.
                            </td>
                        </tr>
                    )}

                    {/* Map tenants array to TenantTableRow components */}
                    {tenants.map((tenant) => (
                        <TenantTableRow
                            key={tenant.id} // Key goes on the component rendered in map
                            tenant={tenant}
                            isSubmitting={isSubmitting}
                            onEditTenant={onEditTenant} // Pass handler down
                            onCheckOutTenant={onCheckOutTenant} // Pass handler down
                            // Pass other handlers down as needed
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TenantTable;