import { useEffect, useState } from "react";
import { Building, Room } from "../services/types";
import { getBuildings, getRooms } from "../services/api";

interface BuildingSummary extends Building {
    totalRooms: number;
    occupiedRooms: number;
    loadPercentage: number;
}

const Buildings = () => {
    const [buildings, setBuildings] = useState<BuildingSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('buildingNumber');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both buildings and rooms data
                const [buildingsData, roomsData] = await Promise.all([
                    getBuildings(),
                    getRooms()
                ]);

                // Calculate summary data for each building
                const buildingSummaries = buildingsData.map(building => {
                    // Get all rooms for this building
                    const buildingRooms = roomsData.filter(room => room.building.id === building.id);
                    const totalRooms = buildingRooms.length;
                    const occupiedRooms = buildingRooms.filter(room => !room.available).length;
                    const loadPercentage = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

                    return {
                        ...building,
                        totalRooms,
                        occupiedRooms,
                        loadPercentage
                    };
                });

                setBuildings(buildingSummaries);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch data");
                setLoading(false);
                console.log(err);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">Error: {error}</div>;

    // Sort buildings based on selected criteria
    const sortedBuildings = [...buildings].sort((a, b) => {
        switch(sortBy) {
            case 'loadPercentage':
                return b.loadPercentage - a.loadPercentage; // Highest occupancy first
            case 'totalRooms':
                return b.totalRooms - a.totalRooms; // Most rooms first
            case 'buildingNumber':
            default:
                return a.buildingNumber.localeCompare(b.buildingNumber); // Alphabetical
        }
    });

    return (
        <div className="container">
            <div className="header-actions">
                <h1>Buildings</h1>
                <div className="sort-controls">
                    <label htmlFor="sortBy">Sort by:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="buildingNumber">Building Number</option>
                        <option value="loadPercentage">Occupancy (Highest First)</option>
                        <option value="totalRooms">Total Rooms (Highest First)</option>
                    </select>
                </div>
            </div>

            <div className="card-grid">
                {sortedBuildings.map((building) => (
                    <div key={building.id} className="card building-card">
                        <span className="building-type-badge">
                            {building.buildingType.charAt(0).toUpperCase() + building.buildingType.slice(1)}
                        </span>

                        <h2>Building {building.buildingNumber}</h2>

                        <div className="building-stats">
                            {building.floorCount !== null && (
                                <div>
                                    <span>Floors</span>
                                    <span>{building.floorCount}</span>
                                </div>
                            )}
                            <div>
                                <span>Total Rooms</span>
                                <span>{building.totalRooms}</span>
                            </div>
                            <div>
                                <span>Occupied Rooms</span>
                                <span>{building.occupiedRooms}</span>
                            </div>
                            {building.totalArea !== null && (
                                <div>
                                    <span>Total Area</span>
                                    <span>{building.totalArea} m²</span>
                                </div>
                            )}
                        </div>

                        <div className="occupancy-section">
                            <div className="occupancy-header">
                                <span>Occupancy</span>
                                <span className="occupancy-percentage">{building.loadPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="occupancy-bar-container">
                                <div
                                    className="occupancy-bar"
                                    style={{ width: `${building.loadPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Buildings;
