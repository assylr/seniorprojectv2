import React from 'react';
import { TenantDetailDTO } from '@/types';
import styles from './TenantDetailsModal.module.css';

interface TenantDetailsModalProps {
    tenant: TenantDetailDTO | null;
    onClose: () => void;
}

const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({ tenant, onClose }) => {
    if (!tenant) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Tenant Details</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Name:</span>
                            <span className={styles.detailValue}>{`${tenant.name} ${tenant.surname}`}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Type:</span>
                            <span className={styles.detailValue}>{tenant.tenantType}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Status:</span>
                            <span className={styles.detailValue}>{tenant.status}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Room Number:</span>
                            <span className={styles.detailValue}>{tenant.roomNumber}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Arrival Date:</span>
                            <span className={styles.detailValue}>
                                {new Date(tenant.arrivalDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Departure Date:</span>
                            <span className={styles.detailValue}>
                                {tenant.departureDate ? new Date(tenant.departureDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email:</span>
                            <span className={styles.detailValue}>{tenant.email || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Phone:</span>
                            <span className={styles.detailValue}>{tenant.mobile || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Building:</span>
                            <span className={styles.detailValue}>{tenant.buildingName || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDetailsModal; 