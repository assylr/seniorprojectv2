// src/pages/Tenants/TenantsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tenant, Room, Building, TenantFormData } from '../../services/types';
import { getTenants, getRooms, getBuildings, updateTenant, createTenant, deleteTenant } from '../../services/api';
import { LoadingSpinner, AlertMessage } from '../../components/common';
import TenantFilters, { TenantFilterState } from './components/TenantFilters';
import TenantTable from './components/TenantTable';
import TenantFormModal from './components/TenantFormModal';

import styles from './TenantsPage.module.css';

const TenantsPage: React.FC = () => {
    // --- State ---
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]); // Ensure this state holds all rooms
    const [buildings, setBuildings] = useState<Building[]>([]); // Ensure this state holds all buildings
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState<TenantFilterState>({
        status: 'active', type: '', buildingId: '', searchQuery: ''
    });
    const [showTenantFormModal, setShowTenantFormModal] = useState<boolean>(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Used for table actions like check-out

    const navigate = useNavigate();

    // --- Data Fetching ---
    useEffect(() => { fetchInitialData(); }, []);
    const fetchInitialData = async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setIsLoading(true);
        setError(null);
        try {
            // Fetch all necessary data
            const [tenantsData, roomsData, buildingsData] = await Promise.all([
                getTenants(),
                getRooms(), // Make sure this fetches ALL rooms
                getBuildings() // Make sure this fetches ALL buildings
            ]);
            setTenants(tenantsData);
            setRooms(roomsData); // Populate rooms state
            setBuildings(buildingsData); // Populate buildings state
        } catch (err: any) {
            setError(err?.message || "Failed to fetch initial tenant data");
            console.error("Fetch error:", err);
        } finally {
           if (showLoadingIndicator) setIsLoading(false);
        }
    };

    // --- Filtering Logic ---
    const filteredTenants = useMemo(() => {
        // ... filtering logic remains the same ...
         return tenants.filter(tenant => {
             const isCheckedOut = !!tenant.expectedDepartureDate && new Date(tenant.expectedDepartureDate) <= new Date();
             const currentRoom = rooms.find(r => r.id === tenant.currentRoomId);
             const currentBuilding = buildings.find(b => b.id === currentRoom?.buildingId);
             const tenantBuildingId = currentBuilding?.id?.toString() || '';

             const statusMatch = !filters.status ||
                (filters.status === 'active' && !isCheckedOut) ||
                (filters.status === 'checked-out' && isCheckedOut);
            const typeMatch = !filters.type || tenant.tenantType === filters.type;
            const buildingMatch = !filters.buildingId || tenantBuildingId === filters.buildingId;

            let searchMatch = true;
            if (filters.searchQuery) { /* ... search logic ... */ }
            return statusMatch && typeMatch && buildingMatch && searchMatch;
        });
    }, [tenants, filters, rooms, buildings]); // Add rooms/buildings dependencies

    // --- Action Handlers ---
    const handleFilterChange = <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => { /* ... */ };
    const handleOpenCreateForm = () => { /* ... */ setEditingTenant(null); setShowTenantFormModal(true); setSuccessMessage(null); setError(null);};
    const handleOpenEditForm = (tenant: Tenant) => { /* ... */ setEditingTenant(tenant); setShowTenantFormModal(true); setSuccessMessage(null); setError(null);};
    const handleFormModalClose = () => { /* ... */ setShowTenantFormModal(false); setEditingTenant(null); };
    const handleFormSubmitSuccess = (submittedTenant: Tenant) => {
        handleFormModalClose();
        setSuccessMessage(
            `Tenant "${submittedTenant.firstName} ${submittedTenant.lastName}" ${editingTenant ? 'updated' : 'created & checked in'} successfully!` // Updated message
        );
         // Refetch ALL data because room availability might have changed
        fetchInitialData(false);
    };
    const handleCheckOut = async (tenant: Tenant) => {
         if (!window.confirm(`Check out ${tenant.firstName} ${tenant.lastName}?`)) return;
         setIsSubmitting(true); setError(null); setSuccessMessage(null);
         try {
             // --- Backend Assumption for Check Out ---
             // Assumes updateTenant handles setting departure AND making the room available
             const updateData: Partial<Tenant> = { expectedDepartureDate: new Date() };
             await updateTenant(tenant.id, updateData);
              // --- ---
             setSuccessMessage(`Tenant ${tenant.firstName} ${tenant.lastName} checked out.`);
             fetchInitialData(false); // Refetch to update room availability status
         } catch (err: any) {
             setError(err?.message || `Failed to check out tenant ${tenant.id}.`); console.error(err);
         } finally { setIsSubmitting(false); }
     };
    // const handleDelete = async (tenant: Tenant) => { /* ... */ };


    // --- Render Logic ---
    if (isLoading && tenants.length === 0) { /* ... initial loading ... */ }

    return (
        <div className={styles.pageContainer}>
            <AlertMessage message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>Tenants</h1>
                <div className={styles.buttonGroup}>
                     <button onClick={handleOpenCreateForm} className={styles.primaryButton} disabled={isLoading}>+ Add Tenant</button>
                 </div>
            </div>

            <TenantFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                buildings={buildings} // Pass buildings data
                isLoading={isLoading || isSubmitting}
            />

            <TenantTable
                tenants={filteredTenants}
                rooms={rooms} // Pass rooms data
                buildings={buildings} // Pass buildings data
                isLoading={isLoading}
                isSubmitting={isSubmitting}
                onEditTenant={handleOpenEditForm}
                onCheckOutTenant={handleCheckOut}
            />

            {/* Render Tenant Form Modal */}
            {showTenantFormModal && (
                <TenantFormModal
                    isOpen={showTenantFormModal}
                    onClose={handleFormModalClose}
                    onSubmitSuccess={handleFormSubmitSuccess}
                    tenantToEdit={editingTenant}
                    // Pass buildings and rooms state down to the modal
                    buildings={buildings}
                    rooms={rooms}
                />
            )}

             {/* Batch Modals Removed */}

        </div>
    );
};

export default TenantsPage;