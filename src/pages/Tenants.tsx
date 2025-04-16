import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { getTenants, checkInTenant, checkOutTenant, getRooms, getBuildings } from "../services/api";
import { Tenant, Building, Room, TenantData } from "../services/types";
import BatchCheckIn from "../components/BatchCheckIn";
import BatchCheckOut from "../components/BatchCheckOut";

interface FilterState {
  status: string;
  type: string;
  building: string;
  searchQuery: string;
}

interface NewTenantState {
  name: string;
  surname: string;
  school: string;
  position: string;
  tenant_type: 'renter' | 'faculty' | '';
  mobile: string;
  email: string;
  room_id: string;
}

const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showBatchCheckIn, setShowBatchCheckIn] = useState(false);
  const [showBatchCheckOut, setShowBatchCheckOut] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    status: '',
    type: '',
    building: '',
    searchQuery: ''
  });

  const [newTenant, setNewTenant] = useState<NewTenantState>({
    name: "",
    surname: "",
    school: "",
    position: "",
    tenant_type: '',
    mobile: "",
    email: "",
    room_id: ""
  });

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
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
    } catch (err) {
      setError("Failed to fetch data due to: " + err);
    } finally {
      setLoading(false);
    }
  };

  // Update available rooms when building is selected
  useEffect(() => {
    const selectedBuilding = filter.building;
    if (selectedBuilding) {
      const buildingRooms = rooms.filter(room =>
        room.building.id.toString() === selectedBuilding &&
        room.available
      );
      setAvailableRooms(buildingRooms);
      if (!buildingRooms.find(room => room.id.toString() === newTenant.room_id)) {
        setNewTenant(prev => ({ ...prev, room_id: "" }));
      }
    } else {
      setAvailableRooms([]);
      setNewTenant(prev => ({ ...prev, room_id: "" }));
    }
  }, [filter.building, rooms, newTenant.room_id]);

  const handleCheckIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!newTenant.tenant_type) {
        throw new Error('Please select a tenant type');
      }

      const tenantData: TenantData = {
        name: newTenant.name.trim(),
        surname: newTenant.surname.trim(),
        school: newTenant.school.trim() || undefined,
        position: newTenant.position.trim() || undefined,
        tenant_type: newTenant.tenant_type,
        mobile: newTenant.mobile.trim() || undefined,
        email: newTenant.email.trim() || undefined,
        room_id: parseInt(newTenant.room_id)
      };

      await checkInTenant(tenantData);
      setShowCheckInForm(false);
      setNewTenant({
        name: "",
        surname: "",
        school: "",
        position: "",
        tenant_type: '',
        mobile: "",
        email: "",
        room_id: ""
      });
      await fetchInitialData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (id: number) => {
    if (!window.confirm("Are you sure you want to check out this tenant?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await checkOutTenant(id);
      await fetchInitialData();
    } catch (err) {
      setError("Failed to check out tenant due to: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTenant(prev => ({ ...prev, [name]: value }));
  };

  // Search and filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const isCheckedOut = !!tenant.departure_date;
    const tenantBuildingId = tenant.room.building.id.toString();

    // Basic filters
    const statusMatch = !filter.status ||
      (filter.status === 'active' && !isCheckedOut) ||
      (filter.status === 'checked-out' && isCheckedOut);
    const typeMatch = !filter.type || tenant.tenant_type === filter.type;
    const buildingMatch = !filter.building || tenantBuildingId === filter.building;

    // Search query filter
    let searchMatch = true;
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const fullName = `${tenant.name} ${tenant.surname}`.toLowerCase();
      const email = (tenant.email || '').toLowerCase();
      const mobile = (tenant.mobile || '').toLowerCase();
      const position = (tenant.position || '').toLowerCase();
      const school = (tenant.school || '').toLowerCase();
      const roomInfo = `${tenant.room.building.buildingNumber}-${tenant.room.roomNumber}`.toLowerCase();

      searchMatch = fullName.includes(query) ||
                   email.includes(query) ||
                   mobile.includes(query) ||
                   position.includes(query) ||
                   school.includes(query) ||
                   roomInfo.includes(query);
    }

    return statusMatch && typeMatch && buildingMatch && searchMatch;
  });

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Tenants</h1>
        <div className="button-group">
          <button
            onClick={() => {
              setShowCheckInForm(!showCheckInForm);
              setShowBatchCheckIn(false);
              setShowBatchCheckOut(false);
            }}
            className="primary"
          >
            {showCheckInForm ? 'Cancel Check-In' : 'New Check-In'}
          </button>
          <button
            onClick={() => {
              setShowBatchCheckIn(!showBatchCheckIn);
              setShowCheckInForm(false);
              setShowBatchCheckOut(false);
            }}
            className="secondary"
          >
            {showBatchCheckIn ? 'Cancel' : 'Batch Check-In'}
          </button>
          <button
            onClick={() => {
              setShowBatchCheckOut(!showBatchCheckOut);
              setShowCheckInForm(false);
              setShowBatchCheckIn(false);
            }}
            className="secondary"
          >
            {showBatchCheckOut ? 'Cancel' : 'Batch Check-Out'}
          </button>
        </div>
      </div>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, phone, room..."
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({...prev, searchQuery: e.target.value}))}
          />
          {filter.searchQuery && (
            <button
              className="clear-search"
              onClick={() => setFilter(prev => ({...prev, searchQuery: ''}))}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <div className="search-icon">🔍</div>
        </div>

        <div className="filters">
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({...prev, status: e.target.value}))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="checked-out">Checked Out</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({...prev, type: e.target.value}))}
          >
            <option value="">All Types</option>
            <option value="renter">Renter</option>
            <option value="faculty">Faculty</option>
          </select>

          <select
            value={filter.building}
            onChange={(e) => setFilter(prev => ({...prev, building: e.target.value}))}
          >
            <option value="">All Buildings</option>
            {buildings.map(building => (
              <option key={building.id} value={building.id}>
                Building {building.buildingNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-summary">
        <p>
          {filteredTenants.length === 0 ? (
            "No tenants found matching your criteria"
          ) : (
            `Showing ${filteredTenants.length} ${filteredTenants.length === 1 ? 'tenant' : 'tenants'}`
          )}
          {filter.searchQuery && (
            <> matching "<strong>{filter.searchQuery}</strong>"</>
          )}
        </p>
      </div>

      {showCheckInForm && (
        <div className="check-in-form">
          <h2>New Check-In</h2>
          <form onSubmit={handleCheckIn}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newTenant.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname *</label>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  value={newTenant.surname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="tenant_type">Type *</label>
                <select
                  id="tenant_type"
                  name="tenant_type"
                  value={newTenant.tenant_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="renter">Renter</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="room_id">Room *</label>
                <select
                  id="room_id"
                  name="room_id"
                  value={newTenant.room_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Room</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {`${room.building.buildingNumber} - ${room.roomNumber}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="school">School</label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  value={newTenant.school}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  value={newTenant.position}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="mobile">Mobile</label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={newTenant.mobile}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={newTenant.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowCheckInForm(false)}
                className="secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Check In'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-grid">
        {filteredTenants.length === 0 ? (
          <div className="no-results">
            <p>No tenants found matching your criteria.</p>
            {filter.searchQuery && (
              <button
                onClick={() => setFilter(prev => ({...prev, searchQuery: ''}))}
                className="primary"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredTenants.map(tenant => {
            // Highlight matching text if there's a search query
            const highlightText = (text: string) => {
              if (!filter.searchQuery || !text) return text;

              const query = filter.searchQuery.toLowerCase();
              const lowerText = text.toLowerCase();

              if (!lowerText.includes(query)) return text;

              const parts = [];
              let lastIndex = 0;
              let index = lowerText.indexOf(query);

              while (index !== -1) {
                // Add text before match
                if (index > lastIndex) {
                  parts.push(text.substring(lastIndex, index));
                }

                // Add highlighted match
                parts.push(
                  <span key={index} className="highlight">
                    {text.substring(index, index + query.length)}
                  </span>
                );

                lastIndex = index + query.length;
                index = lowerText.indexOf(query, lastIndex);
              }

              // Add remaining text
              if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
              }

              return parts;
            };

            return (
              <div key={tenant.id} className="card tenant-card">
                <div className="tenant-header">
                  <h3>{highlightText(`${tenant.name} ${tenant.surname}`)}</h3>
                  <span className={`status ${tenant.departure_date ? 'status-checked-out' : 'status-active'}`}>
                    {tenant.departure_date ? 'Checked Out' : 'Active'}
                  </span>
                </div>
                <div className="tenant-details">
                  <p><strong>Type:</strong> {tenant.tenant_type}</p>
                  {tenant.school && <p><strong>School:</strong> {highlightText(tenant.school)}</p>}
                  {tenant.position && <p><strong>Position:</strong> {highlightText(tenant.position)}</p>}
                  <p>
                    <strong>Building:</strong>
                    {highlightText(tenant.room.building.buildingNumber)}
                  </p>
                  <p>
                    <strong>Room:</strong>
                    {highlightText(tenant.room.roomNumber)}
                  </p>
                  {tenant.mobile && <p><strong>Mobile:</strong> {highlightText(tenant.mobile)}</p>}
                  {tenant.email && <p><strong>Email:</strong> {highlightText(tenant.email)}</p>}
                  <p><strong>Arrival:</strong> {new Date(tenant.arrival_date).toLocaleDateString()}</p>
                  {tenant.departure_date && (
                    <p><strong>Departure:</strong> {new Date(tenant.departure_date).toLocaleDateString()}</p>
                  )}
                </div>
                {!tenant.departure_date && (
                  <div className="card-actions">
                    <button
                      onClick={() => handleCheckOut(tenant.id)}
                      className="danger"
                      disabled={isSubmitting}
                    >
                      Check Out
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showBatchCheckIn && (
        <div className="batch-operation-container">
          <BatchCheckIn
            buildings={buildings}
            rooms={rooms}
            onComplete={() => {
              setShowBatchCheckIn(false);
              fetchInitialData();
            }}
            onCancel={() => setShowBatchCheckIn(false)}
          />
        </div>
      )}

      {showBatchCheckOut && (
        <div className="batch-operation-container">
          <BatchCheckOut
            tenants={tenants}
            onComplete={() => {
              setShowBatchCheckOut(false);
              fetchInitialData();
            }}
            onCancel={() => setShowBatchCheckOut(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Tenants;
