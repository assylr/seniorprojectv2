import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { Building, Room, TenantDetailDTO, UtilityBill } from '@/types';
import { getBuildings, getRooms, getTenantDetails } from '@/services/api';
import styles from './ReportsPage.module.css';

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
    tenants: TenantDetailDTO[];
    bills: UtilityBill[];
}

const ReportsPage: React.FC = () => {
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
            const params = new URLSearchParams();
            const [buildings, rooms, tenants] = await Promise.all([
                getBuildings(),
                getRooms(),
                getTenantDetails(params)
            ]);
            setData({ buildings, rooms, tenants, bills: [] }); // TODO: Add getUtilityBills when available
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
            console.error(err);
        }
    };

    const calculateStatistics = (): Statistics => {
        const activeTenants = data.tenants.filter(t => t.status === 'ACTIVE');
        const totalRooms = data.rooms.length;
        const occupiedRooms = data.rooms.filter(r => {
            return activeTenants.some(t => t.roomId === r.id);
        }).length;

        // Calculate tenant type distribution
        const typeDistribution: Record<string, number> = {};
        activeTenants.forEach(tenant => {
            const type = tenant.tenantType || 'Unknown';
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
                if (item.utilityType !== 'other_charge') {
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
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Active Tenants');

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

        const activeTenants = data.tenants
            .filter(t => t.status === 'ACTIVE')
            .sort((a, b) => {
                const buildingA = data.buildings.find(b => b.id === a.buildingId)?.buildingNumber || '';
                const buildingB = data.buildings.find(b => b.id === b.buildingId)?.buildingNumber || '';
                if (buildingA !== buildingB) return buildingA.localeCompare(buildingB);
                return a.roomId - b.roomId;
            });

        activeTenants.forEach(tenant => {
            const building = data.buildings.find(b => b.id === tenant.buildingId);
            const room = data.rooms.find(r => r.id === tenant.roomId);
            worksheet.addRow({
                building: `Building ${building?.buildingNumber || 'N/A'}`,
                room: room?.roomNumber || 'N/A',
                name: `${tenant.name} ${tenant.surname}`,
                type: tenant.tenantType || 'N/A',
                school: tenant.school || 'N/A',
                position: tenant.position || 'N/A',
                contact: tenant.mobile || 'N/A',
                email: tenant.email || 'N/A',
                checkinDate: new Date(tenant.arrivalDate).toLocaleDateString()
            });
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        const today = new Date().toISOString().split('T')[0];
        const fileName = `tenant_report_${today}.xlsx`;

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

    const generateUtilityBillReport = async (): Promise<void> => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Utility Bills');

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

        data.bills.forEach(bill => {
            const tenant = data.tenants.find(t => t.id === bill.tenantId);
            const room = data.rooms.find(r => r.id === bill.roomId);

            const amounts: Record<string, number> = {};
            bill.items.forEach(item => {
                amounts[item.utilityType] = item.amount;
            });

            worksheet.addRow({
                tenant: tenant ? `${tenant.name} ${tenant.surname}` : 'Unknown',
                room: room ? room.roomNumber : 'Unknown',
                period: `${new Date(bill.billingPeriodStartDate).toLocaleDateString()} - ${new Date(bill.billingPeriodEndDate).toLocaleDateString()}`,
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

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        ['rent', 'electricity', 'water', 'heating', 'internet', 'total'].forEach(col => {
            worksheet.getColumn(col).numFmt = '$#,##0.00';
        });

        const today = new Date().toISOString().split('T')[0];
        const fileName = `utility_bill_report_${today}.xlsx`;

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

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.headerActions}>
                <h1>Housing Management Reports</h1>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={generateTenantReport}
                        className={styles.primaryButton}
                    >
                        Download Tenant Report
                    </button>
                    <button
                        onClick={generateUtilityBillReport}
                        className={styles.secondaryButton}
                    >
                        Download Utility Bill Report
                    </button>
                </div>
            </div>

            <div className={styles.reportsGrid}>
                {/* Overview Cards */}
                <div className={styles.card}>
                    <h3>Housing Overview</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.totalBuildings}</span>
                            <span className={styles.statLabel}>Total Buildings</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.totalRooms}</span>
                            <span className={styles.statLabel}>Total Rooms</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.activeTenantsCount}</span>
                            <span className={styles.statLabel}>Active Tenants</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.occupancyRate}%</span>
                            <span className={styles.statLabel}>Occupancy Rate</span>
                        </div>
                    </div>
                </div>

                {/* Billing Overview */}
                <div className={styles.card}>
                    <h3>Billing Overview</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.totalBills}</span>
                            <span className={styles.statLabel}>Total Bills</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.paidBills}</span>
                            <span className={styles.statLabel}>Paid Bills</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{stats.pendingBills}</span>
                            <span className={styles.statLabel}>Pending Bills</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>${stats.averageBillAmount}</span>
                            <span className={styles.statLabel}>Avg. Bill Amount</span>
                        </div>
                    </div>
                </div>

                {/* Tenant Distribution */}
                <div className={styles.card}>
                    <h3>Tenant Type Distribution</h3>
                    <div className={styles.tenantDistribution}>
                        {Object.entries(stats.tenantTypeDistribution).map(([type, count]) => (
                            <div key={type} className={styles.distributionItem}>
                                <span className={styles.typeLabel}>{type}</span>
                                <span className={styles.typeCount}>{count}</span>
                                <div
                                    className={styles.typeBar}
                                    style={{
                                        width: `${(count / stats.activeTenantsCount) * 100}%`
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Building Occupancy */}
                <div className={styles.card}>
                    <h3>Building Occupancy</h3>
                    <div className={styles.buildingOccupancy}>
                        {data.buildings.map(building => {
                            const buildingRooms = data.rooms.filter(r => r.buildingId === building.id);
                            const activeTenants = data.tenants.filter(t => t.status === 'ACTIVE');
                            const occupiedRooms = buildingRooms.filter(r => {
                                return activeTenants.some(t => t.roomId === r.id);
                            }).length;
                            const occupancyRate = buildingRooms.length > 0
                                ? (occupiedRooms / buildingRooms.length * 100).toFixed(1)
                                : '0.0';

                            return (
                                <div key={building.id} className={styles.buildingStat}>
                                    <span className={styles.buildingLabel}>Building {building.buildingNumber}</span>
                                    <div className={styles.occupancyBarContainer}>
                                        <div
                                            className={styles.occupancyBar}
                                            style={{ width: `${occupancyRate}%` }}
                                        />
                                        <span className={styles.occupancyLabel}>{occupancyRate}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Utility Distribution */}
                <div className={styles.card}>
                    <h3>Utility Cost Distribution</h3>
                    <div className={styles.tenantDistribution}>
                        {Object.entries(stats.utilityDistribution).map(([type, amount]) => {
                            const totalUtilityAmount = Object.values(stats.utilityDistribution).reduce((sum, val) => sum + val, 0);
                            const percentage = totalUtilityAmount > 0 ? (amount / totalUtilityAmount * 100) : 0;

                            return (
                                <div key={type} className={styles.distributionItem}>
                                    <span className={styles.typeLabel}>{type}</span>
                                    <span className={styles.typeCount}>${amount.toFixed(2)}</span>
                                    <div
                                        className={styles.typeBar}
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

export default ReportsPage;
