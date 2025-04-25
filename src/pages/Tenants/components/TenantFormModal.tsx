// src/pages/Tenants/components/TenantFormModal.tsx
import React, { useState } from 'react';
import { Tenant, TenantFormData, Building, Room } from '../../../types'; // Adjust path
import { createTenant, updateTenant } from '../../../services/api'; // Keep API calls here
import Modal from '../../../components/common/Modal';
import TenantForm from './TenantForm';
import { AlertMessage } from '../../../components/common';

interface TenantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Pass back the submitted tenant AND whether it was an edit operation
    onSubmitSuccess: (tenant: Tenant, isEdit: boolean) => void;
    tenantToEdit?: Tenant | null;
    buildings: Building[];
    rooms: Room[];
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess,
    tenantToEdit = null,
    buildings,
    rooms,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = Boolean(tenantToEdit);
    const modalTitle = isEditMode ? 'Edit Tenant' : 'Add New Tenant & Check In';

    const handleFormSubmit = async (formData: TenantFormData) => {
        console.log('TenantFormModal - Submit button clicked');
        console.log('TenantFormModal - Form data received:', formData);
        
        setIsSubmitting(true);
        setError(null);

        try {
            let resultTenant: Tenant;
            if (isEditMode && tenantToEdit) {
                console.log('TenantFormModal - Updating tenant:', tenantToEdit.id);
                resultTenant = await updateTenant(tenantToEdit.id, formData);
            } else {
                console.log('TenantFormModal - Creating new tenant');
                resultTenant = await createTenant(formData);
            }
            
            console.log('TenantFormModal - Success:', resultTenant);
            onSubmitSuccess(resultTenant, isEditMode);
            handleClose();
        } catch (err: any) {
            console.error('TenantFormModal - Error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to process tenant');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear error when closing modal
    const handleClose = () => {
        setError(null); // Clear error state on close
        onClose();
    };

    // Prevent closing modal if submitting? Optional.
    const handleAttemptClose = () => {
        if (!isSubmitting) {
            handleClose();
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleAttemptClose} // Use attempt close
            title={modalTitle}
            size="xlarge" // Adjust size as needed
        >
            {/* Display error specific to the modal submission */}
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <TenantForm
                onSubmit={handleFormSubmit}
                onCancel={handleAttemptClose} // Use attempt close
                initialData={tenantToEdit}
                isSubmitting={isSubmitting}
                buildings={buildings}
                rooms={rooms}
            />
        </Modal>
    );
};

export default TenantFormModal;