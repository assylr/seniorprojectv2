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
        setIsSubmitting(true);
        setError(null);

        // Note: Backend is assumed to handle room assignment logic (updating Room.isAvailable)
        try {
            let resultTenant: Tenant;
            if (isEditMode && tenantToEdit) {
                // Ensure ID is present for update
                resultTenant = await updateTenant(tenantToEdit.id, formData);
                console.log('Tenant updated:', resultTenant);
            } else {
                 // Remove potentially empty 'id' if present in formData for create
                 // const { id, ...createData } = formData; // Adjust if 'id' is part of TenantFormData
                resultTenant = await createTenant(formData); // Pass data without ID for creation
                console.log('Tenant created:', resultTenant);
            }
            // Pass the result and the mode back to the parent page
            onSubmitSuccess(resultTenant, isEditMode);

        } catch (err: any) {
            // Provide more specific error messages if possible
            const message = err?.response?.data?.message || err?.message || (isEditMode ? 'Failed to update tenant' : 'Failed to create tenant');
            setError(message);
            console.error("Form submission error:", err);
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