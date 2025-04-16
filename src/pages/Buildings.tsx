import { useEffect, useState } from 'react'
import { getBuildings } from '../services/buildings'

type Building = {
  building_id: string;
  building_number: string;
  building_type: string;
  total_rooms?: number;
  available_rooms?: number;
};

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await getBuildings();
        setBuildings(data);
      } catch (err) {
        setError('Failed to fetch buildings');
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Buildings</h1>
      <div className="card-grid">
        {buildings.map((building) => (
          <div key={building.building_id} className="card">
            <h2 className="text-xl font-semibold">Building {building.building_number}</h2>
            <p>Type: {building.building_type}</p>
            <div className="building-stats mt-2">
              <div>
                <strong>Total Rooms:</strong> {building.total_rooms ?? 'N/A'}
              </div>
              <div>
                <strong>Available Rooms:</strong> {building.available_rooms ?? 'N/A'}
              </div>
              <div>
                <strong>Occupancy Rate:</strong>{' '}
                {building.total_rooms
                  ? `${Math.round(
                      ((building.total_rooms - (building.available_rooms ?? 0)) /
                        building.total_rooms) *
                        100,
                    )}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingsPage;
