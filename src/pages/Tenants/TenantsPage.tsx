import React, { useEffect, useCallback, useReducer, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Import the DTO type and potentially original types if needed for forms
import { Building, Room, TenantDetailDTO, TenantStatusType, TenantType } from '@/types';
// Update API service imports
import { getTenantDetails, getBuildings, getRooms, checkOutTenant } from '@/services/api';
import { LoadingSpinner, AlertMessage } from '@/components/common';
import TenantFilters, { TenantFilterState } from './components/TenantFilters';
import TenantTable from './components/TenantTable';
import TenantFormModal from './components/TenantFormModal';
import TenantDetailsModal from './components/TenantDetailsModal';
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
    selectedTenant: TenantDetailDTO | null;
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
    | { type: 'SET_SUCCESS'; payload: string | null }
    | { type: 'SET_SELECTED_TENANT'; payload: TenantDetailDTO | null };

// Default filters - adjust 'active' based on backend default or desired initial view
const initialFilters: TenantFilterState = {
    status: '', // Match backend status string, e.g., 'Active', 'Checked-Out', 'Pending'
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
    successMessage: null,
    selectedTenant: null
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
        case 'SET_SELECTED_TENANT':
            return { ...state, selectedTenant: action.payload };
        default:
            return state;
    }
};

const TenantsPage: React.FC = () => {
    const [state, dispatch] = useReducer(pageReducer, initialState);
    const location = useLocation();
    const navigate = useNavigate();

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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status') as TenantStatusType | '';
        const type = params.get('type') as TenantType | '';
        
        dispatch({
            type: 'SET_FILTERS',
            payload: {
                status: status || '',
                type: type || '',
                buildingId: params.get('buildingId') || '',
                searchQuery: params.get('searchQuery') || ''
            }
        });
    }, [location.search]);

    // Fetch tenants based on filters
    const fetchTenants = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const queryParams = new URLSearchParams();
            if (state.filters.status) queryParams.set('status', state.filters.status);
            if (state.filters.type) queryParams.set('type', state.filters.type);
            if (state.filters.buildingId) queryParams.set('buildingId', state.filters.buildingId);

            const tenants = await getTenantDetails(queryParams);
            dispatch({ type: 'SET_TENANTS', payload: tenants });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load tenants' });
            dispatch({ type: 'SET_TENANTS', payload: [] });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.filters.status, state.filters.type, state.filters.buildingId]);

    // Filter tenants based on search query
    const filteredTenants = useMemo(() => {
        if (!state.filters.searchQuery) {
            return state.tenants;
        }

        const searchQuery = state.filters.searchQuery.toLowerCase();
        return state.tenants.filter(tenant => {
            const fullName = `${tenant.name} ${tenant.surname}`.toLowerCase();
            const email = tenant.email?.toLowerCase() || '';
            const mobile = tenant.mobile?.toLowerCase() || '';
            const roomNumber = tenant.roomNumber?.toLowerCase() || '';
            const buildingName = tenant.buildingName?.toLowerCase() || '';

            return (
                fullName.includes(searchQuery) ||
                email.includes(searchQuery) ||
                mobile.includes(searchQuery) ||
                roomNumber.includes(searchQuery) ||
                buildingName.includes(searchQuery)
            );
        });
    }, [state.tenants, state.filters.searchQuery]);

    // Effect to trigger fetching tenants when filters change
    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    // Handlers
    const handleFilterChange = <K extends keyof TenantFilterState>(key: K, value: TenantFilterState[K]) => {
        const query = new URLSearchParams(location.search);
        if (value) {
            query.set(key, value);
        } else {
            query.delete(key);
        }
        navigate(`?${query.toString()}`, { replace: true });
    };

    const handleCheckOut = async (tenant: TenantDetailDTO) => {
        if (!window.confirm(`Are you sure you want to check out ${tenant.name} ${tenant.surname}?`)) {
            return;
        }

        dispatch({ type: 'SET_SUBMITTING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_SUCCESS', payload: null });

        try {
            await checkOutTenant(tenant.id);
            dispatch({ 
                type: 'SET_SUCCESS', 
                payload: `Tenant ${tenant.name} ${tenant.surname} checked out successfully.`
            });
            fetchTenants();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to check out tenant.';
            dispatch({ type: 'SET_ERROR', payload: message });
            console.error("Check out error:", err);
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    };

    const handleViewTenant = (tenant: TenantDetailDTO) => {
        dispatch({ type: 'SET_SELECTED_TENANT', payload: tenant });
    };

    const handleCloseDetails = () => {
        dispatch({ type: 'SET_SELECTED_TENANT', payload: null });
    };

    // Render
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
                        onClick={() => dispatch({ type: 'SET_SHOW_MODAL', payload: true })}
                        className={styles.primaryButton}
                        disabled={state.isLoading}
                    >
                        + Check In Tenant
                    </button>
                </div>
            </div>

            <TenantFilters
                filters={state.filters}
                onFilterChange={handleFilterChange}
                buildings={state.filterBuildings}
                isLoading={state.isLoading}
            />

            {state.isLoading ? (
                <LoadingSpinner />
            ) : (
                <TenantTable
                    tenants={filteredTenants}
                    isSubmitting={state.isSubmittingAction}
                    onCheckOutTenant={handleCheckOut}
                    onViewTenant={handleViewTenant}
                />
            )}

            {state.showTenantFormModal && (
                <TenantFormModal
                    isOpen={state.showTenantFormModal}
                    onClose={() => dispatch({ type: 'SET_SHOW_MODAL', payload: false })}
                    onSubmitSuccess={(tenant) => {
                        dispatch({ type: 'SET_SHOW_MODAL', payload: false });
                        dispatch({ 
                            type: 'SET_SUCCESS', 
                            payload: `Tenant "${tenant.name} ${tenant.surname}" checked in successfully!`
                        });
                        fetchTenants();
                    }}
                    buildings={state.filterBuildings}
                    rooms={state.allRooms}
                />
            )}

            {state.selectedTenant && (
                <TenantDetailsModal
                    tenant={state.selectedTenant}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
};

export default TenantsPage;