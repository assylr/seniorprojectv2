// src/components/Reports.js
import React from 'react';

function Reports({ residents }) {
  const generateReport = () => {
    alert(`Total residents: ${residents.length}`);
  };

  return (
    <div className="content">
      <h2>Reports</h2>
      <button onClick={generateReport} className="btn">Generate Report</button>
      <div className="report-details">
        <h3>Resident Details:</h3>
        <ul>
          {residents.map((r, index) => (
            <li key={index}>
              {r.name} - {r.apartment}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Reports;
