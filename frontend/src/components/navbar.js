// src/components/navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css"; // We'll define this next

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/map">
          🧳 Badger Passport
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/map">Map</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/checkins">My Check-Ins</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/checklist">Checklist</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/badges">Badges</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
