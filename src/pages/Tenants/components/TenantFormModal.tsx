// src/pages/Tenants/components/TenantFormModal.tsx
import React, { useState } from 'react';
// Use DTO for input, Tenant for output (based on current API assumptions)
import { Tenant, TenantDetailDTO, TenantFormData, Building, Room } from '@/types'; // Adjust path
import { createTenant, updateTenant } from '@/services/api'; // Adjust path
import Modal from '@/components/common/Modal'; // Adjust path
import TenantForm from './TenantForm';
import { AlertMessage } from '@/components/common'; // Adjust path

interface TenantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Passed back Tenant might need revisit if API returns DTO
    onSubmitSuccess: (tenant: Tenant, isEdit: boolean) => void;
    // Accept DTO for editing context
    tenantToEdit?: TenantDetailDTO | null;
    buildings: Building[];
    rooms: Room[]; // Still needed by TenantForm
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess,
    tenantToEdit = null, // Default to null
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

        try {
            let resultTenant: Tenant; // Assuming API returns base Tenant type
            if (isEditMode && tenantToEdit) {
                resultTenant = await updateTenant(tenantToEdit.id, formData); // Use ID from DTO
            } else {
                resultTenant = await createTenant(formData);
            }
            onSubmitSuccess(resultTenant, isEditMode);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Operation failed.';
            setError(message);
            console.error("Form submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError(null);
            onClose();
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="xlarge">
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />
            <TenantForm
                onSubmit={handleFormSubmit}
                onCancel={handleClose}
                initialData={tenantToEdit} // Pass the DTO down
                isSubmitting={isSubmitting}
                buildings={buildings}
                rooms={rooms} // Pass rooms down
            />
        </Modal>
    );
};

export default TenantFormModal;