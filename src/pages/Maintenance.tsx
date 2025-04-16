import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { 
    getMaintenanceRequests, 
    getMaintenanceRequestById, 
    getMaintenanceUpdates, 
    createMaintenanceRequest, 
    updateMaintenanceRequest,
    getRooms,
    getTenants
} from '../services/api';
import { MaintenanceRequest, MaintenanceUpdate, Room, Tenant } from '../services/types';
import { getCurrentUser } from '../services/auth';

interface MaintenanceFormData {
    roomId: string;
    tenantId: string;
    category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other' | '';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency' | '';
    notes: string;
}

interface UpdateFormData {
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | '';
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
            const [request, updates] = await Promise.all([
                getMaintenanceRequestById(requestId),
                getMaintenanceUpdates(requestId)
            ]);
            
            if (request) {
                setSelectedRequest(request);
                setRequestUpdates(updates);
                
                // Initialize update form with current values
                setUpdateForm({
                    status: request.status,
                    assignedTo: request.assignedTo || '',
                    scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : '',
                    notes: ''
                });
            } else {
                setError('Request not found');
            }
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
            
            const requestData = {
                roomId: parseInt(requestForm.roomId),
                tenantId: requestForm.tenantId ? parseInt(requestForm.tenantId) : undefined,
                category: requestForm.category as 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other',
                description: requestForm.description,
                priority: requestForm.priority as 'low' | 'medium' | 'high' | 'emergency',
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
        return room ? `${room.roomNumber} (Building ${room.building.buildingNumber})` : 'Unknown';
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
    
    if (loading && !requests.length) return <div className="container">Loading...</div>;
    
    return (
        <div className="container">
            <div className="header-actions">
                <h1>Maintenance Management</h1>
                <button 
                    onClick={() => setShowRequestForm(!showRequestForm)}
                    className="primary"
                >
                    {showRequestForm ? 'Cancel' : 'New Maintenance Request'}
                </button>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            {showRequestForm && (
                <div className="form-card">
                    <h2>New Maintenance Request</h2>
                    <form onSubmit={handleRequestSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
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
                                            {room.roomNumber} (Building {room.building.buildingNumber})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="tenantId">Tenant (if applicable)</label>
                                <select
                                    id="tenantId"
                                    name="tenantId"
                                    value={requestForm.tenantId}
                                    onChange={handleRequestInputChange}
                                >
                                    <option value="">Select Tenant (Optional)</option>
                                    {tenants
                                        .filter(tenant => !tenant.departure_date)
                                        .map(tenant => (
                                            <option key={tenant.id} value={tenant.id}>
                                                {tenant.name} {tenant.surname}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={requestForm.category}
                                    onChange={handleRequestInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="hvac">HVAC</option>
                                    <option value="appliance">Appliance</option>
                                    <option value="structural">Structural</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="priority">Priority *</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={requestForm.priority}
                                    onChange={handleRequestInputChange}
                                    required
                                >
                                    <option value="">Select Priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-group">
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
                        
                        <div className="form-group">
                            <label htmlFor="notes">Additional Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={requestForm.notes}
                                onChange={handleRequestInputChange}
                                rows={2}
                            />
                        </div>
                        
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Create Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="filters">
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                    <option value="other">Other</option>
                </select>
                
                <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                </select>
            </div>
            
            {selectedRequest ? (
                <div className="request-details-container">
                    <div className="request-details-header">
                        <h2>Maintenance Request Details</h2>
                        <button 
                            className="close-button"
                            onClick={closeRequestDetails}
                        >
                            &times;
                        </button>
                    </div>
                    
                    <div className="request-details">
                        <div className="request-info">
                            <div className="info-group">
                                <h3>Request ID</h3>
                                <p>{selectedRequest.id}</p>
                            </div>
                            <div className="info-group">
                                <h3>Status</h3>
                                <p className={getStatusClass(selectedRequest.status)}>
                                    {selectedRequest.status.replace('_', ' ').toUpperCase()}
                                </p>
                            </div>
                            <div className="info-group">
                                <h3>Priority</h3>
                                <p className={getPriorityClass(selectedRequest.priority)}>
                                    {selectedRequest.priority.toUpperCase()}
                                </p>
                            </div>
                            <div className="info-group">
                                <h3>Category</h3>
                                <p className="capitalize">{selectedRequest.category}</p>
                            </div>
                        </div>
                        
                        <div className="request-details-grid">
                            <div className="detail-group">
                                <h3>Room</h3>
                                <p>{getRoomNumber(selectedRequest.roomId)}</p>
                            </div>
                            <div className="detail-group">
                                <h3>Tenant</h3>
                                <p>{getTenantName(selectedRequest.tenantId)}</p>
                            </div>
                            <div className="detail-group">
                                <h3>Submitted Date</h3>
                                <p>{formatDate(selectedRequest.submittedDate)}</p>
                            </div>
                            <div className="detail-group">
                                <h3>Assigned To</h3>
                                <p>{selectedRequest.assignedTo || 'Not assigned'}</p>
                            </div>
                            <div className="detail-group">
                                <h3>Scheduled Date</h3>
                                <p>{selectedRequest.scheduledDate ? formatDate(selectedRequest.scheduledDate) : 'Not scheduled'}</p>
                            </div>
                            <div className="detail-group">
                                <h3>Completed Date</h3>
                                <p>{selectedRequest.completedDate ? formatDate(selectedRequest.completedDate) : 'Not completed'}</p>
                            </div>
                        </div>
                        
                        <div className="request-description">
                            <h3>Description</h3>
                            <p>{selectedRequest.description}</p>
                            
                            {selectedRequest.notes && (
                                <>
                                    <h3>Notes</h3>
                                    <p>{selectedRequest.notes}</p>
                                </>
                            )}
                        </div>
                        
                        {selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled' && (
                            <div className="request-actions">
                                <button 
                                    className="primary"
                                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                                >
                                    {showUpdateForm ? 'Cancel Update' : 'Update Request'}
                                </button>
                            </div>
                        )}
                        
                        {showUpdateForm && (
                            <div className="update-form">
                                <h3>Update Request</h3>
                                <form onSubmit={handleUpdateSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="status">Status</label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={updateForm.status}
                                                onChange={handleUpdateInputChange}
                                            >
                                                <option value="">No Change</option>
                                                <option value="pending">Pending</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
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
                                        
                                        <div className="form-group">
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
                                    
                                    <div className="form-group">
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
                                    
                                    <div className="form-actions">
                                        <button 
                                            type="submit" 
                                            className="primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Updating...' : 'Submit Update'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        <div className="request-history">
                            <h3>Request History</h3>
                            {requestUpdates.length === 0 ? (
                                <p>No updates found.</p>
                            ) : (
                                <div className="timeline">
                                    {requestUpdates
                                        .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
                                        .map(update => (
                                            <div key={update.id} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <span className={`status ${getStatusClass(update.status)}`}>
                                                            {update.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                        <span className="date">{formatDate(update.updateDate)}</span>
                                                    </div>
                                                    <div className="timeline-body">
                                                        <p className="updated-by">Updated by: {update.updatedBy}</p>
                                                        <p className="notes">{update.notes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="data-table">
                    <h2>Maintenance Requests</h2>
                    {filteredRequests.length === 0 ? (
                        <p>No maintenance requests found.</p>
                    ) : (
                        <table>
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
                                        // Sort by priority first (emergency -> high -> medium -> low)
                                        const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
                                        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                                                            priorityOrder[b.priority as keyof typeof priorityOrder];
                                        
                                        if (priorityDiff !== 0) return priorityDiff;
                                        
                                        // Then by status (pending -> assigned -> in_progress -> completed -> cancelled)
                                        const statusOrder = { pending: 0, assigned: 1, in_progress: 2, completed: 3, cancelled: 4 };
                                        const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - 
                                                          statusOrder[b.status as keyof typeof statusOrder];
                                        
                                        if (statusDiff !== 0) return statusDiff;
                                        
                                        // Finally by date (newest first)
                                        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
                                    })
                                    .map(request => (
                                        <tr key={request.id}>
                                            <td>{request.id}</td>
                                            <td>{getRoomNumber(request.roomId)}</td>
                                            <td className="capitalize">{request.category}</td>
                                            <td className="description-cell">{request.description}</td>
                                            <td className={getPriorityClass(request.priority)}>
                                                {request.priority.toUpperCase()}
                                            </td>
                                            <td className={getStatusClass(request.status)}>
                                                {request.status.replace('_', ' ').toUpperCase()}
                                            </td>
                                            <td>{formatDate(request.submittedDate).split(' ')[0]}</td>
                                            <td>
                                                <button 
                                                    className="view-button"
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
                    )}
                </div>
            )}
        </div>
    );
};

export default Maintenance;
