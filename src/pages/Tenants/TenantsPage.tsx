import React, { useEffect, useCallback, useReducer } from 'react';
// Import the DTO type and potentially original types if needed for forms
import { Building, Room, TenantDetailDTO } from '@/types';
// Update API service imports
import { getTenantDetails, getBuildings, getRooms, checkOutTenant } from '@/services/api';
import { LoadingSpinner, AlertMessage } from '@/components/common';
import TenantFilters, { TenantFilterState } from './components/TenantFilters';
import TenantTable from './components/TenantTable';
import TenantFormModal from './components/TenantFormModal';
import styles from './TenantsPage.module.css';
// Removed createMapById as it's no longer needed for client-side joins

// Types
type PageState = {
    tenants: TenantDetailDTO[];
    filterBuildings: Building[];
    allRooms: Room[];
    filters: TenantFilterState;
    editingTenant: TenantDetailDTO | null;
    showTenantFormModal: boolean;
    isLoading: boolean;
    isSubmittingAction: boolean;
    error: string | null;
    successMessage: string | null;
};

type PageAction =
    | { type: 'SET_TENANTS'; payload: TenantDetailDTO[] }
    | { type: 'SET_FILTER_BUILDINGS'; payload: Building[] }
    | { type: 'SET_ALL_ROOMS'; payload: Room[] }
    | { type: 'SET_FILTERS'; payload: Partial<TenantFilterState> }
    | { type: 'SET_EDITING_TENANT'; payload: TenantDetailDTO | null }
    | { type: 'SET_SHOW_MODAL'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SUBMITTING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_SUCCESS'; payload: string | null };

// Default filters - adjust 'active' based on backend default or desired initial view
const initialFilters: TenantFilterState = {
    status: 'Active', // Match backend status string, e.g., 'Active', 'Checked-Out', 'Pending'
    type: '',
    buildingId: '',
    searchQuery: ''
};

// Initial state
const initialState: PageState = {
    tenants: [],
    filterBuildings: [],
    allRooms: [],
    filters: initialFilters,
    editingTenant: null,
    showTenantFormModal: false,
    isLoading: true,
    isSubmittingAction: false,
    error: null,
    successMessage: null
};

// Reducer
const pageReducer = (state: PageState, action: PageAction): PageState => {
    switch (action.type) {
        case 'SET_TENANTS':
            return { ...state, tenants: action.payload };
        case 'SET_FILTER_BUILDINGS':
            return { ...state, filterBuildings: action.payload };
        case 'SET_ALL_ROOMS':
            return { ...state, allRooms: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_EDITING_TENANT':
            return { ...state, editingTenant: action.payload };
        case 'SET_SHOW_MODAL':
            return { ...state, showTenantFormModal: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_SUBMITTING':
            return { ...state, isSubmittingAction: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_SUCCESS':
            return { ...state, successMessage: action.payload };
        default:
            return state;
    }
};

const TenantsPage: React.FC = () => {
    const [state, dispatch] = useReducer(pageReducer, initialState);

    // Fetch static data for filters and modal
    useEffect(() => {
        const fetchFilterAndModalData = async () => {
            try {
                const [buildingsData, roomsData] = await Promise.all([
                    getBuildings(),
                    getRooms()
                ]);
                dispatch({ type: 'SET_FILTER_BUILDINGS', payload: buildingsData });
                dispatch({ type: 'SET_ALL_ROOMS', payload: roomsData });
            } catch (err) {
                console.error("Failed to fetch filter/modal data:", err);
                dispatch({ type: 'SET_ERROR', payload: "Could not load filter options or modal data." });
            }
        };
        fetchFilterAndModalData();
    }, []);

    // Fetch tenants based on filters
    const fetchTenants = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) {
            dispatch({ type: 'SET_LOADING', payload: true });
        }

        try {
            const params = new URLSearchParams();
            if (state.filters.status) params.set('status', state.filters.status);
            if (state.filters.type) params.set('type', state.filters.type);
            if (state.filters.buildingId) params.set('buildingId', state.filters.buildingId);
            if (state.filters.searchQuery) params.set('searchQuery', state.filters.searchQuery);

            const tenantsData = await getTenantDetails(params);
            dispatch({ type: 'SET_TENANTS', payload: tenantsData });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch tenants';
            console.error("Fetch tenants error:", err);
            dispatch({ type: 'SET_ERROR', payload: message });
            dispatch({ type: 'SET_TENANTS', payload: [] });
        } finally {
            if (showLoadingIndicator) {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
    }, [state.filters]);

    // Effect to trigger fetching tenants when filters change
    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    // Handlers
    const handleFilterChange = <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => {
        dispatch({ type: 'SET_FILTERS', payload: { [key]: value } });
    };

    const handleOpenCreateForm = () => {
        dispatch({ type: 'SET_EDITING_TENANT', payload: null });
        dispatch({ type: 'SET_SHOW_MODAL', payload: true });
        dispatch({ type: 'SET_SUCCESS', payload: null });
        dispatch({ type: 'SET_ERROR', payload: null });
    };

    const handleOpenEditForm = (tenant: TenantDetailDTO) => {
        dispatch({ type: 'SET_EDITING_TENANT', payload: tenant });
        dispatch({ type: 'SET_SHOW_MODAL', payload: true });
        dispatch({ type: 'SET_SUCCESS', payload: null });
        dispatch({ type: 'SET_ERROR', payload: null });
    };

    const handleFormModalClose = () => {
        dispatch({ type: 'SET_SHOW_MODAL', payload: false });
        dispatch({ type: 'SET_EDITING_TENANT', payload: null });
    };

    const handleFormSubmitSuccess = (submittedTenant: TenantDetailDTO, isEdit: boolean) => {
        handleFormModalClose();
        dispatch({ 
            type: 'SET_SUCCESS', 
            payload: `Tenant "${submittedTenant.name} ${submittedTenant.surname}" ${isEdit ? 'updated' : 'created & checked in'} successfully!`
        });
        fetchTenants(false);
    };

    const handleCheckOut = async (tenant: TenantDetailDTO) => {
        if (!window.confirm(`Check out ${tenant.name} ${tenant.surname}?`)) return;

        dispatch({ type: 'SET_SUBMITTING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_SUCCESS', payload: null });

        try {
            await checkOutTenant(tenant.id);
            dispatch({ 
                type: 'SET_SUCCESS', 
                payload: `Tenant ${tenant.name} ${tenant.surname} checked out successfully.`
            });
            fetchTenants(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to check out tenant.';
            dispatch({ type: 'SET_ERROR', payload: message });
            console.error("Check out error:", err);
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    };

    // Render
    const showInitialLoading = state.isLoading && state.tenants.length === 0 && !state.error;
    const filtersDisabled = state.isLoading || state.isSubmittingAction;

    return (
        <div className={styles.pageContainer}>
            <AlertMessage 
                message={state.successMessage} 
                type="success" 
                onClose={() => dispatch({ type: 'SET_SUCCESS', payload: null })} 
            />
            <AlertMessage 
                message={state.error} 
                type="error" 
                onClose={() => dispatch({ type: 'SET_ERROR', payload: null })} 
            />

            <div className={styles.headerActions}>
                <h1>Tenants</h1>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleOpenCreateForm}
                        className={styles.primaryButton}
                        disabled={state.isLoading}
                    >
                        + Add Tenant
                    </button>
                </div>
            </div>

            <TenantFilters
                filters={state.filters}
                onFilterChange={handleFilterChange}
                buildings={state.filterBuildings}
                isLoading={filtersDisabled}
            />

            {showInitialLoading ? (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner size="large" />
                    <p>Loading tenant data...</p>
                </div>
            ) : (
                <TenantTable
                    tenants={state.tenants}
                    isSubmitting={state.isSubmittingAction}
                    onEditTenant={handleOpenEditForm}
                    onCheckOutTenant={handleCheckOut}
                />
            )}

            {state.showTenantFormModal && (
                <TenantFormModal
                    isOpen={state.showTenantFormModal}
                    onClose={handleFormModalClose}
                    onSubmitSuccess={handleFormSubmitSuccess}
                    tenantToEdit={state.editingTenant}
                    buildings={state.filterBuildings}
                    rooms={state.allRooms}
                />
            )}
        </div>
    );
};

export default TenantsPage;