// src/components/common/Modal.tsx
import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
    /** Controls whether the modal is visible */
    isOpen: boolean;
    /** Function called when the modal requests to be closed (overlay click, Escape key, close button) */
    onClose: () => void;
    /** The content to display inside the modal */
    children: ReactNode;
    /** Optional: Title for the modal header */
    title?: string;
    /** Optional: CSS class for custom styling of the modal dialog */
    className?: string;
    /** Optional: Size variant */
    size?: 'small' | 'medium' | 'large' | 'xlarge';
     /** Optional: Hide the default close button in the header */
    hideCloseButton?: boolean;
}

// Find or create a portal root element
const modalRoot = document.getElementById('modal-root') || (() => {
    const element = document.createElement('div');
    element.id = 'modal-root';
    document.body.appendChild(element);
    return element;
})();

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    className = '',
    size = 'medium',
    hideCloseButton = false,
}) => {
    const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal dialog itself

    // --- Effects ---

    // Effect to handle Escape key press for closing
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent background scrolling when modal is open
            document.body.style.overflow = 'hidden';
            // Basic focus trapping: focus the modal dialog when opened
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = ''; // Restore scroll
        }

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = ''; // Ensure scroll is restored on unmount
        };
    }, [isOpen, onClose]);


    // Effect for handling click outside (on the overlay)
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click is directly on the overlay div, not on its children (the modal dialog)
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // --- Render Logic ---

    // Don't render anything if the modal is not open
    if (!isOpen) {
        return null;
    }

    // Combine CSS classes for the modal dialog
    const sizeClass = styles[size] || styles.medium;
    const dialogClassName = `${styles.modalDialog} ${sizeClass} ${className}`;

    // Render the modal content using React Portal
    return createPortal(
        <div
            className={styles.modalOverlay}
            onClick={handleOverlayClick} // Close on overlay click
            role="presentation" // Use presentation role for overlay div
        >
            <div
                ref={modalRef} // Assign ref to the dialog
                className={dialogClassName}
                role="dialog" // Semantically a dialog
                aria-modal="true" // Indicates it's a modal dialog
                aria-labelledby={title ? "modal-title" : undefined} // Link title for accessibility
                tabIndex={-1} // Make the dialog focusable programmatically
            >
                {/* Optional Modal Header */}
                {(title || (!hideCloseButton && onClose)) && (
                    <div className={styles.modalHeader}>
                        {title && <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>}
                        {!hideCloseButton && onClose && (
                             <button
                                type="button"
                                className={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close modal"
                             >
                                ×
                             </button>
                        )}
                    </div>
                )}

                {/* Modal Body - Where the children prop goes */}
                <div className={styles.modalBody}>
                    {children}
                </div>

                {/* Optional Modal Footer - can be added via children if needed */}
                {/* <div className={styles.modalFooter}> ... </div> */}
            </div>
        </div>,
        modalRoot // Target element for the portal
    );
};

export default Modal;