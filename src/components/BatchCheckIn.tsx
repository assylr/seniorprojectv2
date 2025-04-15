import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Building, Room, BatchTenantData } from '../services/types';
import { batchCheckInTenants } from '../services/api';

interface BatchCheckInProps {
  buildings: Building[];
  rooms: Room[];
  onComplete: () => void;
  onCancel: () => void;
}

const BatchCheckIn = ({ buildings, rooms, onComplete, onCancel }: BatchCheckInProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tenants, setTenants] = useState<BatchTenantData[]>([]);
  const [currentTenant, setCurrentTenant] = useState<BatchTenantData>({
    name: '',
    surname: '',
    school: '',
    position: '',
    tenant_type: '' as 'renter' | 'faculty',
    mobile: '',
    email: '',
    room_id: null,
    building_id: undefined
  });
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update available rooms when building is selected
  useEffect(() => {
    if (selectedBuilding) {
      const buildingId = parseInt(selectedBuilding);
      const filteredRooms = rooms.filter(room => 
        room.building.id === buildingId && room.available
      );
      setAvailableRooms(filteredRooms);
      setCurrentTenant(prev => ({ ...prev, building_id: buildingId, room_id: null }));
    } else {
      setAvailableRooms([]);
      setCurrentTenant(prev => ({ ...prev, building_id: undefined, room_id: null }));
    }
  }, [selectedBuilding, rooms]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'building_id') {
      setSelectedBuilding(value);
    } else if (name === 'room_id') {
      setCurrentTenant(prev => ({ 
        ...prev, 
        [name]: value ? parseInt(value) : null 
      }));
    } else {
      setCurrentTenant(prev => ({ ...prev, [name]: value }));
    }
  };

  const addTenant = () => {
    // Basic validation
    if (!currentTenant.name || !currentTenant.surname || !currentTenant.tenant_type) {
      setError('Name, surname, and tenant type are required');
      return;
    }

    // Add tenant to the list
    setTenants([...tenants, { ...currentTenant }]);
    
    // Reset form for next tenant
    setCurrentTenant({
      name: '',
      surname: '',
      school: '',
      position: '',
      tenant_type: '' as 'renter' | 'faculty',
      mobile: '',
      email: '',
      room_id: null,
      building_id: currentTenant.building_id // Keep the same building selected
    });
    
    setError(null);
  };

  const removeTenant = (index: number) => {
    setTenants(tenants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Move to room assignment step
      setStep(2);
    } else if (step === 2) {
      // Validate that all tenants have rooms assigned
      const unassignedTenants = tenants.filter(t => !t.room_id);
      if (unassignedTenants.length > 0) {
        setError(`${unassignedTenants.length} tenant(s) don't have rooms assigned`);
        return;
      }
      
      // Move to confirmation step
      setStep(3);
    } else if (step === 3) {
      // Process batch check-in
      setIsProcessing(true);
      setError(null);
      
      try {
        const results = await batchCheckInTenants(tenants);
        setTenants(results);
        
        // Check if all were successful
        const hasErrors = results.some(t => t.status === 'error');
        if (!hasErrors) {
          // All successful, complete the process
          onComplete();
        }
        // If there are errors, stay on the results page to show them
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process batch check-in');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(prev => (prev === 3 ? 2 : 1) as 1 | 2 | 3);
    } else {
      onCancel();
    }
  };

  // Render different steps
  const renderStep1 = () => (
    <>
      <h2>Step 1: Add Tenants</h2>
      <p className="step-description">
        Add multiple tenants to check in. You'll assign rooms in the next step.
      </p>
      
      <div className="tenant-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={currentTenant.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="surname">Surname *</label>
            <input
              id="surname"
              name="surname"
              type="text"
              value={currentTenant.surname}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tenant_type">Type *</label>
            <select
              id="tenant_type"
              name="tenant_type"
              value={currentTenant.tenant_type}
              onChange={handleInputChange}
            >
              <option value="">Select Type</option>
              <option value="renter">Renter</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="school">School</label>
            <input
              id="school"
              name="school"
              type="text"
              value={currentTenant.school}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              id="position"
              name="position"
              type="text"
              value={currentTenant.position}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="mobile">Mobile</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={currentTenant.mobile}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={currentTenant.email}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="secondary" 
            onClick={addTenant}
          >
            Add to Batch
          </button>
        </div>
      </div>
      
      {tenants.length > 0 && (
        <div className="batch-list">
          <h3>Tenants in Batch ({tenants.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => (
                <tr key={index}>
                  <td>{tenant.name} {tenant.surname}</td>
                  <td>{tenant.tenant_type}</td>
                  <td>{tenant.email || '-'}</td>
                  <td>
                    <button 
                      className="danger small" 
                      onClick={() => removeTenant(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      <h2>Step 2: Assign Rooms</h2>
      <p className="step-description">
        Assign rooms to each tenant. All tenants must have a room assigned.
      </p>
      
      <div className="form-group">
        <label htmlFor="building_id">Filter by Building</label>
        <select
          id="building_id"
          name="building_id"
          value={selectedBuilding}
          onChange={handleInputChange}
        >
          <option value="">All Buildings</option>
          {buildings.map(building => (
            <option key={building.id} value={building.id}>
              Building {building.buildingNumber}
            </option>
          ))}
        </select>
      </div>
      
      <div className="batch-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Room Assignment</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr key={index}>
                <td>{tenant.name} {tenant.surname}</td>
                <td>{tenant.tenant_type}</td>
                <td>
                  <select
                    value={tenant.room_id || ''}
                    onChange={(e) => {
                      const updatedTenants = [...tenants];
                      updatedTenants[index] = {
                        ...tenant,
                        room_id: e.target.value ? parseInt(e.target.value) : null
                      };
                      setTenants(updatedTenants);
                    }}
                    className={!tenant.room_id ? 'required' : ''}
                  >
                    <option value="">Select Room</option>
                    {rooms
                      .filter(room => room.available)
                      .filter(room => !selectedBuilding || room.building.id === parseInt(selectedBuilding))
                      .map(room => (
                        <option key={room.id} value={room.id}>
                          {room.building.buildingNumber} - {room.roomNumber}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <h2>Step 3: Confirmation</h2>
      <p className="step-description">
        Review the information below and confirm to complete the batch check-in.
      </p>
      
      <div className="batch-summary">
        <p><strong>Total Tenants:</strong> {tenants.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Room</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => {
              const room = rooms.find(r => r.id === tenant.room_id);
              return (
                <tr key={index} className={tenant.status === 'error' ? 'error-row' : ''}>
                  <td>{tenant.name} {tenant.surname}</td>
                  <td>{tenant.tenant_type}</td>
                  <td>
                    {room ? `${room.building.buildingNumber} - ${room.roomNumber}` : 'Not assigned'}
                  </td>
                  <td>
                    {tenant.status === 'error' ? (
                      <span className="error-message">{tenant.error_message}</span>
                    ) : tenant.status === 'success' ? (
                      <span className="success-message">Success</span>
                    ) : (
                      'Pending'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="batch-check-in">
      <div className="batch-header">
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Add Tenants</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Assign Rooms</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Confirm</div>
        </div>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={goBack}
            className="secondary"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {(step === 1 && tenants.length > 0) && (
            <button type="submit" className="primary">
              Next: Assign Rooms
            </button>
          )}
          
          {step === 2 && (
            <button type="submit" className="primary">
              Next: Review & Confirm
            </button>
          )}
          
          {step === 3 && (
            <button 
              type="submit" 
              className="primary"
              disabled={isProcessing || tenants.some(t => t.status === 'error')}
            >
              {isProcessing ? 'Processing...' : 'Complete Check-In'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BatchCheckIn;
