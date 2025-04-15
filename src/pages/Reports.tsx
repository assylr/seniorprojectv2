import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { Building, Room, Tenant, UtilityBill } from '../services/types';
import { getBuildings, getRooms, getTenants, getUtilityBills } from '../services/api';

interface Statistics {
  totalBuildings: number;
  totalRooms: number;
  activeTenantsCount: number;
  occupancyRate: string;
  tenantTypeDistribution: Record<string, number>;
  averageRoomsPerBuilding: string;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  averageBillAmount: string;
  utilityDistribution: Record<string, number>;
}

interface ReportData {
  buildings: Building[];
  rooms: Room[];
  tenants: Tenant[];
  bills: UtilityBill[];
}

const Reports = () => {
  const [data, setData] = useState<ReportData>({
    buildings: [],
    rooms: [],
    tenants: [],
    bills: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [buildings, rooms, tenants, bills] = await Promise.all([
        getBuildings(),
        getRooms(),
        getTenants(),
        getUtilityBills()
      ]);
      setData({ buildings, rooms, tenants, bills });
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

    // Calculate utility bill statistics
    const paidBills = data.bills.filter(b => b.status === 'paid').length;
    const pendingBills = data.bills.filter(b => b.status === 'pending').length;
    const totalBillAmount = data.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // Calculate utility type distribution
    const utilityDistribution: Record<string, number> = {};
    data.bills.forEach(bill => {
      bill.items.forEach(item => {
        if (item.utilityType !== 'rent') { // Exclude rent to focus on utilities
          utilityDistribution[item.utilityType] = (utilityDistribution[item.utilityType] || 0) + item.amount;
        }
      });
    });

    return {
      totalBuildings: data.buildings.length,
      totalRooms,
      activeTenantsCount: activeTenants.length,
      occupancyRate: ((occupiedRooms / totalRooms) * 100).toFixed(1),
      tenantTypeDistribution: typeDistribution,
      averageRoomsPerBuilding: (totalRooms / (data.buildings.length || 1)).toFixed(1),
      totalBills: data.bills.length,
      paidBills,
      pendingBills,
      averageBillAmount: data.bills.length > 0 ? (totalBillAmount / data.bills.length).toFixed(2) : '0.00',
      utilityDistribution
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

  const generateUtilityBillReport = async (): Promise<void> => {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Utility Bills');

    // Define columns
    worksheet.columns = [
      { header: 'Tenant', key: 'tenant', width: 25 },
      { header: 'Room', key: 'room', width: 10 },
      { header: 'Billing Period', key: 'period', width: 20 },
      { header: 'Issue Date', key: 'issueDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Rent', key: 'rent', width: 10 },
      { header: 'Electricity', key: 'electricity', width: 10 },
      { header: 'Water', key: 'water', width: 10 },
      { header: 'Heating', key: 'heating', width: 10 },
      { header: 'Internet', key: 'internet', width: 10 },
      { header: 'Total', key: 'total', width: 10 }
    ];

    // Process bills
    data.bills.forEach(bill => {
      const tenant = data.tenants.find(t => t.id === bill.tenantId);
      const room = data.rooms.find(r => r.id === bill.roomId);

      // Extract amounts by utility type
      const amounts: Record<string, number> = {};
      bill.items.forEach(item => {
        amounts[item.utilityType] = item.amount;
      });

      worksheet.addRow({
        tenant: tenant ? `${tenant.name} ${tenant.surname}` : 'Unknown',
        room: room ? room.roomNumber : 'Unknown',
        period: `${new Date(bill.billingPeriod.startDate).toLocaleDateString()} - ${new Date(bill.billingPeriod.endDate).toLocaleDateString()}`,
        issueDate: new Date(bill.issueDate).toLocaleDateString(),
        dueDate: new Date(bill.dueDate).toLocaleDateString(),
        status: bill.status.toUpperCase(),
        rent: amounts['rent'] || 0,
        electricity: amounts['electricity'] || 0,
        water: amounts['water'] || 0,
        heating: amounts['heating'] || 0,
        internet: amounts['internet'] || 0,
        total: bill.totalAmount
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Format currency columns
    ['rent', 'electricity', 'water', 'heating', 'internet', 'total'].forEach(col => {
      worksheet.getColumn(col).numFmt = '$#,##0.00';
    });

    // Generate file name
    const today = new Date().toISOString().split('T')[0];
    const fileName = `utility_bill_report_${today}.xlsx`;

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

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Housing Management Reports</h1>
        <div className="button-group">
          <button
            onClick={generateTenantReport}
            className="primary"
          >
            Download Tenant Report
          </button>
          <button
            onClick={generateUtilityBillReport}
            className="secondary"
          >
            Download Utility Bill Report
          </button>
        </div>
      </div>

      <div className="reports-grid">
        {/* Overview Cards */}
        <div className="card">
          <h3>Housing Overview</h3>
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

        {/* Billing Overview */}
        <div className="card">
          <h3>Billing Overview</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalBills}</span>
              <span className="stat-label">Total Bills</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.paidBills}</span>
              <span className="stat-label">Paid Bills</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.pendingBills}</span>
              <span className="stat-label">Pending Bills</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">${stats.averageBillAmount}</span>
              <span className="stat-label">Avg. Bill Amount</span>
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

        {/* Utility Distribution */}
        <div className="card">
          <h3>Utility Cost Distribution</h3>
          <div className="tenant-distribution">
            {Object.entries(stats.utilityDistribution).map(([type, amount]) => {
              const totalUtilityAmount = Object.values(stats.utilityDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = totalUtilityAmount > 0 ? (amount / totalUtilityAmount * 100) : 0;

              return (
                <div key={type} className="distribution-item">
                  <span className="type-label capitalize">{type}</span>
                  <span className="type-count">${amount.toFixed(2)}</span>
                  <div
                    className="type-bar"
                    style={{
                      width: `${percentage}%`
                    }}
                  />
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

