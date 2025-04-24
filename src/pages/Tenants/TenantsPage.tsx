import React, { useEffect, useState, useCallback } from 'react';
// Import the DTO type and potentially original types if needed for forms
import { Building, Room, TenantDetailDTO, Tenant } from '@/types';
// Update API service imports
import { getTenantDetails, getBuildings, getRooms, checkOutTenant } from '@/services/api';
import { LoadingSpinner, AlertMessage } from '@/components/common';
import TenantFilters, { TenantFilterState } from './components/TenantFilters';
import TenantTable from './components/TenantTable';
import TenantFormModal from './components/TenantFormModal';
import styles from './TenantsPage.module.css';
// Removed createMapById as it's no longer needed for client-side joins

// Default filters - adjust 'active' based on backend default or desired initial view
const initialFilters: TenantFilterState = {
    status: 'Active', // Match backend status string, e.g., 'Active', 'Checked-Out', 'Pending'
    type: '',
    buildingId: '',
    searchQuery: ''
};

const TenantsPage: React.FC = () => {
    // State using the DTO
    const [tenants, setTenants] = useState<TenantDetailDTO[]>([]);
    // State for filter dropdown data & modal data
    const [filterBuildings, setFilterBuildings] = useState<Building[]>([]);
    // *** NOTE: Still fetching all rooms for the modal. Optimize later if needed. ***
    const [allRooms, setAllRooms] = useState<Room[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFetchingFilters, setIsFetchingFilters] = useState<boolean>(true); // Separate loading for filter data
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState<TenantFilterState>(initialFilters);

    const [showTenantFormModal, setShowTenantFormModal] = useState<boolean>(false);
    // Use DTO for editing context, modal might need to fetch full data if DTO is insufficient
    const [editingTenant, setEditingTenant] = useState<TenantDetailDTO | null>(null);
    // State for actions like check-out, delete etc. within the table
    const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

    // Fetch static data for filters and modal (runs once)
    useEffect(() => {
        const fetchFilterAndModalData = async () => {
            setIsFetchingFilters(true);
            try {
                const [buildingsData, roomsData] = await Promise.all([
                    getBuildings(),
                    getRooms() // Still fetching all rooms for the modal
                ]);
                setFilterBuildings(buildingsData);
                setAllRooms(roomsData);
            } catch (err: unknown) {
                console.error("Failed to fetch filter/modal data:", err);
                setError("Could not load filter options or modal data.");
            } finally {
                setIsFetchingFilters(false);
            }
        };
        fetchFilterAndModalData();
    }, []);

    // Callback to fetch tenants based on current filters
    const fetchTenants = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setIsLoading(true);
        // Don't clear error necessarily, fetch might fail again
        // setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.status) params.set('status', filters.status);
            if (filters.type) params.set('type', filters.type);
            if (filters.buildingId) params.set('buildingId', filters.buildingId);
            if (filters.searchQuery) params.set('searchQuery', filters.searchQuery);
            // Add sorting params here if implemented
            // params.set('sortBy', 'lastName');
            // params.set('sortDirection', 'ASC');

            const tenantsData = await getTenantDetails(params);
            setTenants(tenantsData);
             setError(null); // Clear error on successful fetch
        } catch (err: unknown) {
             const message = err instanceof Error ? err.message : 'Failed to fetch tenants';
             console.error("Fetch tenants error:", err);
             setError(message);
             setTenants([]); // Clear data on error
        } finally {
           if (showLoadingIndicator) setIsLoading(false);
        }
    }, [filters]); // Re-run when filters change

    // Effect to trigger fetching tenants when filters change or filter data is loaded
    useEffect(() => {
        // Only fetch if filter data has loaded (or failed to load)
        if (!isFetchingFilters) {
             fetchTenants();
        }
    }, [fetchTenants, isFetchingFilters]); // Run when fetchTenants updates (due to filters)

    // Remove the client-side filtering logic (filteredTenants useMemo)

    // --- Action Handlers ---
    const handleFilterChange = <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => {
        // Update filters state, which will trigger the useEffect to call fetchTenants
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
        // Optional: Add URL syncing here if desired, like in RoomsPage
    };

    const handleOpenCreateForm = () => {
        setEditingTenant(null);
        setShowTenantFormModal(true);
        setSuccessMessage(null); // Clear messages when opening modal
        setError(null);
    };

    // Accept TenantDetailDTO here
    const handleOpenEditForm = (tenant: TenantDetailDTO) => {
        setEditingTenant(tenant);
        setShowTenantFormModal(true);
        setSuccessMessage(null);
        setError(null);
    };

    const handleFormModalClose = () => {
        setShowTenantFormModal(false);
        setEditingTenant(null);
    };

    // The modal submit success should perhaps return the updated/created TenantDetailDTO?
    // Assuming it still returns the base Tenant type for now.
    const handleFormSubmitSuccess = (submittedTenant: Tenant | TenantDetailDTO, isEdit: boolean) => {
        handleFormModalClose();
        setSuccessMessage(
            `Tenant "${submittedTenant.name} ${submittedTenant.surname}" ${isEdit ? 'updated' : 'created & checked in'} successfully!`
        );
        // Refetch the current view instead of all initial data
        fetchTenants(false); // Pass false to avoid main loading spinner
    };

    // Use TenantDetailDTO here, call dedicated checkout API
    const handleCheckOut = async (tenant: TenantDetailDTO) => {
         if (!window.confirm(`Check out ${tenant.name} ${tenant.surname}?`)) return;

         setIsSubmittingAction(true);
         setError(null);
         setSuccessMessage(null);

         try {
             // Assuming a dedicated API function exists
             await checkOutTenant(tenant.id); // Pass tenant ID

             setSuccessMessage(`Tenant ${tenant.name} ${tenant.surname} checked out successfully.`);
             // Refetch the current view
             fetchTenants(false);
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to check out tenant.';
            setError(message);
            console.error("Check out error:", err);
         } finally {
             setIsSubmittingAction(false);
         }
     };


    // --- Render Logic ---
    const showInitialLoading = isLoading && tenants.length === 0 && !error;
    const filtersDisabled = isFetchingFilters || isLoading || isSubmittingAction;

    return (
        <div className={styles.pageContainer}>
            <AlertMessage message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
            <AlertMessage message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.headerActions}>
                <h1>Tenants</h1>
                <div className={styles.buttonGroup}>
                     <button
                        onClick={handleOpenCreateForm}
                        className={styles.primaryButton}
                        disabled={isLoading || isFetchingFilters} // Disable if loading anything initially
                     >
                        + Add Tenant
                     </button>
                 </div>
            </div>

            <TenantFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                buildings={filterBuildings} // Pass fetched buildings for filter
                // Add tenantTypes if needed for filter: tenantTypes={tenantTypes}
                isLoading={filtersDisabled}
            />

            {showInitialLoading ? (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>Loading tenant data...</p>
                </div>
            ) : (
                // Pass TenantDetailDTO array, remove maps
                <TenantTable
                    tenants={tenants}
                    //isLoading={isLoading} // Pass isLoading for potential row indicators
                    isSubmitting={isSubmittingAction} // To disable actions in rows
                    onEditTenant={handleOpenEditForm} // Pass handlers down
                    onCheckOutTenant={handleCheckOut}
                    // Add handlers for View Details, Reassign Room etc.
                />
            )}

            {/* Render Tenant Form Modal */}
            {/* Pass fetched buildings/rooms needed for selections */}
            {showTenantFormModal && (
                <TenantFormModal
                    isOpen={showTenantFormModal}
                    onClose={handleFormModalClose}
                    onSubmitSuccess={handleFormSubmitSuccess}
                    // Pass DTO, modal might need internal logic if form requires different structure
                    tenantToEdit={editingTenant}
                    buildings={filterBuildings}
                    rooms={allRooms} // Still passing all rooms for now
                />
            )}
        </div>
    );
};

export default TenantsPage;