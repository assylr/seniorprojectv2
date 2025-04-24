import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import styles from './AdminLayout.module.css'

const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Don't show layout on login page
  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) return <Outlet />;

  return (
    <div className={styles.adminLayout}>
      <Navbar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
