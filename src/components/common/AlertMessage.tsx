// src/components/common/AlertMessage.tsx
import React from 'react';
import styles from './AlertMessage.module.css'; // Import the CSS module

// Define the possible alert types
export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertMessageProps {
    /** The message content to display */
    message: string | null | undefined;
    /** The type determines the styling (color, icon etc.) */
    type?: AlertType;
    /** Optional CSS class for custom styling */
    className?: string;
    /** Optional callback function for a close button */
    onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
    message,
    type = 'info', // Default to 'info' if type is not provided
    className = '',
    onClose,
}) => {
    // Don't render anything if there's no message
    if (!message) {
        return null;
    }

    const alertTypeClass = styles[type] || styles.info; // Get the type class from CSS module
    const combinedClassName = `${styles.alert} ${alertTypeClass} ${className}`; // Combine base, type, and custom classes

    return (
        <div className={combinedClassName} role="alert">
            <span className={styles.message}>{message}</span>
            {onClose && ( // Render close button only if onClose callback is provided
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close alert"
                >
                    × {/* Simple 'x' character for close */}
                </button>
            )}
        </div>
    );
};

export default AlertMessage;