import { useState, useEffect } from 'react';
import { Building, Room, Tenant, TenantData } from '../services/types';
import { getBuildings, getRooms, getTenants, checkOutTenant, checkInTenant } from '../services/api';

interface FilterState {
  status: string;
  building: string;
}

interface NewTenantForm {
  name: string;
  surname: string;
  school: string;
  position: string;
  building_id: string;
  room_id: string;
  tenant_type: string;
  mobile: string;
  email: string;
  arrival_date: string;
}

const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const [filter, setFilter] = useState<FilterState>({
    status: '',
    building: ''
  });

  const [newTenant, setNewTenant] = useState<NewTenantForm>({
    name: '',
    surname: '',
    school: '',
    position: '',
    building_id: '',
    room_id: '',
    tenant_type: '',
    mobile: '',
    email: '',
    arrival_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Safe data fetching with retry
  const fetchData = async (retries = 3): Promise<void> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [tenantsData, buildingsData, roomsData] = await Promise.all([
          getTenants(),
          getBuildings(),
          getRooms()
        ]);
        
        // Validate data integrity
        if (!Array.isArray(tenantsData) || !Array.isArray(buildingsData) || !Array.isArray(roomsData)) {
          throw new Error('Invalid data format received');
        }

        setTenants(tenantsData);
        setBuildings(buildingsData);
        setRooms(roomsData);
        setError(null);
        return;
      } catch (error) {
        if (attempt === retries) {
          setError('Failed to load data. Please refresh the page.');
          console.error('Data fetch failed:', error);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const handleCheckOut = async (tenantId: number): Promise<void> => {
    setIsProcessing(true);
    try {
      // Optimistic update
      const tenant = tenants.find(t => t.tenant_id === tenantId);
      if (!tenant) throw new Error('Tenant not found');

      const optimisticTenants = tenants.map(t =>
        t.tenant_id === tenantId
          ? { ...t, departure_date: new Date().toISOString() }
          : t
      );
      setTenants(optimisticTenants);

      // Actual update
      await checkOutTenant(tenantId);
      
      // Refresh data in background
      fetchData().catch(error => {
        console.error('Background refresh failed:', error);
        // Revert to original state on background refresh failure
        setTenants(tenants);
      });
    } catch (error) {
      // Revert on error
      await fetchData();
      setError(error instanceof Error ? error.message : 'Failed to check out tenant');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tenantData: TenantData = {
        name: newTenant.name,
        surname: newTenant.surname,
        school: newTenant.school,
        position: newTenant.position,
        roomId: parseInt(newTenant.room_id),
        tenant_type: newTenant.tenant_type as 'renter' | 'faculty',
        mobile: newTenant.mobile,
        email: newTenant.email
      };
      
      await checkInTenant(tenantData);
      await fetchData();
      setShowCheckInForm(false);
      setNewTenant({
        name: '',
        surname: '',
        school: '',
        position: '',
        building_id: '',
        room_id: '',
        tenant_type: '',
        mobile: '',
        email: '',
        arrival_date: ''
      });
    } catch (err) {
      setError('Failed to check in tenant');
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBuildingNumber = (buildingId: number): string => {
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.buildingNumber : buildingId.toString();
  };

  const availableRooms = rooms.filter(room => 
    room.building.id.toString() === newTenant.building_id && room.available
  );

  const filteredTenants = tenants.filter(tenant => {
    return (
      (!filter.status || 
        (filter.status === 'active' && !tenant.departure_date) ||
        (filter.status === 'checked-out' && tenant.departure_date)
      ) &&
      (!filter.building || tenant.building.id.toString() === filter.building)
    );
  });

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Tenants</h1>
      
      <div className="actions">
        <button 
          className="primary" 
          onClick={() => setShowCheckInForm(true)}
        >
          New Check-In
        </button>
      </div>

      <div className="filters">
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="checked-out">Checked Out</option>
        </select>

        <select 
          value={filter.building}
          onChange={(e) => setFilter({...filter, building: e.target.value})}
        >
          <option value="">All Buildings</option>
          {buildings.map(building => (
            <option key={building.id} value={building.id}>
              Building {building.buildingNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Check-In Form */}
      {showCheckInForm && (
        <div className="card check-in-form">
          <h2>New Check-In</h2>
          <form onSubmit={handleCheckIn}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={newTenant.name}
                  onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input 
                  type="text" 
                  value={newTenant.surname}
                  onChange={e => setNewTenant({...newTenant, surname: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>School</label>
                <input 
                  type="text" 
                  value={newTenant.school}
                  onChange={e => setNewTenant({...newTenant, school: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input 
                  type="text" 
                  value={newTenant.position}
                  onChange={e => setNewTenant({...newTenant, position: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Building</label>
                <select
                  value={newTenant.building_id}
                  onChange={e => setNewTenant({...newTenant, building_id: e.target.value})}
                  required
                >
                  <option value="">Select Building</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      Building {building.buildingNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Room</label>
                <select
                  value={newTenant.room_id}
                  onChange={e => setNewTenant({...newTenant, room_id: e.target.value})}
                  required
                  disabled={!newTenant.building_id}
                >
                  <option value="">Select Room</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} ({room.bedroomCount} bedroom, {room.totalArea}sqm)
                    </option>
                  ))}
                </select>
                {newTenant.building_id && availableRooms.length === 0 && (
                  <p className="error-text">No available rooms in this building</p>
                )}
              </div>
              <div className="form-group">
                <label>Tenant Type</label>
                <select
                  value={newTenant.tenant_type}
                  onChange={e => setNewTenant({...newTenant, tenant_type: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="renter">Renter</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input 
                  type="tel" 
                  value={newTenant.mobile}
                  onChange={e => setNewTenant({...newTenant, mobile: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={newTenant.email}
                  onChange={e => setNewTenant({...newTenant, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Arrival Date</label>
                <input 
                  type="date" 
                  value={newTenant.arrival_date}
                  onChange={e => setNewTenant({...newTenant, arrival_date: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Check In'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCheckInForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tenants List */}
      <div className="card-grid">
        {filteredTenants.map(tenant => (
          <div key={tenant.tenant_id} className="card tenant-card">
            <div className="tenant-header">
              <h3>{tenant.name} {tenant.surname}</h3>
              <span className={`status ${tenant.departure_date ? 'status-checked-out' : 'status-active'}`}>
                {tenant.departure_date ? 'Checked Out' : 'Active'}
              </span>
            </div>
            <div className="tenant-details">
              <p><strong>Type:</strong> {tenant.tenant_type}</p>
              <p><strong>Position:</strong> {tenant.position || 'N/A'}</p>
              <p><strong>School:</strong> {tenant.school || 'N/A'}</p>
              <p><strong>Building:</strong> {getBuildingNumber(tenant.building.id)}</p>
              <p><strong>Room:</strong> {tenant.room.roomNumber}</p>
              <p><strong>Contact:</strong> {tenant.mobile} | {tenant.email}</p>
              <p><strong>Arrival:</strong> {new Date(tenant.arrival_date!).toLocaleDateString()}</p>
              {tenant.departure_date && (
                <p><strong>Departure:</strong> {new Date(tenant.departure_date).toLocaleDateString()}</p>
              )}
            </div>
            {!tenant.departure_date && (
              <div className="card-actions">
                <button 
                  onClick={() => handleCheckOut(tenant.tenant_id)}
                  className="danger"
                >
                  Check Out
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tenants;
