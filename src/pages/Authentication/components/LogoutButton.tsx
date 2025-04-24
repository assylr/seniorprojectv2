// src/features/authentication/components/LogoutButton.tsx
import React from 'react';

// Define the props the component will accept
interface LogoutButtonProps {
  onLogout: () => void; // A function passed from the parent to handle the actual logout logic
  className?: string;   // Optional className for custom styling
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout, className }) => {
  return (
    <button
      onClick={onLogout} // Call the function passed via props when clicked
      className={`logout-button ${className || ''}`} // Apply a base class and any custom classes
      type="button" // Good practice for buttons not submitting forms
    >
      Logout
    </button>
  );
};

export default LogoutButton;

// Optional: Add some basic styling using CSS Modules or Tailwind
// If using CSS Modules, create LogoutButton.module.css and import styles:
/*
import styles from './LogoutButton.module.css';
...
className={`${styles.logoutButton} ${className || ''}`}
*/

// If using Tailwind, you might add classes directly:
/*
className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${className || ''}`}
*/