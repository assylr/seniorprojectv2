// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CheckIn from './components/CheckIn';
import CheckOut from './components/CheckOut';
import Residents from './components/Residents';
import Reports from './components/Reports';

function App() {
  const [residents, setResidents] = useState([]);

  const handleCheckIn = (resident) => {
    setResidents([...residents, resident]);
  };

  const handleCheckOut = (name) => {
    setResidents(residents.filter((r) => r.name !== name));
  };

  return (
    <Router>
      <div className="container">
        <Header />
        <Routes>
          <Route 
            path="/" 
            element={
              <div>
                <h1>Housing Management System</h1>
                <p>Use the navigation above to check in, check out, view residents, or generate reports.</p>
              </div>
            } 
          />
          <Route path="/checkin" element={<CheckIn onCheckIn={handleCheckIn} />} />
          <Route path="/checkout" element={<CheckOut onCheckOut={handleCheckOut} />} />
          <Route path="/residents" element={<Residents residents={residents} />} />
          <Route path="/reports" element={<Reports residents={residents} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
