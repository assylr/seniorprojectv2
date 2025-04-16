import { useEffect, useState } from "react"
import { getBuildings, getRooms, getTenants } from "../services/api"

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
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
    return tenants.find(t => t.room_id === roomId && !t.departure_date);
  };

  const getBuildingNumber = (buildingId) => {
    const building = buildings.find(b => b.building_id === buildingId);
    return building ? building.building_number : buildingId;
  };

  const filteredRooms = rooms.filter(room => {
    return (
      (!filter.building || room.building_id === filter.building) &&
      (!filter.available || room.available.toString() === filter.available) &&
      (!filter.bedrooms || room.bedroom_count.toString() === filter.bedrooms)
    );
  });

  return (
    <div>
      <div className="header-actions">
        <h1>Rooms</h1>
        <div className="filters">
          <select 
            className="field"
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
            className="field"
            value={filter.available}
            onChange={(e) => setFilter({...filter, available: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Occupied</option>
          </select>

          <select 
            className="field"
            value={filter.bedrooms}
            onChange={(e) => setFilter({...filter, bedrooms: e.target.value})}
          >
            <option value="">All Sizes</option>
            {[...new Set(rooms.map(room => room.bedroom_count))].sort().map(count => (
              <option key={count} value={count}>{count} Bedroom(s)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="room-list">
        {filteredRooms.map((room) => (
          <div
            key={room.room_id}
            className="room-row"
            onClick={() => setSelectedRoom(room)}
          >
            <div>Room {room.room_number}</div>
            <div>Building {getBuildingNumber(room.building_id)}</div>
            <div>{room.available ? 'Available' : 'Occupied'}</div>
          </div>
        ))}

        {selectedRoom && (
          <>
            <div className="room-popup-overlay" onClick={() => setSelectedRoom(null)} />
            <div className="room-popup">
              <button className="room-popup-close" onClick={() => setSelectedRoom(null)}>×</button>
              <h2>Room {selectedRoom.room_number}</h2>
              <div>
                <p><strong>Building:</strong> {getBuildingNumber(selectedRoom.building_id)}</p>
                <p><strong>Floor:</strong> {selectedRoom.floor_number}</p>
                <p><strong>Bedrooms:</strong> {selectedRoom.bedroom_count}</p>
                <p><strong>Area:</strong> {selectedRoom.total_area} sqm</p>
                <p><strong>Status:</strong> {selectedRoom.available ? 'Available' : 'Occupied'}</p>
                {!selectedRoom.available && (
                  <div>
                    <h3>Current Occupant</h3>
                    {(() => {
                      const tenant = getCurrentTenant(selectedRoom.room_id);
                      return tenant ? (
                        <>
                          <p><strong>Name:</strong> {tenant.name} {tenant.surname}</p>
                          <p><strong>Type:</strong> {tenant.tenant_type}</p>
                          <p><strong>Since:</strong> {new Date(tenant.arrival_date).toLocaleDateString()}</p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Rooms;
