import { useEffect, useState } from 'react'
import { getBuildings } from '../services/buildings'
import { getRooms } from '../services/rooms'
import { checkInTenant, checkOutTenant, getTenants } from '../services/tenants'
import { Building, Room } from '../types'
import { NewTenant, Tenant } from '../types/tenants'

const defaultTenant: NewTenant = {
  name: '',
  surname: '',
  school: '',
  position: '',
  tenant_type: '',
  mobile: '',
  email: '',
  arrival_date: '',
  building_id: '',
  room_id: '',
}

const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [newTenant, setNewTenant] = useState<NewTenant>({ ...defaultTenant })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [filter, setFilter] = useState({ status: '', type: '', building: '' })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (newTenant.building_id) {
      const filtered = rooms.filter(
        (r) => r.building_id === newTenant.building_id && r.available
      )
      setAvailableRooms(filtered)

      if (!filtered.find((r) => r.room_id === newTenant.room_id)) {
        setNewTenant((prev) => ({ ...prev, room_id: '' }))
      }
    } else {
      setAvailableRooms([])
      setNewTenant((prev) => ({ ...prev, room_id: '' }))
    }
  }, [newTenant.building_id, rooms])

  const fetchInitialData = async () => {
    try {
      const [tenantsData, roomsData, buildingsData] = await Promise.all([
        getTenants(),
        getRooms(),
        getBuildings(),
      ])
      setTenants(tenantsData)
      setRooms(roomsData)
      setBuildings(buildingsData)
    } catch {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const required = ['name', 'surname', 'tenant_type', 'building_id', 'room_id']
      const missing = required.filter((k) => !newTenant[k as keyof NewTenant])
      if (missing.length) throw new Error(`Missing: ${missing.join(', ')}`)

      if (isNaN(new Date(newTenant.arrival_date).getTime())) {
        throw new Error('Invalid arrival date')
      }

      await checkInTenant(newTenant)
      setShowCheckInForm(false)
      setNewTenant({ ...defaultTenant })
      fetchInitialData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckOut = async (id: string) => {
    if (!confirm('Check out this tenant?')) return
    setIsSubmitting(true)
    try {
      await checkOutTenant(id)
      fetchInitialData()
    } catch {
      setError('Failed to check out tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBuildingNumber = (id: string) =>
    buildings.find((b) => b.building_id === id)?.building_number ?? id

  const filteredTenants = tenants.filter((t) => {
    const out = !!t.departure_date
    return (
      (!filter.status ||
        (filter.status === 'active' && !out) ||
        (filter.status === 'checked-out' && out)) &&
      (!filter.type || t.tenant_type === filter.type) &&
      (!filter.building || t.building_id === filter.building)
    )
  })

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">Error: {error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowCheckInForm(!showCheckInForm)}
        >
          {showCheckInForm ? 'Cancel' : 'New Check-In'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="px-3 py-2 border rounded min-w-[150px]"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="checked-out">Checked Out</option>
        </select>

        <select
          className="px-3 py-2 border rounded min-w-[150px]"
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="renter">Renter</option>
          <option value="faculty">Faculty</option>
        </select>

        <select
          className="px-3 py-2 border rounded min-w-[150px]"
          value={filter.building}
          onChange={(e) => setFilter({ ...filter, building: e.target.value })}
        >
          <option value="">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.building_id} value={b.building_id}>
              Building {b.building_number}
            </option>
          ))}
        </select>
      </div>

      {/* Check-in form */}
      {showCheckInForm && (
        <form onSubmit={handleCheckIn} className="bg-white p-6 rounded shadow space-y-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Check-In Form</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {['name', 'surname', 'school', 'position', 'mobile', 'email'].map((key) => (
              <input
                key={key}
                type="text"
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                className="px-3 py-2 border rounded"
                value={newTenant[key as keyof NewTenant]}
                onChange={(e) => setNewTenant({ ...newTenant, [key]: e.target.value })}
              />
            ))}

            <select
              required
              className="px-3 py-2 border rounded"
              value={newTenant.building_id}
              onChange={(e) => setNewTenant({ ...newTenant, building_id: e.target.value })}
            >
              <option value="">Select Building</option>
              {buildings.map((b) => (
                <option key={b.building_id} value={b.building_id}>
                  Building {b.building_number}
                </option>
              ))}
            </select>

            <select
              required
              disabled={!newTenant.building_id}
              className="px-3 py-2 border rounded"
              value={newTenant.room_id}
              onChange={(e) => setNewTenant({ ...newTenant, room_id: e.target.value })}
            >
              <option value="">Select Room</option>
              {availableRooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  Room {r.room_number}
                </option>
              ))}
            </select>

            <select
              required
              className="px-3 py-2 border rounded"
              value={newTenant.tenant_type}
              onChange={(e) => setNewTenant({ ...newTenant, tenant_type: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="renter">Renter</option>
              <option value="faculty">Faculty</option>
            </select>

            <input
              type="date"
              required
              className="px-3 py-2 border rounded"
              value={newTenant.arrival_date}
              onChange={(e) => setNewTenant({ ...newTenant, arrival_date: e.target.value })}
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Check In'}
            </button>
            <button
              type="button"
              onClick={() => setShowCheckInForm(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tenants List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTenants.map((t) => (
          <div key={t.tenant_id} className="bg-white p-4 rounded shadow space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t.name} {t.surname}</h3>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  t.departure_date ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}
              >
                {t.departure_date ? 'Checked Out' : 'Active'}
              </span>
            </div>
            <p><strong>Type:</strong> {t.tenant_type}</p>
            <p><strong>Position:</strong> {t.position || 'N/A'}</p>
            <p><strong>School:</strong> {t.school || 'N/A'}</p>
            <p><strong>Building:</strong> {getBuildingNumber(t.building_id)}</p>
            <p><strong>Room:</strong> {t.room_id || 'N/A'}</p>
            <p><strong>Contact:</strong> {t.mobile} | {t.email}</p>
            <p><strong>Arrival:</strong> {new Date(t.arrival_date).toLocaleDateString()}</p>
            {t.departure_date && (
              <p><strong>Departure:</strong> {new Date(t.departure_date).toLocaleDateString()}</p>
            )}
            {!t.departure_date && (
              <button
                onClick={() => handleCheckOut(t.tenant_id)}
                className="mt-2 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Check Out
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TenantsPage
