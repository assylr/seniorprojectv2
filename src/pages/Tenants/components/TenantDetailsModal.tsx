import React from 'react';
import { TenantDetailDTO } from '@/types';
import styles from './TenantDetailsModal.module.css';

interface TenantDetailsModalProps {
    tenant: TenantDetailDTO;
    onClose: () => void;
}

const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({ tenant, onClose }) => {
    const formatDate = (date: string | null | undefined): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

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

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Tenant Details</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {/* Personal Information Section */}
                    <h3 className={styles.sectionTitle}>Personal Information</h3>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Full Name</span>
                            <span className={styles.detailValue}>{tenant.name} {tenant.surname}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email</span>
                            <span className={styles.detailValue}>{tenant.email || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Mobile</span>
                            <span className={styles.detailValue}>{tenant.mobile || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Tenant Type</span>
                            <span className={styles.detailValue}>{tenant.tenantType || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>School</span>
                            <span className={styles.detailValue}>{tenant.school || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Position</span>
                            <span className={styles.detailValue}>{tenant.position || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Visiting Guests</span>
                            <span className={styles.detailValue}>{tenant.visitingGuests || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Accommodation Information Section */}
                    <h3 className={styles.sectionTitle}>Accommodation Information</h3>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Building</span>
                            <span className={styles.detailValue}>{tenant.buildingName || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Room Number</span>
                            <span className={styles.detailValue}>{tenant.roomNumber || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Status</span>
                            <span className={`${styles.statusBadge} ${getStatusClass(tenant.status)}`}>
                                {tenant.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Arrival Date</span>
                            <span className={styles.detailValue}>{formatDate(tenant.arrivalDate)}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Departure Date</span>
                            <span className={styles.detailValue}>{formatDate(tenant.departureDate)}</span>
                        </div>
                    </div>

                    {/* Family Members Section */}
                    {tenant.familyMembers && tenant.familyMembers.length > 0 && (
                        <>
                            <h3 className={styles.sectionTitle}>Family Members</h3>
                            <ul className={styles.familyMembersList}>
                                {tenant.familyMembers.map((member, index) => (
                                    <li key={index} className={styles.familyMemberItem}>
                                        <div className={styles.familyMemberName}>
                                            {member.name} {member.surname}
                                        </div>
                                        <div className={styles.familyMemberDetails}>
                                            <span>Relationship: {member.relationship || 'N/A'}</span>
                                            <span>Mobile: {member.mobile || 'N/A'}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TenantDetailsModal; 