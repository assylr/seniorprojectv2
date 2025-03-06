import { useEffect, useState } from "react";
import { getBuildings, getRooms, getTenants } from "../services/api";
import * as XLSX from 'xlsx';

const Reports = () => {
  const [data, setData] = useState({
    buildings: [],
    rooms: [],
    tenants: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buildings, rooms, tenants] = await Promise.all([
          getBuildings(),
          getRooms(),
          getTenants()
        ]);
        setData({ buildings, rooms, tenants });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data for reports");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  const calculateStatistics = () => {
    const activeTenantsCount = data.tenants.filter(t => !t.departure_date).length;
    const totalRooms = data.rooms.length;
    const occupiedRoomsCount = data.rooms.filter(r => !r.available).length;
    
    const occupancyRate = totalRooms > 0 
      ? ((occupiedRoomsCount / totalRooms) * 100).toFixed(1) 
      : '0.0';

    const tenantTypeDistribution = data.tenants
      .filter(t => !t.departure_date)
      .reduce((acc, t) => {
        const type = t.tenant_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

    return {
      totalBuildings: data.buildings.length,
      totalRooms,
      activeTenantsCount,
      occupiedRoomsCount,
      occupancyRate,
      tenantTypeDistribution,
      averageRoomsPerBuilding: (totalRooms / (data.buildings.length || 1)).toFixed(1)
    };
  };

  const generateTenantReport = () => {
    // Get active tenants and sort them by building and room
    const activeTenants = data.tenants
      .filter(t => !t.departure_date)
      .sort((a, b) => {
        const buildingA = data.buildings.find(b => b.building_id === a.building_id)?.building_number || '';
        const buildingB = data.buildings.find(b => b.building_id === b.building_id)?.building_number || '';
        if (buildingA !== buildingB) return buildingA.localeCompare(buildingB);
        return a.room_id - b.room_id;
      });

    // Prepare data for Excel
    const excelData = activeTenants.map(tenant => {
      const building = data.buildings.find(b => b.building_id === tenant.building_id);
      const room = data.rooms.find(r => r.room_id === tenant.room_id);
      
      return {
        'Building': `Building ${building?.building_number || 'N/A'}`,
        'Room': room?.room_number || 'N/A',
        'Name': `${tenant.name} ${tenant.surname}`,
        'Type': tenant.tenant_type || 'N/A',
        'School': tenant.school || 'N/A',
        'Position': tenant.position || 'N/A',
        'Contact': tenant.mobile || 'N/A',
        'Email': tenant.email || 'N/A',
        'Check-in Date': new Date(tenant.arrival_date).toLocaleDateString()
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add column widths
    const columnWidths = [
      { wch: 15 }, // Building
      { wch: 10 }, // Room
      { wch: 25 }, // Name
      { wch: 15 }, // Type
      { wch: 20 }, // School
      { wch: 20 }, // Position
      { wch: 15 }, // Contact
      { wch: 25 }, // Email
      { wch: 15 }, // Check-in Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Active Tenants');

    // Generate Excel file
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `tenant_report_${today}.xlsx`);
  };

  const stats = calculateStatistics();

  const getBuildingNumber = (buildingId) => {
    const building = data.buildings.find(b => b.building_id === buildingId);
    return building ? building.building_number : buildingId;
  };

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Housing Management Reports</h1>
        <button 
          onClick={generateTenantReport}
          className="primary"
        >
          Download Tenant Report
        </button>
      </div>

      <div className="reports-grid">
        {/* Overview Cards */}
        <div className="card">
          <h3>Overview</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalBuildings}</span>
              <span className="stat-label">Total Buildings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalRooms}</span>
              <span className="stat-label">Total Rooms</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.activeTenantsCount}</span>
              <span className="stat-label">Active Tenants</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.occupancyRate}%</span>
              <span className="stat-label">Occupancy Rate</span>
            </div>
          </div>
        </div>

        {/* Tenant Distribution */}
        <div className="card">
          <h3>Tenant Type Distribution</h3>
          <div className="tenant-distribution">
            {Object.entries(stats.tenantTypeDistribution).map(([type, count]) => (
              <div key={type} className="distribution-item">
                <span className="type-label">{type}</span>
                <span className="type-count">{count}</span>
                <div 
                  className="type-bar" 
                  style={{
                    width: `${(count / stats.activeTenantsCount) * 100}%`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Building Occupancy */}
        <div className="card">
          <h3>Building Occupancy</h3>
          <div className="building-occupancy">
            {data.buildings.map(building => {
              const buildingRooms = data.rooms.filter(r => r.building_id === building.building_id);
              const occupiedRooms = buildingRooms.filter(r => !r.available).length;
              const occupancyRate = buildingRooms.length > 0 
                ? (occupiedRooms / buildingRooms.length * 100).toFixed(1)
                : '0.0';

              return (
                <div key={building.building_id} className="building-stat">
                  <span className="building-label">Building {building.building_number}</span>
                  <div className="occupancy-bar-container">
                    <div 
                      className="occupancy-bar"
                      style={{ width: `${occupancyRate}%` }}
                    />
                    <span className="occupancy-label">{occupancyRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
