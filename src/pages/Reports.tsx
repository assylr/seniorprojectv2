import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { Building, Room, Tenant } from '../services/types';
import { getBuildings, getRooms, getTenants } from '../services/api';

interface Statistics {
  totalBuildings: number;
  totalRooms: number;
  activeTenantsCount: number;
  occupancyRate: string;
  tenantTypeDistribution: Record<string, number>;
  averageRoomsPerBuilding: string;
}

interface ReportData {
  buildings: Building[];
  rooms: Room[];
  tenants: Tenant[];
}

const Reports = () => {
  const [data, setData] = useState<ReportData>({
    buildings: [],
    rooms: [],
    tenants: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [buildings, rooms, tenants] = await Promise.all([
        getBuildings(),
        getRooms(),
        getTenants()
      ]);
      setData({ buildings, rooms, tenants });
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
      console.log(err);
    }
  };

  const calculateStatistics = (): Statistics => {
    const activeTenants = data.tenants.filter(t => !t.departure_date);
    const totalRooms = data.rooms.length;
    const occupiedRooms = data.rooms.filter(r => !r.available).length;

    // Calculate tenant type distribution
    const typeDistribution: Record<string, number> = {};
    activeTenants.forEach(tenant => {
      const type = tenant.tenant_type || 'Unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    return {
      totalBuildings: data.buildings.length,
      totalRooms,
      activeTenantsCount: activeTenants.length,
      occupancyRate: ((occupiedRooms / totalRooms) * 100).toFixed(1),
      tenantTypeDistribution: typeDistribution,
      averageRoomsPerBuilding: (totalRooms / (data.buildings.length || 1)).toFixed(1)
    };
  };

  const generateTenantReport = async (): Promise<void> => {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Active Tenants');

    // Define columns
    worksheet.columns = [
      { header: 'Building', key: 'building', width: 15 },
      { header: 'Room', key: 'room', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'School', key: 'school', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Contact', key: 'contact', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Check-in Date', key: 'checkinDate', width: 15 }
    ];

    // Get active tenants and sort them
    const activeTenants = data.tenants
      .filter(t => !t.departure_date)
      .sort((a, b) => {
        const buildingA = data.buildings.find(b => b.id === a.building.id)?.buildingNumber || '';
        const buildingB = data.buildings.find(b => b.id === b.building.id)?.buildingNumber || '';
        if (buildingA !== buildingB) return buildingA.localeCompare(buildingB);
        return a.room.id - b.room.id;
      });

    // Add data rows
    activeTenants.forEach(tenant => {
      worksheet.addRow({
        building: `Building ${tenant.building.buildingNumber || 'N/A'}`,
        room: tenant.room.roomNumber || 'N/A',
        name: `${tenant.name} ${tenant.surname}`,
        type: tenant.tenant_type || 'N/A',
        school: tenant.school || 'N/A',
        position: tenant.position || 'N/A',
        contact: tenant.mobile || 'N/A',
        email: tenant.email || 'N/A',
        checkinDate: new Date(tenant.arrival_date).toLocaleDateString()
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Generate file name
    const today = new Date().toISOString().split('T')[0];
    const fileName = `tenant_report_${today}.xlsx`;

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateStatistics();

  const getBuildingNumber = (buildingId: number): string => {
    const building = data.buildings.find(b => b.id === buildingId);
    return building ? building.buildingNumber : buildingId.toString();
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

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
              const buildingRooms = data.rooms.filter(r => r.building.id === building.id);
              const occupiedRooms = buildingRooms.filter(r => !r.available).length;
              const occupancyRate = buildingRooms.length > 0 
                ? (occupiedRooms / buildingRooms.length * 100).toFixed(1)
                : '0.0';

              return (
                <div key={building.id} className="building-stat">
                  <span className="building-label">Building {building.buildingNumber}</span>
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

