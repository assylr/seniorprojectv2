import { useEffect, useState } from "react";
import { getBuildings } from "../services/api";

const Buildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await getBuildings();
        setBuildings(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch buildings");
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Buildings</h1>
      <div className="card-grid">
        {buildings.map(building => (
          <div key={building.building_id} className="card">
            <h2>Building {building.building_number}</h2>
            <p>Type: {building.building_type}</p>
            <div className="building-stats">
              <div>
                <strong>Total Rooms:</strong> {building.total_rooms || 'N/A'}
              </div>
              <div>
                <strong>Available Rooms:</strong> {building.available_rooms || 'N/A'}
              </div>
              <div>
                <strong>Occupancy Rate:</strong> 
                {building.total_rooms ? 
                  `${Math.round(((building.total_rooms - building.available_rooms) / building.total_rooms) * 100)}%` 
                  : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Buildings;
