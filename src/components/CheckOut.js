// src/components/CheckOut.js
import React, { useState } from 'react';

function CheckOut({ onCheckOut }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckOut(name);
    setName('');
  };

  return (
    <div className="form-container">
      <h2>Check Out</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Name: </label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="input-field"
          />
        </div>
        <button type="submit" className="btn">Check Out</button>
      </form>
    </div>
  );
}

export default CheckOut;
