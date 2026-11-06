// ==============================================================================
// Main Application Component (App.jsx)
// ==============================================================================
// Sets up client-side routing with React Router per the V1 Blueprint.

import React from "react";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

// ------------------------------------------------------------------------------
// Top Navigation Bar
// ------------------------------------------------------------------------------
function Navigation() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 <span>Campus Pulse</span>
      </Link>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/student/login">Student</NavLink>
        </li>
        <li>
          <NavLink to="/organisation/login">Organisation</NavLink>
        </li>
        <li>
          <NavLink to="/admin/login">Admin</NavLink>
        </li>
      </ul>
    </nav>
  );
}

// ------------------------------------------------------------------------------
// Landing Page (Home)
// ------------------------------------------------------------------------------
function HomePage() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <span className="badge badge-success" style={{ marginBottom: "1rem" }}>
          Version 1 Foundation Active
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Welcome to Campus Pulse
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 2rem" }}>
          A unified campus platform where students discover campus announcements,
          polls, and events, while student organisations publish updates.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/student/login" className="btn btn-primary">
            Student Portal
          </Link>
          <Link to="/organisation/login" className="btn btn-outline">
            Organisation Login
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "0.75rem" }}>📌 System Status</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          <strong>Frontend:</strong> React 19 + Vite + React Router (Active)
          <br />
          <strong>Backend API:</strong> Express Server (Ready on Port 5000)
          <br />
          <strong>Architecture:</strong> Node.js MVC + MongoDB Atlas
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// Placeholder Auth Pages (Will be implemented in Milestone 2)
// ------------------------------------------------------------------------------
function StudentLoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "480px", margin: "2rem auto" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Student Login</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Sign in with your verified college email (@jklu.edu.in).
        </p>
        <span className="badge">Coming in Milestone 2 (Auth Flow)</span>
      </div>
    </div>
  );
}

function OrgLoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "480px", margin: "2rem auto" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Organisation Login</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Log in with your Organisation ID and password.
        </p>
        <span className="badge">Coming in Milestone 2 (Auth Flow)</span>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "480px", margin: "2rem auto" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Admin Portal</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Platform management and organization onboarding.
        </p>
        <span className="badge">Coming in Milestone 2 (Auth Flow)</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// App Root with Router
// ------------------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/organisation/login" element={<OrgLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
