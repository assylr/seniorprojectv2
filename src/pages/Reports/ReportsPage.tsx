import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { Building, TenantDetailDTO, MaintenanceRequest, MaintenanceStatus, RoomDetailDTO } from '@/types';
import { 
    getBuildings, 
    getTenantDetails, 
    getMaintenanceRequests,
    getRoomDetails
} from '@/services/api';
import { LoadingSpinner } from '@/components/common';
import styles from './ReportsPage.module.css';

interface Statistics {
    totalBuildings: number;
    totalRooms: number;
    activeTenantsCount: number;
    occupancyRate: string;
    tenantTypeDistribution: Record<string, number>;
    averageRoomsPerBuilding: string;
    maintenanceStats: {
        totalRequests: number;
        openRequests: number;
        completedRequests: number;
        averageCompletionTime: string;
    };
    buildingStats: {
        id: number;
        name: string;
        totalRooms: number;
        occupiedRooms: number;
        occupancyRate: string;
        maintenanceRequests: number;
    }[];
}

interface ReportData {
    buildings: Building[];
    rooms: RoomDetailDTO[];
    tenants: TenantDetailDTO[];
    maintenanceRequests: MaintenanceRequest[];
}

const ReportsPage: React.FC = () => {
    const [data, setData] = useState<ReportData>({
        buildings: [],
        rooms: [],
        tenants: [],
        maintenanceRequests: []
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'buildings' | 'tenants' | 'maintenance'>('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            const [buildings, rooms, tenants, maintenanceRequests] = await Promise.all([
                getBuildings(),
                getRoomDetails(params),
                getTenantDetails(params),
                getMaintenanceRequests()
            ]);
            
            setData({ buildings, rooms, tenants, maintenanceRequests });
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
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

        // Calculate maintenance statistics
        const completedRequests = data.maintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED);
        const openRequests = data.maintenanceRequests.filter(r => 
            r.status !== MaintenanceStatus.COMPLETED && r.status !== MaintenanceStatus.CANCELLED
        );
        
        const totalCompletionTime = completedRequests.reduce((total, request) => {
            if (request.completedDate && request.submittedDate) {
                const submitted = new Date(request.submittedDate);
                const completed = new Date(request.completedDate);
                return total + (completed.getTime() - submitted.getTime());
            }
            return total;
        }, 0);
        
        const averageCompletionTime = completedRequests.length > 0
            ? (totalCompletionTime / completedRequests.length / (1000 * 60 * 60 * 24)).toFixed(1)
            : '0';

        // Calculate building-specific statistics
        const buildingStats = data.buildings.map(building => {
            const buildingRooms = data.rooms.filter(r => r.buildingId === building.id);
            const occupiedBuildingRooms = buildingRooms.filter(r => 
                activeTenants.some(t => t.roomId === r.id)
            );
            const buildingMaintenanceRequests = data.maintenanceRequests.filter(r => 
                r.roomId && buildingRooms.some(br => br.id === r.roomId)
            );

            return {
                id: building.id,
                name: `Building ${building.buildingNumber}`,
                totalRooms: buildingRooms.length,
                occupiedRooms: occupiedBuildingRooms.length,
                occupancyRate: buildingRooms.length > 0
                    ? ((occupiedBuildingRooms.length / buildingRooms.length) * 100).toFixed(1)
                    : '0.0',
                maintenanceRequests: buildingMaintenanceRequests.length
            };
        });

        return {
            totalBuildings: data.buildings.length,
            totalRooms,
            activeTenantsCount: activeTenants.length,
            occupancyRate: ((occupiedRooms / totalRooms) * 100).toFixed(1),
            tenantTypeDistribution: typeDistribution,
            averageRoomsPerBuilding: (totalRooms / (data.buildings.length || 1)).toFixed(1),
            maintenanceStats: {
                totalRequests: data.maintenanceRequests.length,
                openRequests: openRequests.length,
                completedRequests: completedRequests.length,
                averageCompletionTime
            },
            buildingStats
        };
    };

    const generateTenantReport = async (): Promise<void> => {
        const workbook = new ExcelJS.Workbook();
        
        // Create a summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Building', key: 'building', width: 20 },
            { header: 'Total Rooms', key: 'totalRooms', width: 15 },
            { header: 'Occupied Rooms', key: 'occupiedRooms', width: 15 },
            { header: 'Occupancy Rate', key: 'occupancyRate', width: 15 },
            { header: 'Total Tenants', key: 'totalTenants', width: 15 },
            { header: 'Active Tenants', key: 'activeTenants', width: 15 },
            { header: 'Maintenance Requests', key: 'maintenanceRequests', width: 20 }
        ];

        // Group tenants by building
        const tenantsByBuilding = data.tenants.reduce((acc, tenant) => {
            const building = data.buildings.find(b => b.id === tenant.buildingId);
            const buildingName = building ? `Building ${building.buildingNumber}` : 'Unknown Building';
            
            if (!acc[buildingName]) {
                acc[buildingName] = {
                    tenants: [],
                    building: building
                };
            }
            acc[buildingName].tenants.push(tenant);
            return acc;
        }, {} as Record<string, { tenants: TenantDetailDTO[], building: Building | undefined }>);

        // Add summary data for each building
        Object.entries(tenantsByBuilding).forEach(([buildingName, buildingData]) => {
            const buildingRooms = data.rooms.filter(r => r.buildingId === buildingData.building?.id);
            const occupiedRooms = buildingRooms.filter(r => r.status === 'OCCUPIED');
            const activeTenants = buildingData.tenants.filter(t => t.status === 'ACTIVE');
            const buildingMaintenanceRequests = data.maintenanceRequests.filter(r => 
                buildingRooms.some(br => br.id === r.roomId)
            );

            summarySheet.addRow({
                building: buildingName,
                totalRooms: buildingRooms.length,
                occupiedRooms: occupiedRooms.length,
                occupancyRate: `${((occupiedRooms.length / buildingRooms.length) * 100).toFixed(1)}%`,
                totalTenants: buildingData.tenants.length,
                activeTenants: activeTenants.length,
                maintenanceRequests: buildingMaintenanceRequests.length
            });
        });

        // Style the summary sheet
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Create detailed sheets for each building
        Object.entries(tenantsByBuilding).forEach(([buildingName, buildingData]) => {
            const worksheet = workbook.addWorksheet(buildingName);

            worksheet.columns = [
                { header: 'Room', key: 'room', width: 10 },
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Type', key: 'type', width: 15 },
                { header: 'School', key: 'school', width: 20 },
                { header: 'Position', key: 'position', width: 20 },
                { header: 'Contact', key: 'contact', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Check-in Date', key: 'checkinDate', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Deposit', key: 'deposit', width: 15 },
                { header: 'Visiting Guests', key: 'visitingGuests', width: 20 }
            ];

            // Sort tenants by room number
            const sortedTenants = [...buildingData.tenants].sort((a, b) => {
                const roomA = data.rooms.find(r => r.id === a.roomId);
                const roomB = data.rooms.find(r => r.id === b.roomId);
                return (roomA?.roomNumber || '').localeCompare(roomB?.roomNumber || '');
            });

            sortedTenants.forEach(tenant => {
                const room = data.rooms.find(r => r.id === tenant.roomId);
                worksheet.addRow({
                    room: room?.roomNumber || 'N/A',
                    name: `${tenant.name} ${tenant.surname}`,
                    type: tenant.tenantType || 'N/A',
                    school: tenant.school || 'N/A',
                    position: tenant.position || 'N/A',
                    contact: tenant.mobile || 'N/A',
                    email: tenant.email || 'N/A',
                    checkinDate: new Date(tenant.arrivalDate).toLocaleDateString(),
                    status: tenant.status,
                    deposit: tenant.deposit || 'N/A',
                    visitingGuests: tenant.visitingGuests || 'N/A'
                });
            });

            // Style the worksheet
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Add conditional formatting for status
            worksheet.addConditionalFormatting({
                ref: `I2:I${worksheet.rowCount}`,
                rules: [
                    {
                        type: 'cellIs',
                        operator: 'equal',
                        priority: 1,
                        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFE6' } } },
                        formulae: ['"ACTIVE"']
                    },
                    {
                        type: 'cellIs',
                        operator: 'equal',
                        priority: 2,
                        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE6E6' } } },
                        formulae: ['"INACTIVE"']
                    }
                ]
            });
        });

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

    const stats = calculateStatistics();

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
                <p>Loading reports...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <div className={styles.error}>{error}</div>
            <button 
                className={styles.retryButton}
                onClick={fetchData}
            >
                Retry
            </button>
        </div>
    );

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
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'buildings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('buildings')}
                >
                    Buildings
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'tenants' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tenants')}
                >
                    Tenants
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'maintenance' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('maintenance')}
                >
                    Maintenance
                </button>
            </div>

            {activeTab === 'overview' && (
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

                    {/* Maintenance Overview */}
                    <div className={styles.card}>
                        <h3>Maintenance Overview</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.maintenanceStats.totalRequests}</span>
                                <span className={styles.statLabel}>Total Requests</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.maintenanceStats.openRequests}</span>
                                <span className={styles.statLabel}>Open Requests</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.maintenanceStats.completedRequests}</span>
                                <span className={styles.statLabel}>Completed</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.maintenanceStats.averageCompletionTime} days</span>
                                <span className={styles.statLabel}>Avg. Completion Time</span>
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
                </div>
            )}

            {activeTab === 'buildings' && (
                <div className={styles.reportsGrid}>
                    {stats.buildingStats.map(building => (
                        <div key={building.id} className={styles.card}>
                            <h3>{building.name}</h3>
                            <div className={styles.buildingStats}>
                                <div className={styles.buildingStat}>
                                    <span className={styles.buildingLabel}>Total Rooms</span>
                                    <span className={styles.buildingValue}>{building.totalRooms}</span>
                                </div>
                                <div className={styles.buildingStat}>
                                    <span className={styles.buildingLabel}>Occupied Rooms</span>
                                    <span className={styles.buildingValue}>{building.occupiedRooms}</span>
                                </div>
                                <div className={styles.buildingStat}>
                                    <span className={styles.buildingLabel}>Occupancy Rate</span>
                                    <div className={styles.occupancyBarContainer}>
                                        <div
                                            className={styles.occupancyBar}
                                            style={{ width: `${building.occupancyRate}%` }}
                                        />
                                        <span className={styles.occupancyLabel}>{building.occupancyRate}%</span>
                                    </div>
                                </div>
                                <div className={styles.buildingStat}>
                                    <span className={styles.buildingLabel}>Maintenance Requests</span>
                                    <span className={styles.buildingValue}>{building.maintenanceRequests}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'tenants' && (
                <div className={styles.reportsGrid}>
                    <div className={styles.card}>
                        <h3>Tenant Statistics</h3>
                        <div className={styles.tenantStats}>
                            <div className={styles.tenantStat}>
                                <span className={styles.tenantLabel}>Total Tenants</span>
                                <span className={styles.tenantValue}>{data.tenants.length}</span>
                            </div>
                            <div className={styles.tenantStat}>
                                <span className={styles.tenantLabel}>Active Tenants</span>
                                <span className={styles.tenantValue}>{stats.activeTenantsCount}</span>
                            </div>
                            <div className={styles.tenantStat}>
                                <span className={styles.tenantLabel}>Average Tenants per Building</span>
                                <span className={styles.tenantValue}>
                                    {(stats.activeTenantsCount / stats.totalBuildings).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

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
                </div>
            )}

            {activeTab === 'maintenance' && (
                <div className={styles.reportsGrid}>
                    <div className={styles.card}>
                        <h3>Maintenance Overview</h3>
                        <div className={styles.maintenanceStats}>
                            <div className={styles.maintenanceStat}>
                                <span className={styles.maintenanceLabel}>Total Requests</span>
                                <span className={styles.maintenanceValue}>{stats.maintenanceStats.totalRequests}</span>
                            </div>
                            <div className={styles.maintenanceStat}>
                                <span className={styles.maintenanceLabel}>Open Requests</span>
                                <span className={styles.maintenanceValue}>{stats.maintenanceStats.openRequests}</span>
                            </div>
                            <div className={styles.maintenanceStat}>
                                <span className={styles.maintenanceLabel}>Completed Requests</span>
                                <span className={styles.maintenanceValue}>{stats.maintenanceStats.completedRequests}</span>
                            </div>
                            <div className={styles.maintenanceStat}>
                                <span className={styles.maintenanceLabel}>Average Completion Time</span>
                                <span className={styles.maintenanceValue}>{stats.maintenanceStats.averageCompletionTime} days</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3>Maintenance by Building</h3>
                        <div className={styles.maintenanceByBuilding}>
                            {stats.buildingStats.map(building => (
                                <div key={building.id} className={styles.buildingMaintenance}>
                                    <span className={styles.buildingName}>{building.name}</span>
                                    <div className={styles.maintenanceBarContainer}>
                                        <div
                                            className={styles.maintenanceBar}
                                            style={{
                                                width: `${(building.maintenanceRequests / stats.maintenanceStats.totalRequests) * 100}%`
                                            }}
                                        />
                                        <span className={styles.maintenanceCount}>{building.maintenanceRequests}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
