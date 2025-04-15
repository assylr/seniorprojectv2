import { useState } from 'react';
import { Tenant, BatchCheckOutData } from '../services/types';
import { batchCheckOutTenants } from '../services/api';

interface BatchCheckOutProps {
  tenants: Tenant[];
  onComplete: () => void;
  onCancel: () => void;
}

const BatchCheckOut = ({ tenants, onComplete, onCancel }: BatchCheckOutProps) => {
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [results, setResults] = useState<BatchCheckOutData[]>([]);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Only show active tenants
  const activeTenants = tenants.filter(tenant => !tenant.departure_date);

  const handleTenantSelection = (tenantId: number) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    } else {
      setSelectedTenants([...selectedTenants, tenantId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTenants.length === activeTenants.length) {
      // If all are selected, deselect all
      setSelectedTenants([]);
    } else {
      // Otherwise, select all
      setSelectedTenants(activeTenants.map(tenant => tenant.id));
    }
  };

  const handleSubmit = async () => {
    if (!isConfirmStep) {
      // Move to confirmation step
      setIsConfirmStep(true);
      return;
    }
    
    // Process batch check-out
    setIsProcessing(true);
    setError(null);
    
    try {
      const checkOutResults = await batchCheckOutTenants(selectedTenants);
      setResults(checkOutResults);
      
      // Check if all were successful
      const hasErrors = checkOutResults.some(r => r.status === 'error');
      if (!hasErrors) {
        setIsComplete(true);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process batch check-out');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const goBack = () => {
    if (isComplete) {
      onComplete();
    } else if (isConfirmStep) {
      setIsConfirmStep(false);
    } else {
      onCancel();
    }
  };

  // Render tenant selection step
  const renderSelectionStep = () => (
    <>
      <h2>Select Tenants to Check Out</h2>
      <p className="step-description">
        Select the tenants you want to check out in a batch operation.
      </p>
      
      {activeTenants.length === 0 ? (
        <div className="no-tenants">
          <p>No active tenants available for check-out.</p>
        </div>
      ) : (
        <>
          <div className="select-all">
            <label>
              <input
                type="checkbox"
                checked={selectedTenants.length === activeTenants.length}
                onChange={handleSelectAll}
              />
              {selectedTenants.length === activeTenants.length ? 'Deselect All' : 'Select All'}
            </label>
            <span className="selection-count">
              {selectedTenants.length} of {activeTenants.length} selected
            </span>
          </div>
          
          <div className="tenant-selection-list">
            {activeTenants.map(tenant => (
              <div key={tenant.id} className="tenant-selection-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTenants.includes(tenant.id)}
                    onChange={() => handleTenantSelection(tenant.id)}
                  />
                  <div className="tenant-info">
                    <span className="tenant-name">{tenant.name} {tenant.surname}</span>
                    <span className="tenant-details">
                      {tenant.room.building.buildingNumber} - {tenant.room.roomNumber} | {tenant.tenant_type}
                    </span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  // Render confirmation step
  const renderConfirmStep = () => (
    <>
      <h2>Confirm Batch Check-Out</h2>
      <p className="step-description">
        You are about to check out {selectedTenants.length} tenant(s). This will mark them as departed and make their rooms available.
      </p>
      
      <div className="confirmation-list">
        <h3>Tenants to Check Out:</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Type</th>
              <th>Arrival Date</th>
            </tr>
          </thead>
          <tbody>
            {activeTenants
              .filter(tenant => selectedTenants.includes(tenant.id))
              .map(tenant => (
                <tr key={tenant.id}>
                  <td>{tenant.name} {tenant.surname}</td>
                  <td>{tenant.room.building.buildingNumber} - {tenant.room.roomNumber}</td>
                  <td>{tenant.tenant_type}</td>
                  <td>{new Date(tenant.arrival_date).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // Render results step
  const renderResultsStep = () => (
    <>
      <h2>Batch Check-Out Results</h2>
      <p className="step-description">
        {isComplete 
          ? 'All tenants have been successfully checked out.' 
          : 'The batch check-out has been processed with the following results:'}
      </p>
      
      <div className="results-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map(result => {
              const tenant = tenants.find(t => t.id === result.tenant_id);
              return tenant ? (
                <tr key={tenant.id} className={result.status === 'error' ? 'error-row' : ''}>
                  <td>{tenant.name} {tenant.surname}</td>
                  <td>{tenant.room.building.buildingNumber} - {tenant.room.roomNumber}</td>
                  <td>
                    {result.status === 'error' ? (
                      <span className="error-message">{result.error_message}</span>
                    ) : (
                      <span className="success-message">Success</span>
                    )}
                  </td>
                </tr>
              ) : null;
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="batch-check-out">
      {error && <div className="alert alert-error">{error}</div>}
      
      {results.length > 0 ? (
        renderResultsStep()
      ) : isConfirmStep ? (
        renderConfirmStep()
      ) : (
        renderSelectionStep()
      )}
      
      <div className="form-actions">
        <button 
          type="button" 
          onClick={goBack}
          className="secondary"
        >
          {isComplete ? 'Done' : isConfirmStep ? 'Back' : 'Cancel'}
        </button>
        
        {!isComplete && (
          <button 
            type="button" 
            onClick={handleSubmit}
            className="primary"
            disabled={
              isProcessing || 
              selectedTenants.length === 0 || 
              (results.length > 0 && !results.some(r => r.status === 'error'))
            }
          >
            {isProcessing 
              ? 'Processing...' 
              : isConfirmStep 
                ? 'Confirm Check-Out' 
                : 'Next: Confirm'}
          </button>
        )}
        
        {isComplete && (
          <button 
            type="button" 
            onClick={handleComplete}
            className="primary"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchCheckOut;
