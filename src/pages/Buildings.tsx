import { useEffect, useState } from 'react'
import { getBuildings } from '../services/buildings'
import { Building } from '../types'

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
    key={building.id}
    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
  >
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      Building {building.buildingNumber}
    </h2>
    <p className="text-gray-600">Type: {building.buildingType}</p>
    <div className="mt-4 space-y-1 text-sm text-gray-700">
      <p><strong>Floors:</strong> {building.floorCount ?? 'N/A'}</p>
      <p><strong>Total Area:</strong> {building.totalArea ?? 'N/A'} m²</p>
      <p><strong>Status:</strong> {building.available ? 'Available' : 'Unavailable'}</p>
    </div>
  </div>
))}

      </div>
    </div>
  );
};

export default BuildingsPage;
