// ==============================================================================
// Main Application Component (client/src/App.jsx)
// ==============================================================================
// Combines React Router and AuthContext to provide working authentication flows:
// - Student Registration & Login (validates @jklu.edu.in)
// - Organisation Login
// - Admin Login
// - Authenticated User Dashboard & Logout

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ------------------------------------------------------------------------------
// Top Navigation Bar
// ------------------------------------------------------------------------------
function Navigation() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 <span>Campus Pulse</span>
      </Link>

      <ul className="navbar-links" style={{ alignItems: "center" }}>
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>

        {!isAuthenticated ? (
          <>
            <li>
              <NavLink to="/student/login">Student</NavLink>
            </li>
            <li>
              <NavLink to="/organisation/login">Organisation</NavLink>
            </li>
            <li>
              <NavLink to="/admin/login">Admin</NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className={`badge ${role === "admin" ? "badge-admin" : role === "organisation" ? "badge-org" : ""}`}>
                {role.toUpperCase()}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {user.name}
              </span>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem" }}
              >
                Log Out
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

// ------------------------------------------------------------------------------
// Home Page
// ------------------------------------------------------------------------------
function HomePage() {
  const { isAuthenticated, user, role } = useAuth();

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <span className="badge badge-success" style={{ marginBottom: "1rem" }}>
          Milestone 3: Authentication & Security Live
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Welcome to Campus Pulse
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 2rem" }}>
          The university campus platform where students discover official announcements,
          polls, and events, while student organisations publish updates.
        </p>

        {!isAuthenticated ? (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/student/login" className="btn btn-primary">
              Student Portal
            </Link>
            <Link to="/organisation/login" className="btn btn-outline">
              Organisation Login
            </Link>
            <Link to="/admin/login" className="btn btn-outline">
              Admin Portal
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: "1rem" }}>
              Logged in as <strong>{user.name}</strong> ({role})
            </p>
            <Link to="/dashboard" className="btn btn-primary">
              Go to Your Dashboard →
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "0.75rem" }}>📌 System Architecture Status</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.8 }}>
          <strong>Frontend:</strong> React 19 + Vite + React Router + AuthContext
          <br />
          <strong>Backend:</strong> Node.js / Express (Port 5050)
          <br />
          <strong>Session Security:</strong> JWT Stored in httpOnly Cookies + bcrypt password hashing
          <br />
          <strong>Database:</strong> MongoDB Atlas (Users, Organisations, Posts schemas active)
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// Student Login & Registration Page
// ------------------------------------------------------------------------------
function StudentLoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    course: "BTech",
    enrollmentYear: 2023,
    passingOutYear: 2027
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await registerStudent(formData);
      } else {
        await login("student", {
          email: formData.email,
          password: formData.password
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "520px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "0.5rem" }}>
          {isRegistering ? "Student Registration" : "Student Login"}
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          {isRegistering
            ? "Create your account using your official college email (@jklu.edu.in)."
            : "Sign in with your verified college credentials."}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>College Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. name@jklu.edu.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {isRegistering && (
            <>
              <div className="form-group">
                <label>Course / Degree</label>
                <select
                  name="course"
                  className="form-control"
                  value={formData.course}
                  onChange={handleChange}
                >
                  <option value="BTech">B.Tech</option>
                  <option value="BBA">BBA</option>
                  <option value="BDes">B.Des</option>
                  <option value="MDes">M.Des</option>
                  <option value="MBA">MBA</option>
                  <option value="MTech">M.Tech</option>
                  <option value="PhD">Ph.D</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Enrollment Year</label>
                  <input
                    type="number"
                    name="enrollmentYear"
                    className="form-control"
                    value={formData.enrollmentYear}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Passing Out Year</label>
                  <input
                    type="number"
                    name="passingOutYear"
                    className="form-control"
                    value={formData.passingOutYear}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Processing..." : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          {isRegistering ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontWeight: 600 }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontWeight: 600 }}
              >
                Register as Student
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// Organisation Login Page
// ------------------------------------------------------------------------------
function OrgLoginPage() {
  const [organisationId, setOrganisationId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login("organisation", { organisationId, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "480px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "0.5rem" }}>Organisation Portal</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Log in with your Club / Department Organisation ID and password.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Organisation ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. acm-student-chapter"
              value={organisationId}
              onChange={(e) => setOrganisationId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Organisation Login"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "var(--radius)", fontSize: "0.85rem" }}>
          <strong>💡 Seeded Demo Club:</strong>
          <br />
          ID: <code>acm-student-chapter</code>
          <br />
          Password: <code>tempPassword123</code>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// Admin Login Page
// ------------------------------------------------------------------------------
function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login("admin", { email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "480px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "0.5rem" }}>Admin Portal</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          University administration login for platform and club management.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@jklu.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Admin Login"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "var(--radius)", fontSize: "0.85rem" }}>
          <strong>💡 Seeded Demo Admin:</strong>
          <br />
          Email: <code>admin@jklu.edu.in</code>
          <br />
          Password: <code>Admin@123</code>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// Dashboard Page (Shows when logged in)
// ------------------------------------------------------------------------------
function DashboardPage() {
  const { user, role } = useAuth();

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <p>Please log in to view your dashboard.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2>Hello, {user.name}! 👋</h2>
            <p style={{ color: "var(--text-muted)" }}>Welcome to your Campus Pulse {role} dashboard.</p>
          </div>
          <span className={`badge ${role === "admin" ? "badge-admin" : role === "organisation" ? "badge-org" : "badge-success"}`}>
            {role.toUpperCase()} ACCOUNT
          </span>
        </div>

        {role === "student" && (
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "var(--radius)", marginTop: "1rem" }}>
            <h4>Student Academic Profile</h4>
            <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
              <strong>Course:</strong> {user.course} | <strong>Batch:</strong> {user.enrollmentYear} - {user.passingOutYear}
              <br />
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}

        {role === "organisation" && (
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "var(--radius)", marginTop: "1rem" }}>
            <h4>Organisation Profile</h4>
            <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
              <strong>ID:</strong> {user.organisationId} | <strong>Category:</strong> {user.category}
              <br />
              <strong>Description:</strong> {user.description || "No description set yet."}
              {user.mustChangePassword && (
                <span style={{ display: "block", color: "#b45309", marginTop: "0.5rem" }}>
                  ⚠️ Notice: You are using a temporary password. Please change it when ready.
                </span>
              )}
            </p>
          </div>
        )}

        {role === "admin" && (
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "var(--radius)", marginTop: "1rem" }}>
            <h4>Administrator Privileges</h4>
            <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
              Full access to onboard organisations and moderate campus posts.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>🚀 Ready for Milestone 4 (Organisation Publishing)</h3>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Authentication and role verification are working end-to-end. In Milestone 4, organisations
          will be able to create Announcements, Polls, and Events from this dashboard!
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// App Root Component
// ------------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/student/login" element={<StudentLoginPage />} />
            <Route path="/organisation/login" element={<OrgLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
