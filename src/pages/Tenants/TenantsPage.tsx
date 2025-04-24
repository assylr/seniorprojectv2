import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Tenant, Room, Building } from '@/types';
import { getTenants, getRooms, getBuildings, updateTenant } from '@/services/api';
import { LoadingSpinner, AlertMessage } from '@/components/common'; // Assuming Pagination might be added later
import TenantFilters, { TenantFilterState } from './components/TenantFilters';
import TenantTable from './components/TenantTable';
import TenantFormModal from './components/TenantFormModal';
import styles from './TenantsPage.module.css';

// Helper to create maps
const createMapById = <T extends { id: number }>(items: T[]): Map<number, T> => {
    return new Map(items.map(item => [item.id, item]));
};

const TenantsPage: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState<TenantFilterState>({
        status: 'active', type: '', buildingId: '', searchQuery: ''
    });

    const [showTenantFormModal, setShowTenantFormModal] = useState<boolean>(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

    // const navigate = useNavigate();

    const roomsMap = useMemo(() => createMapById(rooms), [rooms]);
    const buildingsMap = useMemo(() => createMapById(buildings), [buildings]);

    const fetchInitialData = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setIsLoading(true);
        setError(null);
        try {
            const [tenantsData, roomsData, buildingsData] = await Promise.all([
                getTenants(),
                getRooms(),
                getBuildings()
            ]);
            setTenants(tenantsData);
            setRooms(roomsData);
            setBuildings(buildingsData);
        } catch (err: unknown) {

            if (err instanceof Error) {
                setError(err?.message || "Failed to fetch initial data");
                console.error("Fetch error:", err);
            }

        } finally {
           if (showLoadingIndicator) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);


    const filteredTenants = useMemo(() => {
         return tenants.filter(tenant => {
            const isCheckedOut = !!tenant.expectedDepartureDate && new Date(tenant.expectedDepartureDate) <= new Date();
            const statusMatch = !filters.status ||
               (filters.status === 'active' && !isCheckedOut) ||
               (filters.status === 'checked-out' && isCheckedOut);

            const typeMatch = !filters.type || tenant.tenantType === filters.type;

            const currentRoom = roomsMap.get(tenant.currentRoomId ?? -1);
            const tenantBuildingId = currentRoom?.buildingId?.toString() || '';

            const buildingMatch = !filters.buildingId || tenantBuildingId === filters.buildingId;
            let searchMatch = true;

            if (filters.searchQuery) {
                 const query = filters.searchQuery.toLowerCase();
                 const roomInfo = `${buildingsMap.get(currentRoom?.buildingId ?? -1)?.buildingNumber || ''}-${currentRoom?.roomNumber || ''}`;
                 
                 searchMatch =
                     tenant.name.toLowerCase().includes(query) ||
                     tenant.surname.toLowerCase().includes(query) ||
                     (tenant.email && tenant.email.toLowerCase().includes(query)) ||
                     (tenant.mobile && tenant.mobile.includes(query)) || // Phone numbers might not need lowercase
                     roomInfo.toLowerCase().includes(query);
            }

            return statusMatch && typeMatch && buildingMatch && searchMatch;
        });
    }, [tenants, filters, roomsMap, buildingsMap]);

    // --- Action Handlers ---
    const handleFilterChange = <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => {
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };

    const handleOpenCreateForm = () => {
        setEditingTenant(null);
        setShowTenantFormModal(true);
        setSuccessMessage(null);
        setError(null);
    };

    const handleOpenEditForm = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setShowTenantFormModal(true);
        setSuccessMessage(null);
        setError(null);
    };

    const handleFormModalClose = () => {
        setShowTenantFormModal(false);
        setEditingTenant(null);
    };

    // This is called *after* the modal successfully submits and calls its internal API
    const handleFormSubmitSuccess = (submittedTenant: Tenant, isEdit: boolean) => {
        handleFormModalClose();
        setSuccessMessage(
            `Tenant "${submittedTenant.name} ${submittedTenant.surname}" ${isEdit ? 'updated' : 'created & checked in'} successfully!`
        );
        // TODO: Optimize this later if performance becomes an issue. Could try to update local state instead.
        fetchInitialData(false); // Pass false to avoid main loading spinner
    };

    const handleCheckOut = async (tenant: Tenant) => {
         if (!window.confirm(`Check out ${tenant.name} ${tenant.surname}? This cannot be undone easily via the UI.`)) return;

         setIsSubmittingAction(true); // Use specific submitting state for table actions
         setError(null);
         setSuccessMessage(null);

         try {
             const departureDate = new Date().toISOString();
             await updateTenant(tenant.id, { expectedDepartureDate: departureDate });

             setSuccessMessage(`Tenant ${tenant.name} ${tenant.surname} checked out successfully.`);
             fetchInitialData(false);
         } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err?.message || `Failed to check out tenant.`);
                console.error("Check out error:", err);
            }
         } finally {
             setIsSubmittingAction(false);
         }
     };


    // --- Render Logic ---
    const showInitialLoading = isLoading && tenants.length === 0;

    return (
        <div className={styles.pageContainer}>

            {/* Display messages */}
            <AlertMessage message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>Tenants</h1>
                <div className={styles.buttonGroup}>
                     {/* Disable button if initial load is happening */}
                     <button
                        onClick={handleOpenCreateForm}
                        className={styles.primaryButton}
                        disabled={isLoading}
                     >
                        + Add Tenant
                     </button>
                 </div>
            </div>

            <TenantFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                buildings={buildings} // Pass raw buildings for filter dropdown
                isLoading={isLoading || isSubmittingAction} // Disable filters during load or actions
            />

            {/* Conditional Rendering for Loading/Table */}
            {showInitialLoading ? (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>Loading tenant data...</p>
                </div>
            ) : (
                <TenantTable
                    tenants={filteredTenants}
                    roomsMap={roomsMap}
                    buildingsMap={buildingsMap}
                    // isLoading={isLoading}
                    isSubmitting={isSubmittingAction}
                    onEditTenant={handleOpenEditForm}
                    onCheckOutTenant={handleCheckOut}
                />
            )}

            {/* Render Tenant Form Modal */}
            {/* Mount the modal conditionally to reset its internal state */}
            {showTenantFormModal && (
                <TenantFormModal
                    isOpen={showTenantFormModal}
                    onClose={handleFormModalClose}
                    onSubmitSuccess={handleFormSubmitSuccess}
                    tenantToEdit={editingTenant}
                    buildings={buildings}
                    rooms={rooms}
                />
            )}

        </div>
    );
};

export default TenantsPage;