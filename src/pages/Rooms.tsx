import { useEffect, useState } from 'react'
import { getBuildings } from '../services/buildings'
import { getRooms } from '../services/rooms'
import { getTenants } from '../services/tenants'
import { Building, Room, Tenant } from '../types'

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ building: '', available: '', bedrooms: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [roomsData, tenantsData, buildingsData] = await Promise.all([
        getRooms(),
        getTenants(),
        getBuildings(),
      ])
      setRooms(roomsData)
      setTenants(tenantsData)
      setBuildings(buildingsData)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch data')
      setLoading(false)
    }
  }

  const getCurrentTenant = (roomId: string) =>
    tenants.find((t) => t.room_id === roomId && !t.departure_date)

  const getBuildingNumber = (id: string) =>
    buildings.find((b) => b.building_id === id)?.building_number ?? id

  const filteredRooms = rooms.filter((room) =>
    (!filter.building || room.building_id === filter.building) &&
    (!filter.available || room.available.toString() === filter.available) &&
    (!filter.bedrooms || room.bedroom_count.toString() === filter.bedrooms)
  )

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">Error: {error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <div className="flex flex-wrap gap-3">
          <select className="px-3 py-2 border rounded min-w-[150px]"
            value={filter.building}
            onChange={(e) => setFilter({ ...filter, building: e.target.value })}
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.building_id} value={b.building_id}>Building {b.building_number}</option>
            ))}
          </select>

          <select className="px-3 py-2 border rounded min-w-[150px]"
            value={filter.available}
            onChange={(e) => setFilter({ ...filter, available: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Occupied</option>
          </select>

          <select className="px-3 py-2 border rounded min-w-[150px]"
            value={filter.bedrooms}
            onChange={(e) => setFilter({ ...filter, bedrooms: e.target.value })}
          >
            <option value="">All Sizes</option>
            {[...new Set(rooms.map((room) => room.bedroom_count))].sort().map((count) => (
              <option key={count} value={count}>{count} Bedroom(s)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRooms.map((room) => (
          <div key={room.room_id}
            className="bg-white shadow rounded px-6 py-4 flex justify-between cursor-pointer hover:bg-gray-50 transition"
            onClick={() => setSelectedRoom(room)}
          >
            <div>Room {room.room_number}</div>
            <div>Building {getBuildingNumber(room.building_id)}</div>
            <div>{room.available ? 'Available' : 'Occupied'}</div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSelectedRoom(null)} />
          <div className="fixed z-40 bg-white rounded-lg shadow-lg max-w-md w-full p-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button className="absolute top-3 right-4 text-xl" onClick={() => setSelectedRoom(null)}>×</button>
            <h2 className="text-xl font-bold mb-4">Room {selectedRoom.room_number}</h2>
            <p><strong>Building:</strong> {getBuildingNumber(selectedRoom.building_id)}</p>
            <p><strong>Floor:</strong> {selectedRoom.floor_number}</p>
            <p><strong>Bedrooms:</strong> {selectedRoom.bedroom_count}</p>
            <p><strong>Area:</strong> {selectedRoom.total_area} m²</p>
            <p><strong>Status:</strong> {selectedRoom.available ? 'Available' : 'Occupied'}</p>
            {!selectedRoom.available && (
              <div className="mt-4">
                <h3 className="font-semibold">Current Occupant</h3>
                {(() => {
                  const tenant = getCurrentTenant(selectedRoom.room_id)
                  return tenant ? (
                    <>
                      <p><strong>Name:</strong> {tenant.name} {tenant.surname}</p>
                      <p><strong>Type:</strong> {tenant.tenant_type}</p>
                      <p><strong>Since:</strong> {new Date(tenant.arrival_date).toLocaleDateString()}</p>
                    </>
                  ) : null
                })()}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default RoomsPage
