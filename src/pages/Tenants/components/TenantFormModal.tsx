// src/pages/Tenants/components/TenantFormModal.tsx
import React, { useState } from 'react';
// Added Building and Room to imports
import { Tenant, TenantFormData, Building, Room } from '../../../services/types'; // Adjust path
import { createTenant, updateTenant } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import TenantForm from './TenantForm';
import { AlertMessage } from '../../../components/common';

interface TenantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: (tenant: Tenant) => void;
    tenantToEdit?: Tenant | null;
    // Add buildings and rooms props
    buildings: Building[];
    rooms: Room[];
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess,
    tenantToEdit = null,
    // Destructure new props
    buildings,
    rooms,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = Boolean(tenantToEdit);
    const modalTitle = isEditMode ? 'Edit Tenant' : 'Add New Tenant & Check In'; // Updated title

    const handleFormSubmit = async (formData: TenantFormData) => {
        setIsSubmitting(true);
        setError(null);

        // --- Crucial Backend Assumption ---
        // We assume the createTenant/updateTenant backend endpoints ALSO handle:
        // 1. Setting the Tenant.currentRoomId.
        // 2. Setting the selected Room.isAvailable to false.
        // 3. If editing and changing rooms, setting the OLD Room.isAvailable to true.
        // If this logic is separate (e.g., in Contracts API), this needs adjustment.
        // --- ---

        try {
            let resultTenant: Tenant;
            if (isEditMode && tenantToEdit) {
                resultTenant = await updateTenant(tenantToEdit.id, formData);
                console.log('Tenant updated:', resultTenant);
            } else {
                resultTenant = await createTenant(formData);
                console.log('Tenant created and checked in:', resultTenant);
            }
            onSubmitSuccess(resultTenant);

        } catch (err: any) {
            const message = err?.message || (isEditMode ? 'Failed to update tenant' : 'Failed to create tenant');
            setError(message);
            console.error("Form submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            size="xlarge" // Might need more space for the room selects
        >
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <TenantForm
                onSubmit={handleFormSubmit}
                onCancel={handleClose}
                initialData={tenantToEdit}
                isSubmitting={isSubmitting}
                // Pass buildings and rooms down to the form
                buildings={buildings}
                rooms={rooms}
            />
        </Modal>
    );
};

export default TenantFormModal;