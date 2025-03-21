import { useEffect, useState } from "react";
import { Room, Tenant, Building } from "../services/types";
import { getRooms, getTenants, getBuildings } from "../services/api";

interface FilterState {
  building: string;
  available: string;
  bedrooms: string;
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    building: '',
    available: '',
    bedrooms: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
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
      console.log(err);
    }
  };

  // Function to get current tenant for a room
  const getCurrentTenant = (roomId: number): Tenant | undefined => {
    return tenants.find(t => 
      t.room.id === roomId && !t.departure_date
    );
  };

  const getBuildingNumber = (buildingId: number): string => {
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.buildingNumber : buildingId.toString();
  };

  const filteredRooms = rooms.filter(room => {
    return (
      (!filter.building || room.building.id.toString() === filter.building) &&
      (!filter.available || room.available.toString() === filter.available) &&
      (!filter.bedrooms || room.bedroomCount.toString() === filter.bedrooms)
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
            <option key={building.id} value={building.id}>
              Building {building.buildingNumber}
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
          {[...new Set(rooms.map(room => room.bedroomCount))].sort().map(count => (
            <option key={count} value={count}>{count} Bedroom(s)</option>
          ))}
        </select>
      </div>

      <div className="card-grid">
        {filteredRooms.map(room => {
          const currentTenant = getCurrentTenant(room.id);
          
          return (
            <div key={room.id} className="card">
              <h3>Room {room.roomNumber}</h3>
              <div className="room-details">
                <p>
                  <strong>Building:</strong> {getBuildingNumber(room.building.id)}
                </p>
                <p>
                  <strong>Floor:</strong> {room.floorNumber}
                </p>
                <p>
                  <strong>Bedrooms:</strong> {room.bedroomCount}
                </p>
                <p>
                  <strong>Area:</strong> {room.totalArea} sqm
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
                      <strong>Since:</strong> {new Date(currentTenant.arrival_date!).toLocaleDateString()}
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
