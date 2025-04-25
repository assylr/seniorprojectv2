// src/pages/Tenants/components/TenantFormModal.tsx
import React, { useState } from 'react';
// Use DTO for input, Tenant for output (based on current API assumptions)
import { TenantDetailDTO, TenantFormData, Building, Room } from '@/types'; // Adjust path
import { checkInTenant } from '@/services/api'; // Adjust path
import Modal from '@/components/common/Modal'; // Adjust path
import TenantForm from './TenantForm';
import { AlertMessage } from '@/components/common'; // Adjust path

interface TenantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: (tenant: TenantDetailDTO) => void;
    buildings: Building[];
    rooms: Room[]; // Still needed by TenantForm
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess,
    buildings,
    rooms,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFormSubmit = async (formData: TenantFormData) => {
        console.log('TenantFormModal - Submit button clicked');
        console.log('TenantFormModal - Form data received:', formData);
        
        setIsSubmitting(true);
        setError(null);

        try {
            await checkInTenant(formData);
            onSubmitSuccess(formData as TenantDetailDTO);
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Operation failed.';
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
        <Modal isOpen={isOpen} onClose={handleClose} title="Check In Tenant" size="xlarge">
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />
            <TenantForm
                onSubmit={handleFormSubmit}
                onCancel={handleClose}
                initialData={null}
                isSubmitting={isSubmitting}
                buildings={buildings}
                rooms={rooms}
            />
        </Modal>
    );
};

export default TenantFormModal;