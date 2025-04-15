import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { 
    getTenants, 
    getRooms, 
    getUtilityRates, 
    getUtilityReadings, 
    getUtilityBills, 
    addUtilityReading, 
    generateUtilityBill, 
    updateBillStatus 
} from '../services/api';
import { Tenant, Room, UtilityRate, UtilityReading, UtilityBill } from '../services/types';

interface ReadingFormData {
    roomId: string;
    utilityType: 'electricity' | 'water' | 'heating' | 'internet' | '';
    value: string;
    readingDate: string;
}

interface BillingFormData {
    tenantId: string;
    startDate: string;
    endDate: string;
}

const UtilityBilling = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [rates, setRates] = useState<UtilityRate[]>([]);
    const [readings, setReadings] = useState<UtilityReading[]>([]);
    const [bills, setBills] = useState<UtilityBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState<'readings' | 'bills'>('readings');
    const [showReadingForm, setShowReadingForm] = useState(false);
    const [showBillingForm, setShowBillingForm] = useState(false);
    
    const [readingForm, setReadingForm] = useState<ReadingFormData>({
        roomId: '',
        utilityType: '',
        value: '',
        readingDate: new Date().toISOString().split('T')[0]
    });
    
    const [billingForm, setBillingForm] = useState<BillingFormData>({
        tenantId: '',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    
    const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const [tenantsData, roomsData, ratesData, readingsData, billsData] = await Promise.all([
                getTenants(),
                getRooms(),
                getUtilityRates(),
                getUtilityReadings(),
                getUtilityBills()
            ]);
            
            setTenants(tenantsData);
            setRooms(roomsData);
            setRates(ratesData);
            setReadings(readingsData);
            setBills(billsData);
        } catch (err) {
            setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleReadingInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setReadingForm(prev => ({ ...prev, [name]: value }));
    };
    
    const handleBillingInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBillingForm(prev => ({ ...prev, [name]: value }));
    };
    
    const handleReadingSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!readingForm.roomId) throw new Error('Room is required');
            if (!readingForm.utilityType) throw new Error('Utility type is required');
            if (!readingForm.value) throw new Error('Reading value is required');
            
            const reading: Omit<UtilityReading, 'id'> = {
                roomId: parseInt(readingForm.roomId),
                utilityType: readingForm.utilityType as 'electricity' | 'water' | 'heating' | 'internet',
                value: parseFloat(readingForm.value),
                readingDate: new Date(readingForm.readingDate)
            };
            
            await addUtilityReading(reading);
            setSuccess('Reading added successfully');
            setShowReadingForm(false);
            setReadingForm({
                roomId: '',
                utilityType: '',
                value: '',
                readingDate: new Date().toISOString().split('T')[0]
            });
            await fetchData();
        } catch (err) {
            setError(`Failed to add reading: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleBillingSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!billingForm.tenantId) throw new Error('Tenant is required');
            if (!billingForm.startDate) throw new Error('Start date is required');
            if (!billingForm.endDate) throw new Error('End date is required');
            
            const billingPeriod = {
                startDate: new Date(billingForm.startDate),
                endDate: new Date(billingForm.endDate)
            };
            
            await generateUtilityBill(parseInt(billingForm.tenantId), billingPeriod);
            setSuccess('Bill generated successfully');
            setShowBillingForm(false);
            setBillingForm({
                tenantId: '',
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            });
            await fetchData();
        } catch (err) {
            setError(`Failed to generate bill: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePayBill = async (billId: number) => {
        try {
            setIsSubmitting(true);
            await updateBillStatus(billId, 'paid');
            setSuccess('Bill marked as paid');
            await fetchData();
        } catch (err) {
            setError(`Failed to update bill: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const formatDate = (dateString: Date | string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };
    
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'paid': return 'status-paid';
            case 'overdue': return 'status-overdue';
            default: return 'status-pending';
        }
    };
    
    const getTenantName = (tenantId: number) => {
        const tenant = tenants.find(t => t.id === tenantId);
        return tenant ? `${tenant.name} ${tenant.surname}` : 'Unknown';
    };
    
    const getRoomNumber = (roomId: number) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? room.roomNumber : 'Unknown';
    };
    
    if (loading) return <div className="container">Loading...</div>;
    
    return (
        <div className="container">
            <div className="header-actions">
                <h1>Utility Billing</h1>
                <div className="button-group">
                    {activeTab === 'readings' && (
                        <button 
                            onClick={() => setShowReadingForm(!showReadingForm)}
                            className="primary"
                        >
                            {showReadingForm ? 'Cancel' : 'Add Reading'}
                        </button>
                    )}
                    {activeTab === 'bills' && (
                        <button 
                            onClick={() => setShowBillingForm(!showBillingForm)}
                            className="primary"
                        >
                            {showBillingForm ? 'Cancel' : 'Generate Bill'}
                        </button>
                    )}
                </div>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="tabs">
                <button 
                    className={activeTab === 'readings' ? 'active' : ''}
                    onClick={() => setActiveTab('readings')}
                >
                    Meter Readings
                </button>
                <button 
                    className={activeTab === 'bills' ? 'active' : ''}
                    onClick={() => setActiveTab('bills')}
                >
                    Utility Bills
                </button>
            </div>
            
            {activeTab === 'readings' && (
                <>
                    {showReadingForm && (
                        <div className="form-card">
                            <h2>Add Meter Reading</h2>
                            <form onSubmit={handleReadingSubmit}>
                                <div className="form-group">
                                    <label htmlFor="roomId">Room *</label>
                                    <select
                                        id="roomId"
                                        name="roomId"
                                        value={readingForm.roomId}
                                        onChange={handleReadingInputChange}
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
                                    <label htmlFor="utilityType">Utility Type *</label>
                                    <select
                                        id="utilityType"
                                        name="utilityType"
                                        value={readingForm.utilityType}
                                        onChange={handleReadingInputChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="electricity">Electricity</option>
                                        <option value="water">Water</option>
                                        <option value="heating">Heating</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="value">Reading Value *</label>
                                    <input
                                        id="value"
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={readingForm.value}
                                        onChange={handleReadingInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="readingDate">Reading Date *</label>
                                    <input
                                        id="readingDate"
                                        name="readingDate"
                                        type="date"
                                        value={readingForm.readingDate}
                                        onChange={handleReadingInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Add Reading'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    <div className="data-table">
                        <h2>Recent Readings</h2>
                        {readings.length === 0 ? (
                            <p>No readings found.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Room</th>
                                        <th>Utility Type</th>
                                        <th>Reading</th>
                                        <th>Previous</th>
                                        <th>Usage</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...readings]
                                        .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime())
                                        .map(reading => (
                                            <tr key={reading.id}>
                                                <td>{getRoomNumber(reading.roomId)}</td>
                                                <td className="capitalize">{reading.utilityType}</td>
                                                <td>{reading.value}</td>
                                                <td>{reading.previousValue || 0}</td>
                                                <td>{reading.value - (reading.previousValue || 0)}</td>
                                                <td>{formatDate(reading.readingDate)}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
            
            {activeTab === 'bills' && (
                <>
                    {showBillingForm && (
                        <div className="form-card">
                            <h2>Generate Utility Bill</h2>
                            <form onSubmit={handleBillingSubmit}>
                                <div className="form-group">
                                    <label htmlFor="tenantId">Tenant *</label>
                                    <select
                                        id="tenantId"
                                        name="tenantId"
                                        value={billingForm.tenantId}
                                        onChange={handleBillingInputChange}
                                        required
                                    >
                                        <option value="">Select Tenant</option>
                                        {tenants
                                            .filter(tenant => !tenant.departure_date)
                                            .map(tenant => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.name} {tenant.surname} (Room {tenant.room.roomNumber})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="startDate">Billing Period Start *</label>
                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={billingForm.startDate}
                                        onChange={handleBillingInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="endDate">Billing Period End *</label>
                                    <input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        value={billingForm.endDate}
                                        onChange={handleBillingInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Generating...' : 'Generate Bill'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {selectedBill && (
                        <div className="modal">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Bill Details</h2>
                                    <button 
                                        className="close-button"
                                        onClick={() => setSelectedBill(null)}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="bill-details">
                                    <div className="bill-header">
                                        <div>
                                            <h3>Tenant</h3>
                                            <p>{getTenantName(selectedBill.tenantId)}</p>
                                        </div>
                                        <div>
                                            <h3>Room</h3>
                                            <p>{getRoomNumber(selectedBill.roomId)}</p>
                                        </div>
                                        <div>
                                            <h3>Billing Period</h3>
                                            <p>{formatDate(selectedBill.billingPeriod.startDate)} - {formatDate(selectedBill.billingPeriod.endDate)}</p>
                                        </div>
                                        <div>
                                            <h3>Status</h3>
                                            <p className={getStatusClass(selectedBill.status)}>
                                                {selectedBill.status.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <table className="bill-items">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Usage</th>
                                                <th>Rate</th>
                                                <th>Base Charge</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBill.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="capitalize">{item.utilityType}</td>
                                                    <td>{item.usage !== undefined ? item.usage : '-'}</td>
                                                    <td>{item.rate !== undefined ? formatCurrency(item.rate) : '-'}</td>
                                                    <td>{item.baseCharge !== undefined ? formatCurrency(item.baseCharge) : '-'}</td>
                                                    <td>{formatCurrency(item.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan={4} className="text-right"><strong>Total</strong></td>
                                                <td><strong>{formatCurrency(selectedBill.totalAmount)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    
                                    <div className="bill-footer">
                                        <div>
                                            <p><strong>Issue Date:</strong> {formatDate(selectedBill.issueDate)}</p>
                                            <p><strong>Due Date:</strong> {formatDate(selectedBill.dueDate)}</p>
                                            {selectedBill.paymentDate && (
                                                <p><strong>Payment Date:</strong> {formatDate(selectedBill.paymentDate)}</p>
                                            )}
                                        </div>
                                        
                                        {selectedBill.status !== 'paid' && (
                                            <button 
                                                className="primary"
                                                onClick={() => handlePayBill(selectedBill.id)}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Processing...' : 'Mark as Paid'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="data-table">
                        <h2>Utility Bills</h2>
                        {bills.length === 0 ? (
                            <p>No bills found.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Room</th>
                                        <th>Billing Period</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...bills]
                                        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                                        .map(bill => (
                                            <tr key={bill.id}>
                                                <td>{getTenantName(bill.tenantId)}</td>
                                                <td>{getRoomNumber(bill.roomId)}</td>
                                                <td>{formatDate(bill.billingPeriod.startDate)} - {formatDate(bill.billingPeriod.endDate)}</td>
                                                <td>{formatCurrency(bill.totalAmount)}</td>
                                                <td className={getStatusClass(bill.status)}>
                                                    {bill.status.toUpperCase()}
                                                </td>
                                                <td>{formatDate(bill.dueDate)}</td>
                                                <td>
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => setSelectedBill(bill)}
                                                    >
                                                        View
                                                    </button>
                                                    {bill.status !== 'paid' && (
                                                        <button 
                                                            className="pay-button"
                                                            onClick={() => handlePayBill(bill.id)}
                                                            disabled={isSubmitting}
                                                        >
                                                            Pay
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default UtilityBilling;
