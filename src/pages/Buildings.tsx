import { useEffect, useState } from "react";
import { Building } from "../services/types";
import { getBuildings } from "../services/api";

const Buildings = () => {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const data = await getBuildings();
                setBuildings(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch buildings");
                setLoading(false);
                console.log(err);
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
            {buildings.map((building: Building) => (
              <div key={building.id} className="card">
                <h2>Building {building.buildingNumber}</h2>
                <p>Type: {building.buildingType}</p>
                <div className="building-stats">
                  {building.floorCount !== null && (
                    <div>
                      <strong>Floors:</strong> {building.floorCount}
                    </div>
                  )}
                  {building.totalArea !== null && (
                    <div>
                      <strong>Total Area:</strong> {building.totalArea} m²
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {building.available ? 'Available' : 'Not Available'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    );
};

export default Buildings;
