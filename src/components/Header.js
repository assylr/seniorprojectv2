// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav className="navbar">
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/checkin" className="nav-link">Check In</Link></li>
          <li><Link to="/checkout" className="nav-link">Check Out</Link></li>
          <li><Link to="/residents" className="nav-link">Residents</Link></li>
          <li><Link to="/reports" className="nav-link">Reports</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
