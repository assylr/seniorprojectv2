import { useEffect, useState } from "react";
import { getTenants, checkInTenant, checkOutTenant, getRooms, getBuildings } from "../services/api";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    building: ''
  });
  
  const [newTenant, setNewTenant] = useState({
    name: "",
    surname: "",
    school: "",
    position: "",
    tenant_type: "",
    mobile: "",
    email: "",
    arrival_date: "",
    building_id: "",
    room_id: ""
  });

  // Add this state to store available rooms for selected building
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tenantsData, roomsData, buildingsData] = await Promise.all([
        getTenants(),
        getRooms(),
        getBuildings()
      ]);
      setTenants(tenantsData);
      setRooms(roomsData);
      setBuildings(buildingsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  // Update available rooms when building is selected
  useEffect(() => {
    if (newTenant.building_id) {
      const buildingRooms = rooms.filter(room => 
        room.building_id.toString() === newTenant.building_id.toString() && 
        room.available
      );
      setAvailableRooms(buildingRooms);
      // Clear room selection if previously selected room is not in new building
      if (!buildingRooms.find(room => room.room_id.toString() === newTenant.room_id.toString())) {
        setNewTenant(prev => ({ ...prev, room_id: "" }));
      }
    } else {
      setAvailableRooms([]);
      setNewTenant(prev => ({ ...prev, room_id: "" }));
    }
  }, [newTenant.building_id, rooms]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      const requiredFields = ['name', 'surname', 'tenant_type', 'room_id', 'building_id'];
      const missingFields = requiredFields.filter(field => !newTenant[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate arrival date
      const arrivalDate = new Date(newTenant.arrival_date);
      if (isNaN(arrivalDate.getTime())) {
        throw new Error('Invalid arrival date');
      }

      await checkInTenant(newTenant);
      setShowCheckInForm(false);
      setNewTenant({
        name: "", surname: "", school: "", position: "", tenant_type: "",
        mobile: "", email: "", arrival_date: "", building_id: "", room_id: ""
      });
      fetchInitialData();
    } catch (error) {
      setError(error.message || "Failed to check in tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (tenantId) => {
    if (window.confirm("Are you sure you want to check out this tenant?")) {
      setIsSubmitting(true);
      try {
        await checkOutTenant(tenantId);
        fetchInitialData();
      } catch (error) {
        setError("Failed to check out tenant");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const isCheckedOut = !!tenant.departure_date;
    return (
      (!filter.status || 
        (filter.status === 'active' && !isCheckedOut) || 
        (filter.status === 'checked-out' && isCheckedOut)) &&
      (!filter.type || tenant.tenant_type === filter.type) &&
      (!filter.building || tenant.building_id.toString() === filter.building)
    );
  });

  const getBuildingNumber = (buildingId) => {
    const building = buildings.find(b => b.building_id === buildingId);
    return building ? building.building_number : buildingId;
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Tenants</h1>
        <button 
          onClick={() => setShowCheckInForm(!showCheckInForm)}
          className="primary"
        >
          {showCheckInForm ? 'Cancel Check-In' : 'New Check-In'}
        </button>
      </div>

      {/* Filters */}
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
          value={filter.type}
          onChange={(e) => setFilter({...filter, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="renter">Renter</option>
          <option value="faculty">Faculty</option>
        </select>

        <select 
          value={filter.building}
          onChange={(e) => setFilter({...filter, building: e.target.value})}
        >
          <option value="">All Buildings</option>
          {[...new Set(tenants.map(t => t.building_id))].map(id => (
            <option key={id} value={id}>Building {id}</option>
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
                <input className="input"
                  type="text" 
                  value={newTenant.name}
                  onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input className="input"
                  type="text" 
                  value={newTenant.surname}
                  onChange={e => setNewTenant({...newTenant, surname: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>School</label>
                <input className="input"
                  type="text" 
                  value={newTenant.school}
                  onChange={e => setNewTenant({...newTenant, school: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input className="input"
                  type="text" 
                  value={newTenant.position}
                  onChange={e => setNewTenant({...newTenant, position: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Building</label>
                <select className ="field"
                  value={newTenant.building_id}
                  onChange={e => setNewTenant({...newTenant, building_id: e.target.value})}
                  required
                > 
                  <option className ="field" value="">Select Building</option>
                  {buildings.map(building => (
                    <option key={building.building_id} value={building.building_id}>
                      Building {building.building_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Room</label>
                <select className ="field"
                  value={newTenant.room_id}
                  onChange={e => setNewTenant({...newTenant, room_id: e.target.value})}
                  required
                  disabled={!newTenant.building_id}
                >
                  <option value="">Select Room</option>
                  {availableRooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      Room {room.room_number} ({room.bedroom_count} bedroom, {room.total_area}sqm)
                    </option>
                  ))}
                </select>
                {newTenant.building_id && availableRooms.length === 0 && (
                  <p className="error-text">No available rooms in this building</p>
                )}
              </div>
              <div className="form-group" >
                <label>Tenant Type</label>
                <select className ="field"
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
                <input className="input"
                  type="tel" 
                  value={newTenant.mobile}
                  onChange={e => setNewTenant({...newTenant, mobile: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="input"
                  type="email" 
                  value={newTenant.email}
                  onChange={e => setNewTenant({...newTenant, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Arrival Date</label>
                <input className="input"
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
              <button type="button" onClick={() => setShowCheckInForm(false)}>Cancel</button>
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
              <p><strong>Building:</strong> {getBuildingNumber(tenant.building_id)}</p>
              <p><strong>Room:</strong> {tenant.room_id || 'Not Assigned'}</p>
              <p><strong>Contact:</strong> {tenant.mobile} | {tenant.email}</p>
              <p><strong>Arrival:</strong> {new Date(tenant.arrival_date).toLocaleDateString()}</p>
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
