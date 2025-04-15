import { useEffect, useState } from "react"
import { getBuildings, getRooms, getTenants } from "../services/api"

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    building: '',
    available: '',
    bedrooms: ''
  });

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [roomsData, tenantsData, buildingsData] = await Promise.all([
        getRooms(),
        getTenants(),
        getBuildings()
      ]);
      setRooms(roomsData);
      setTenants(tenantsData);
      setBuildings(buildingsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
    }
  };
  

  // Function to get current tenant for a room
  const getCurrentTenant = (roomId) => {
    return tenants.find(t => 
      t.room_id === roomId && !t.departure_date
    );
  };

  const getBuildingNumber = (buildingId) => {
    const building = buildings.find(b => b.building_id === buildingId);
    return building ? building.building_number : buildingId;
  };

  const filteredRooms = rooms.filter(room => {
    return (
      (!filter.building || room.building_id.toString() === filter.building) &&
      (!filter.available || room.available.toString() === filter.available) &&
      (!filter.bedrooms || room.bedroom_count.toString() === filter.bedrooms)
    );
  });

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Rooms</h1>

      <div className="filters">
        <select 
          value={filter.building}
          onChange={(e) => setFilter({...filter, building: e.target.value})}
        >
          <option value="">All Buildings</option>
          {buildings.map(building => (
            <option key={building.building_id} value={building.building_id}>
              Building {building.building_number}
            </option>
          ))}
        </select>

        <select 
          value={filter.available}
          onChange={(e) => setFilter({...filter, available: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="true">Available</option>
          <option value="false">Occupied</option>
        </select>

        <select 
          value={filter.bedrooms}
          onChange={(e) => setFilter({...filter, bedrooms: e.target.value})}
        >
          <option value="">All Sizes</option>
          {[...new Set(rooms.map(room => room.bedroom_count))].sort().map(count => (
            <option key={count} value={count}>{count} Bedroom(s)</option>
          ))}
        </select>
      </div>

      <div className="card-grid">
        {filteredRooms.map(room => {
          const currentTenant = getCurrentTenant(room.room_id);
          
          return (
            <div key={room.room_id} className="card">
              <h3>Room {room.room_number}</h3>
              <div className="room-details">
                <p>
                  <strong>Building:</strong> {getBuildingNumber(room.building_id)}
                </p>
                <p>
                  <strong>Floor:</strong> {room.floor_number}
                </p>
                <p>
                  <strong>Bedrooms:</strong> {room.bedroom_count}
                </p>
                <p>
                  <strong>Area:</strong> {room.total_area} sqm
                </p>
                <span className={`status ${room.available ? 'status-available' : 'status-occupied'}`}>
                  {room.available ? 'Available' : 'Occupied'}
                </span>
                
                {currentTenant && (
                  <div className="occupant-info">
                    <h4>Current Occupant</h4>
                    <p>
                      <strong>Name:</strong> {currentTenant.name} {currentTenant.surname}
                    </p>
                    <p>
                      <strong>Type:</strong> {currentTenant.tenant_type}
                    </p>
                    <p>
                      <strong>Since:</strong> {new Date(currentTenant.arrival_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rooms;
