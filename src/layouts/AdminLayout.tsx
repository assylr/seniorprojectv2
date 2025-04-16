// src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Crucial for rendering child routes
import Navbar from '../components/Navbar'; // Adjust path if Navbar moved
import styles from './AdminLayout.module.css'; // Create this CSS module

const AdminLayout: React.FC = () => {
    return (
        <div className={styles.adminLayout}>
            <Navbar /> {/* Render the Navbar once */}
            <main className={styles.mainContent}>
                <Outlet /> {/* Render the matched child route component here */}
            </main>
            {/* You could add a Footer here if needed */}
        </div>
    );
};

export default AdminLayout;