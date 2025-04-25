import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import {
    createMaintenanceRequest,
    getMaintenanceRequestById,
    getMaintenanceRequests,
    getRooms,
    getTenants,
    updateMaintenanceRequest
} from '../services/api'
import { MaintenanceRequest, MaintenanceUpdate, Room, Tenant } from '../types'
import { MaintenanceCategory, MaintenancePriority, MaintenanceRequestFormData, MaintenanceStatus } from '../types/maintenance'
import styles from './Maintenance.module.css'

interface MaintenanceFormData {
    roomId: string;
    tenantId: string;
    category: MaintenanceCategory | '';
    description: string;
    priority: MaintenancePriority | '';
    notes: string;
}

interface UpdateFormData {
    status: MaintenanceStatus | '';
    assignedTo: string;
    scheduledDate: string;
    notes: string;
}

const Maintenance = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [requestUpdates, setRequestUpdates] = useState<MaintenanceUpdate[]>([]);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    
    const [requestForm, setRequestForm] = useState<MaintenanceFormData>({
        roomId: '',
        tenantId: '',
        category: '',
        description: '',
        priority: '',
        notes: ''
    });
    
    const [updateForm, setUpdateForm] = useState<UpdateFormData>({
        status: '',
        assignedTo: '',
        scheduledDate: '',
        notes: ''
    });
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsData, roomsData, tenantsData] = await Promise.all([
                getMaintenanceRequests(),
                getRooms(),
                getTenants()
            ]);
            
            setRequests(requestsData);
            setRooms(roomsData);
            setTenants(tenantsData);
        } catch (err) {
            setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchRequestDetails = async (requestId: number) => {
        try {
            setLoading(true);
            const request = await getMaintenanceRequestById(requestId);
            setSelectedRequest(request);
            // TODO: Uncomment when getMaintenanceUpdates is implemented
            // const updates = await getMaintenanceUpdates(requestId);
            // setRequestUpdates(updates);
            setRequestUpdates([]); // Temporary empty array until API is implemented
        } catch (err) {
            setError(`Failed to fetch request details: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleRequestInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRequestForm(prev => ({ ...prev, [name]: value }));
    };
    
    const handleUpdateInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRequestSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!requestForm.roomId) throw new Error('Room is required');
            if (!requestForm.category) throw new Error('Category is required');
            if (!requestForm.description) throw new Error('Description is required');
            if (!requestForm.priority) throw new Error('Priority is required');
            
            const requestData: MaintenanceRequestFormData = {
                roomId: parseInt(requestForm.roomId),
                tenantId: requestForm.tenantId ? parseInt(requestForm.tenantId) : null,
                category: requestForm.category as MaintenanceCategory,
                description: requestForm.description,
                priority: requestForm.priority as MaintenancePriority,
                notes: requestForm.notes
            };
            
            await createMaintenanceRequest(requestData);
            setSuccess('Maintenance request created successfully');
            setShowRequestForm(false);
            setRequestForm({
                roomId: '',
                tenantId: '',
                category: '',
                description: '',
                priority: '',
                notes: ''
            });
            await fetchData();
        } catch (err) {
            setError(`Failed to create request: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!selectedRequest) return;
        
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!updateForm.notes) throw new Error('Update notes are required');
            
            const updates: any = {};
            
            if (updateForm.status && updateForm.status !== selectedRequest.status) {
                updates.status = updateForm.status;
            }
            
            if (updateForm.assignedTo && updateForm.assignedTo !== selectedRequest.assignedTo) {
                updates.assignedTo = updateForm.assignedTo;
            }
            
            if (updateForm.scheduledDate) {
                const newDate = new Date(updateForm.scheduledDate);
                const currentDate = selectedRequest.scheduledDate ? new Date(selectedRequest.scheduledDate) : null;
                
                if (!currentDate || newDate.getTime() !== currentDate.getTime()) {
                    updates.scheduledDate = newDate;
                }
            }
            
            // If status is completed, add completion date
            if (updateForm.status === 'completed' && !selectedRequest.completedDate) {
                updates.completedDate = new Date();
            }
            
            await updateMaintenanceRequest(
                selectedRequest.id,
                updates,
                updateForm.notes
            );
            
            setSuccess('Maintenance request updated successfully');
            setShowUpdateForm(false);
            await fetchRequestDetails(selectedRequest.id);
            await fetchData();
        } catch (err) {
            setError(`Failed to update request: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const closeRequestDetails = () => {
        setSelectedRequest(null);
        setRequestUpdates([]);
        setShowUpdateForm(false);
    };
    
    const formatDate = (dateString: Date | string | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'in_progress': return 'status-in-progress';
            case 'assigned': return 'status-assigned';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
        }
    };
    
    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'emergency': return 'priority-emergency';
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            default: return 'priority-low';
        }
    };
    
    const getRoomNumber = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? `${room.roomNumber} (Building ${room.buildingId})` : 'Unknown';
    };
    
    const getTenantName = (tenantId: number | null) => {
        if (!tenantId) return 'N/A';
        const tenant = tenants.find(t => t.id === tenantId);
        return tenant ? `${tenant.name} ${tenant.surname}` : 'Unknown';
    };
    
    const filteredRequests = requests.filter(request => {
        if (filterStatus && request.status !== filterStatus) return false;
        if (filterCategory && request.category !== filterCategory) return false;
        if (filterPriority && request.priority !== filterPriority) return false;
        return true;
    });
    
    if (loading && !requests.length) return <div className={styles.container}>Loading...</div>;
    
    return (
        <div className={styles.container}>
            <div className={styles.headerActions}>
                <h1>Maintenance Management</h1>
                <button 
                    onClick={() => setShowRequestForm(!showRequestForm)}
                    className={styles.primaryButton}
                >
                    {showRequestForm ? 'Cancel' : 'New Maintenance Request'}
                </button>
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            
            {showRequestForm && (
                <div className={styles.formCard}>
                    <h2>New Maintenance Request</h2>
                    <form onSubmit={handleRequestSubmit}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="roomId">Room *</label>
                                <select
                                    id="roomId"
                                    name="roomId"
                                    value={requestForm.roomId}
                                    onChange={handleRequestInputChange}
                                    required
                                >
                                    <option value="">Select Room</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.roomNumber} (Building {room.buildingId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="tenantId">Tenant (if applicable)</label>
                                <select
                                    id="tenantId"
                                    name="tenantId"
                                    value={requestForm.tenantId}
                                    onChange={handleRequestInputChange}
                                >
                                    <option value="">Select Tenant (Optional)</option>
                                    {tenants
                                        .filter(tenant => !tenant.departureDate)
                                        .map(tenant => (
                                            <option key={tenant.id} value={tenant.id}>
                                                {tenant.name} {tenant.surname}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={requestForm.category}
                                    onChange={handleRequestInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value={MaintenanceCategory.PLUMBING}>Plumbing</option>
                                    <option value={MaintenanceCategory.ELECTRICAL}>Electrical</option>
                                    <option value={MaintenanceCategory.HVAC}>HVAC</option>
                                    <option value={MaintenanceCategory.APPLIANCE}>Appliance</option>
                                    <option value={MaintenanceCategory.STRUCTURAL}>Structural</option>
                                    <option value={MaintenanceCategory.GENERAL}>General</option>
                                    <option value={MaintenanceCategory.OTHER}>Other</option>
                                </select>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="priority">Priority *</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={requestForm.priority}
                                    onChange={handleRequestInputChange}
                                    required
                                >
                                    <option value="">Select Priority</option>
                                    <option value={MaintenancePriority.LOW}>Low</option>
                                    <option value={MaintenancePriority.MEDIUM}>Medium</option>
                                    <option value={MaintenancePriority.HIGH}>High</option>
                                    <option value={MaintenancePriority.EMERGENCY}>Emergency</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={requestForm.description}
                                onChange={handleRequestInputChange}
                                rows={3}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="notes">Additional Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={requestForm.notes}
                                onChange={handleRequestInputChange}
                                rows={2}
                            />
                        </div>
                        
                        <div className={styles.formActions}>
                            <button 
                                type="submit" 
                                className={styles.primaryButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Create Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className={styles.filters}>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value={MaintenanceStatus.SUBMITTED}>Submitted</option>
                    <option value={MaintenanceStatus.ACKNOWLEDGED}>Acknowledged</option>
                    <option value={MaintenanceStatus.ASSIGNED}>Assigned</option>
                    <option value={MaintenanceStatus.IN_PROGRESS}>In Progress</option>
                    <option value={MaintenanceStatus.ON_HOLD}>On Hold</option>
                    <option value={MaintenanceStatus.COMPLETED}>Completed</option>
                    <option value={MaintenanceStatus.CANCELLED}>Cancelled</option>
                    <option value={MaintenanceStatus.REJECTED}>Rejected</option>
                </select>
                
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value={MaintenanceCategory.PLUMBING}>Plumbing</option>
                    <option value={MaintenanceCategory.ELECTRICAL}>Electrical</option>
                    <option value={MaintenanceCategory.HVAC}>HVAC</option>
                    <option value={MaintenanceCategory.APPLIANCE}>Appliance</option>
                    <option value={MaintenanceCategory.STRUCTURAL}>Structural</option>
                    <option value={MaintenanceCategory.GENERAL}>General</option>
                    <option value={MaintenanceCategory.OTHER}>Other</option>
                </select>
                
                <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="">All Priorities</option>
                    <option value={MaintenancePriority.LOW}>Low</option>
                    <option value={MaintenancePriority.MEDIUM}>Medium</option>
                    <option value={MaintenancePriority.HIGH}>High</option>
                    <option value={MaintenancePriority.EMERGENCY}>Emergency</option>
                </select>
            </div>
            
            {selectedRequest ? (
                <div className={styles.requestDetails}>
                    <div className={styles.requestDetailsHeader}>
                        <h2>Maintenance Request Details</h2>
                        <button 
                            className={styles.closeButton}
                            onClick={closeRequestDetails}
                        >
                            &times;
                        </button>
                    </div>
                    
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Request ID</span>
                            <span className={styles.detailValue}>{selectedRequest.id}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Status</span>
                            <span className={`${styles.statusBadge} ${styles[`status${selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}`]}`}>
                                {selectedRequest.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Priority</span>
                            <span className={`${styles.priorityBadge} ${styles[`priority${selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}`]}`}>
                                {selectedRequest.priority.toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Category</span>
                            <span className={styles.detailValue}>{selectedRequest.category}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Room</span>
                            <span className={styles.detailValue}>{getRoomNumber(selectedRequest.roomId)}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Tenant</span>
                            <span className={styles.detailValue}>{getTenantName(selectedRequest.tenantId)}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Submitted Date</span>
                            <span className={styles.detailValue}>{formatDate(selectedRequest.submittedDate)}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Assigned To</span>
                            <span className={styles.detailValue}>{selectedRequest.assignedTo || 'Not assigned'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Scheduled Date</span>
                            <span className={styles.detailValue}>{selectedRequest.scheduledDate ? formatDate(selectedRequest.scheduledDate) : 'Not scheduled'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Completed Date</span>
                            <span className={styles.detailValue}>{selectedRequest.completedDate ? formatDate(selectedRequest.completedDate) : 'Not completed'}</span>
                        </div>
                    </div>
                    
                    <div className={styles.requestDescription}>
                        <h3>Description</h3>
                        <p>{selectedRequest.description}</p>
                        
                        {selectedRequest.notes && (
                            <>
                                <h3>Notes</h3>
                                <p>{selectedRequest.notes}</p>
                            </>
                        )}
                    </div>
                    
                    {selectedRequest.status !== MaintenanceStatus.COMPLETED && selectedRequest.status !== MaintenanceStatus.CANCELLED && (
                        <div className={styles.requestActions}>
                            <button 
                                className={styles.primaryButton}
                                onClick={() => setShowUpdateForm(!showUpdateForm)}
                            >
                                {showUpdateForm ? 'Cancel Update' : 'Update Request'}
                            </button>
                        </div>
                    )}
                    
                    {showUpdateForm && (
                        <div className={styles.updateForm}>
                            <h3>Update Request</h3>
                            <form onSubmit={handleUpdateSubmit}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={updateForm.status}
                                            onChange={handleUpdateInputChange}
                                        >
                                            <option value="">No Change</option>
                                            <option value={MaintenanceStatus.SUBMITTED}>Submitted</option>
                                            <option value={MaintenanceStatus.ACKNOWLEDGED}>Acknowledged</option>
                                            <option value={MaintenanceStatus.ASSIGNED}>Assigned</option>
                                            <option value={MaintenanceStatus.IN_PROGRESS}>In Progress</option>
                                            <option value={MaintenanceStatus.ON_HOLD}>On Hold</option>
                                            <option value={MaintenanceStatus.COMPLETED}>Completed</option>
                                            <option value={MaintenanceStatus.CANCELLED}>Cancelled</option>
                                            <option value={MaintenanceStatus.REJECTED}>Rejected</option>
                                        </select>
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label htmlFor="assignedTo">Assigned To</label>
                                        <input
                                            id="assignedTo"
                                            name="assignedTo"
                                            type="text"
                                            value={updateForm.assignedTo}
                                            onChange={handleUpdateInputChange}
                                            placeholder="Name of assignee"
                                        />
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label htmlFor="scheduledDate">Scheduled Date</label>
                                        <input
                                            id="scheduledDate"
                                            name="scheduledDate"
                                            type="date"
                                            value={updateForm.scheduledDate}
                                            onChange={handleUpdateInputChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="notes">Update Notes *</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={updateForm.notes}
                                        onChange={handleUpdateInputChange}
                                        rows={3}
                                        required
                                    />
                                </div>
                                
                                <div className={styles.formActions}>
                                    <button 
                                        type="submit" 
                                        className={styles.primaryButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Submit Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    <div className={styles.updatesList}>
                        <h3>Request History</h3>
                        {requestUpdates.length === 0 ? (
                            <p>No updates found.</p>
                        ) : (
                            requestUpdates
                                .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
                                .map(update => (
                                    <div key={update.id} className={styles.updateItem}>
                                        <div className={styles.updateHeader}>
                                            <span className={`${styles.statusBadge} ${styles[`status${update.status.charAt(0).toUpperCase() + update.status.slice(1)}`]}`}>
                                                {update.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={styles.updateDate}>{formatDate(update.updateDate)}</span>
                                        </div>
                                        <div className={styles.updateNotes}>
                                            <p>Updated by: {update.updatedBy}</p>
                                            <p>{update.notes}</p>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.dataTable}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Room</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests
                                .sort((a, b) => {
                                    const priorityOrder = { 
                                        [MaintenancePriority.EMERGENCY]: 0, 
                                        [MaintenancePriority.HIGH]: 1, 
                                        [MaintenancePriority.MEDIUM]: 2, 
                                        [MaintenancePriority.LOW]: 3 
                                    };
                                    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                                    
                                    if (priorityDiff !== 0) return priorityDiff;
                                    
                                    const statusOrder = { 
                                        [MaintenanceStatus.SUBMITTED]: 0, 
                                        [MaintenanceStatus.ACKNOWLEDGED]: 1, 
                                        [MaintenanceStatus.ASSIGNED]: 2, 
                                        [MaintenanceStatus.IN_PROGRESS]: 3, 
                                        [MaintenanceStatus.ON_HOLD]: 4, 
                                        [MaintenanceStatus.COMPLETED]: 5, 
                                        [MaintenanceStatus.CANCELLED]: 6, 
                                        [MaintenanceStatus.REJECTED]: 7 
                                    };
                                    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                                    
                                    if (statusDiff !== 0) return statusDiff;
                                    
                                    return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
                                })
                                .map(request => (
                                    <tr key={request.id}>
                                        <td>{request.id}</td>
                                        <td>{getRoomNumber(request.roomId)}</td>
                                        <td>{request.category}</td>
                                        <td>{request.description}</td>
                                        <td>
                                            <span className={`${styles.priorityBadge} ${styles[`priority${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}`]}`}>
                                                {request.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
                                                {request.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{formatDate(request.submittedDate).split(' ')[0]}</td>
                                        <td>
                                            <button 
                                                className={styles.primaryButton}
                                                onClick={() => fetchRequestDetails(request.id)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
