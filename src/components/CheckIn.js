// src/components/CheckIn.js
import React, { useState } from 'react';

function CheckIn({ onCheckIn }) {
  const [resident, setResident] = useState({ name: '', apartment: '' });

  const handleChange = (e) => {
    setResident({ ...resident, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckIn(resident);
    setResident({ name: '', apartment: '' });
  };

  return (
    <div className="form-container">
      <h2>Check In</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Name: </label>
          <input 
            name="name" 
            value={resident.name} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Apartment/Dorm: </label>
          <input 
            name="apartment" 
            value={resident.apartment} 
            onChange={handleChange} 
            required 
            className="input-field"
          />
        </div>
        <button type="submit" className="btn">Check In</button>
      </form>
    </div>
  );
}

export default CheckIn;
