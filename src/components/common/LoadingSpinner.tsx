// src/components/common/LoadingSpinner.tsx
import React from 'react';
import styles from './LoadingSpinner.module.css'; // Import the CSS module

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large'; // Optional size prop
    className?: string; // Allow custom classes
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', className = '' }) => {
    const sizeClass = styles[size] || styles.medium; // Get the size class from CSS module
    const combinedClassName = `${styles.spinner} ${sizeClass} ${className}`; // Combine base, size, and custom classes

    return <div className={combinedClassName} role="status" aria-live="polite">
        <span className={styles.visuallyHidden}>Loading...</span> {/* Accessibility text */}
    </div>;
};

export default LoadingSpinner;