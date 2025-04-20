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

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Buildings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => (
          <div
            key={building.building_id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Building {building.building_number}
            </h2>
            <p className="text-gray-600">Type: {building.building_type}</p>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p><strong>Total Rooms:</strong> {building.total_rooms ?? 'N/A'}</p>
              <p><strong>Available Rooms:</strong> {building.available_rooms ?? 'N/A'}</p>
              <p>
                <strong>Occupancy Rate:</strong>{' '}
                {building.total_rooms
                  ? `${Math.round(
                      ((building.total_rooms - (building.available_rooms ?? 0)) /
                        building.total_rooms) *
                        100,
                    )}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingsPage;
