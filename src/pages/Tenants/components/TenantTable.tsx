// src/pages/Tenants/components/TenantTable.tsx
import React from 'react';
import { TenantDetailDTO } from '@/types'; // Adjust path if needed
import styles from './TenantTable.module.css';
import TenantTableRow from './TenantTableRow'; // Import the new component

interface TenantTableProps {
    tenants: TenantDetailDTO[];
    isSubmitting: boolean;
    onCheckOutTenant: (tenant: TenantDetailDTO) => void;
    onViewTenant: (tenant: TenantDetailDTO) => void;
}

const TenantTable: React.FC<TenantTableProps> = ({
    tenants,
    isSubmitting,
    onCheckOutTenant,
    onViewTenant,
}) => {
    const columnCount = 6; // Updated: Name, Type, Location, Status, Arrival, Actions

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
                            onCheckOutTenant={onCheckOutTenant} // Pass handler down
                            onViewTenant={onViewTenant}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TenantTable;