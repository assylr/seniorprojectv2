// src/components/Residents.js
import React from 'react';

function Residents({ residents }) {
  return (
    <div className="content">
      <h2>Current Residents</h2>
      {residents.length === 0 ? (
        <p>No residents currently checked in.</p>
      ) : (
        <table className="residents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Apartment/Dorm</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r, index) => (
              <tr key={index}>
                <td>{r.name}</td>
                <td>{r.apartment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Residents;
