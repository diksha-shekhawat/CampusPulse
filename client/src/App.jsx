// ==============================================================================
// Main Application Component (client/src/App.jsx)
// ==============================================================================
// Combines React Router and AuthContext to provide working authentication flows:
// - Student Registration & Login (validates @jklu.edu.in)
// - Organisation Login
// - Admin Login
// - Authenticated User Dashboard & Logout

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { API_BASE_URL } from "./config/api";

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
          Official University Platform
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

        {!isRegistering && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "var(--radius)", fontSize: "0.85rem" }}>
            <strong>💡 Demo Student Credentials:</strong>
            <br />
            Email: <code>student@jklu.edu.in</code>
            <br />
            Password: <code>Student@123</code>
          </div>
        )}
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
          Password: <code>Club@123</code>
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

      {role === "organisation" ? (
        <OrganisationPublishingSection />
      ) : role === "student" ? (
        <StudentFeedSection />
      ) : (
        <div className="card">
          <h3>Campus Activity Overview</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Welcome to the administrator hub. Manage organisations and moderate campus updates.
          </p>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------
// Student Feed & Campus Experience Component (Milestone 5)
// ------------------------------------------------------------------------------
// Implements the Student Experience per the V1 Technical Blueprint:
// 1. Upcoming Events Spotlight (Today & Tomorrow highlights)
// 2. Dual Feed: 'Discover' (all campus posts) & 'Following' (followed clubs)
// 3. Campus Clubs & Societies Directory with 1-click Follow/Unfollow
// 4. Live Poll Voting (Strictly 1 vote per student with instant percentage bars)
// 5. Live Event RSVP / Registration toggle
function StudentFeedSection() {
  const [activeTab, setActiveTab] = useState("discover"); // 'discover' | 'following' | 'clubs'
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [cardAlerts, setCardAlerts] = useState({});

  const setCardAlert = (id, alertObj) => {
    setCardAlerts((prev) => ({ ...prev, [id]: alertObj }));
    setTimeout(() => {
      setCardAlerts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 4000);
  };

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch(`${API_BASE_URL}/api/posts/upcoming-events`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUpcomingEvents(data.data);
      }
    } catch (err) {
      console.error("Failed to load upcoming events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFeed = async (tab) => {
    try {
      setLoadingPosts(true);
      const res = await fetch(`${API_BASE_URL}/api/posts/feed?tab=${tab}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error("Failed to load campus feed:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const res = await fetch(`${API_BASE_URL}/api/organisations`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClubs(data.data);
      }
    } catch (err) {
      console.error("Failed to load clubs:", err);
    } finally {
      setLoadingClubs(false);
    }
  };

  // Fetch upcoming spotlight events on mount
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  // Fetch feed posts whenever activeTab changes (if not 'clubs')
  useEffect(() => {
    if (activeTab === "clubs") {
      fetchClubs();
    } else {
      fetchFeed(activeTab);
    }
  }, [activeTab]);

  // 1. Cast a vote on a Poll
  const handleVote = async (postId, optionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionId })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit vote.");
      }

      setCardAlert(postId, { type: "success", message: "Vote recorded successfully!" });
      // Refresh feed to get updated vote counts and percentages
      fetchFeed(activeTab);
    } catch (err) {
      setCardAlert(postId, { type: "error", message: err.message });
    }
  };

  // 2. RSVP / Register for an Event
  const handleRegisterEvent = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/register`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration action failed.");
      }

      setCardAlert(postId, { type: "success", message: data.message });
      // Refresh both feed and spotlight events
      fetchFeed(activeTab);
      fetchUpcomingEvents();
    } catch (err) {
      setCardAlert(postId, { type: "error", message: err.message });
    }
  };

  // 3. Toggle Follow / Unfollow a Club
  const handleToggleFollow = async (orgId, isCurrentlyFollowing) => {
    try {
      const endpoint = `${API_BASE_URL}/api/organisations/${orgId}/follow`;
      const method = isCurrentlyFollowing ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        credentials: "include"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Follow action failed.");
      }

      setCardAlert(orgId, { type: "success", message: data.message });

      // If viewing clubs directory, refresh clubs
      if (activeTab === "clubs") {
        fetchClubs();
      } else {
        // Refresh feed so Following tab updates
        fetchFeed(activeTab);
      }
    } catch (err) {
      setCardAlert(orgId, { type: "error", message: err.message });
    }
  };

  // 4. Toggle Like on a Post
  const handleToggleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update like.");
      }

      // Optimistically update post in list
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount }
            : p
        )
      );
    } catch (err) {
      setCardAlert(postId, { type: "error", message: err.message });
    }
  };

  // 5. Toggle Save / Bookmark on a Post
  const handleToggleSave = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/save`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update bookmark.");
      }

      setCardAlert(postId, { type: "success", message: data.message });

      if (activeTab === "saved" && !data.isSaved) {
        // If viewing saved posts and unsaved, remove from current list
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
      } else {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId ? { ...p, isSaved: data.isSaved } : p
          )
        );
      }
    } catch (err) {
      setCardAlert(postId, { type: "error", message: err.message });
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------------------ */}
      {/* 1. Upcoming Events Spotlight (Today & Tomorrow Highlights)                */}
      {/* ------------------------------------------------------------------------ */}
      <div className="card" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ color: "#166534" }}>🎯 Upcoming Campus Events</h3>
            <p style={{ color: "#15803d", fontSize: "0.85rem" }}>
              Highlights of upcoming club events happening soon on campus.
            </p>
          </div>
          <span className="badge badge-success">LIVE SPOTLIGHT</span>
        </div>

        {loadingEvents ? (
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Checking event schedule...</p>
        ) : upcomingEvents.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#166534", padding: "0.5rem 0" }}>
            No upcoming events scheduled right now. Check back soon for new club activities!
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginTop: "0.5rem" }}>
            {upcomingEvents.map((evt) => (
              <div key={evt._id} className="event-spotlight-card">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#15803d", fontSize: "0.75rem" }}>
                      {evt.dayLabel || "UPCOMING"}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      {evt.organisationId?.name || "Campus Club"}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.35rem" }}>{evt.event?.title}</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    📍 {evt.event?.venue}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    🕒 {new Date(evt.event?.startAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                {cardAlerts[evt._id] && (
                  <div style={{
                    margin: "0.4rem 0",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "var(--radius)",
                    fontSize: "0.75rem",
                    backgroundColor: cardAlerts[evt._id].type === "success" ? "#dcfce7" : "#fee2e2",
                    color: cardAlerts[evt._id].type === "success" ? "#166534" : "#991b1b",
                    border: `1px solid ${cardAlerts[evt._id].type === "success" ? "#bbf7d0" : "#fca5a5"}`
                  }}>
                    {cardAlerts[evt._id].message}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    👥 {evt.totalRegistrations || 0} RSVPs
                  </span>
                  <button
                    onClick={() => handleRegisterEvent(evt._id)}
                    className={`btn ${evt.isRegistered ? "btn-outline" : "btn-primary"}`}
                    style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
                  >
                    {evt.isRegistered ? "Registered ✓" : "RSVP Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. Navigation Tabs: Discover, Following, Saved & Campus Clubs             */}
      {/* ------------------------------------------------------------------------ */}
      <div className="feed-tabs">
        <button
          className={`feed-tab-btn ${activeTab === "discover" ? "active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          🌐 Discover Campus
        </button>
        <button
          className={`feed-tab-btn ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >
          ⭐ Following Clubs
        </button>
        <button
          className={`feed-tab-btn ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          🔖 Saved Bookmarks
        </button>
        <button
          className={`feed-tab-btn ${activeTab === "clubs" ? "active" : ""}`}
          onClick={() => setActiveTab("clubs")}
        >
          🏛️ Clubs & Societies
        </button>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* 3. Tab Content                                                            */}
      {/* ------------------------------------------------------------------------ */}

      {/* TAB A, B & C: Feed Posts (Discover / Following / Saved) */}
      {(activeTab === "discover" || activeTab === "following" || activeTab === "saved") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {loadingPosts ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--text-muted)" }}>Loading campus updates...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <h4>
                {activeTab === "following"
                  ? "Your Following Feed is Empty"
                  : activeTab === "saved"
                  ? "No Bookmarked Posts Yet"
                  : "No Posts on Campus Yet"}
              </h4>
              <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                {activeTab === "following"
                  ? "You haven't followed any clubs yet! Visit the 'Clubs & Societies' tab to follow your favorite clubs."
                  : activeTab === "saved"
                  ? "You haven't bookmarked any posts yet. Click the bookmark icon 🔖 on any announcement, poll, or event in Discover or Following to save it here for quick access!"
                  : "Campus organisations haven't published any announcements yet. Check back soon!"}
              </p>
              {activeTab === "following" && (
                <button
                  onClick={() => setActiveTab("clubs")}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  Explore Clubs to Follow →
                </button>
              )}
              {activeTab === "saved" && (
                <button
                  onClick={() => setActiveTab("discover")}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  Browse Discover Feed →
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="card" style={{ padding: "1.5rem", marginBottom: 0 }}>
                {/* Post Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "#e0e7ff",
                        color: "var(--primary-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1.1rem"
                      }}
                    >
                      {post.organisationId?.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>
                        {post.organisationId?.name || "Campus Organisation"}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                        <span className="badge badge-org" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                          {post.organisationId?.category || "General"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          • {new Date(post.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="badge" style={{ fontSize: "0.75rem" }}>
                    {post.type === "normal" ? "📢 ANNOUNCEMENT" : post.type === "poll" ? "📊 POLL" : "📅 EVENT"}
                  </span>
                </div>

                {/* 1. Normal Announcement Content */}
                {post.type === "normal" && (
                  <div>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Announcement Poster"
                        style={{
                          width: "100%",
                          maxHeight: "380px",
                          objectFit: "cover",
                          borderRadius: "var(--radius)",
                          marginBottom: "1rem"
                        }}
                      />
                    )}
                    <p style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* 2. Interactive Campus Poll Content */}
                {post.type === "poll" && (
                  <div>
                    <h4 style={{ fontSize: "1.05rem", marginBottom: "0.75rem", color: "var(--text-main)" }}>
                      {post.poll?.question}
                    </h4>

                    {/* Card-level contextual alert */}
                    {cardAlerts[post._id] && (
                      <div style={{
                        marginBottom: "0.75rem",
                        padding: "0.5rem 0.85rem",
                        borderRadius: "var(--radius)",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        backgroundColor: cardAlerts[post._id].type === "success" ? "#dcfce7" : "#fee2e2",
                        color: cardAlerts[post._id].type === "success" ? "#166534" : "#991b1b",
                        border: `1px solid ${cardAlerts[post._id].type === "success" ? "#bbf7d0" : "#fca5a5"}`
                      }}>
                        {cardAlerts[post._id].message}
                      </div>
                    )}

                    {/* Has Student Voted? Show Results Bar; Otherwise Show Clickable Options */}
                    {post.userVotedOptionId ? (
                      <div>
                        {post.poll?.options?.map((opt) => {
                          const isVoted = post.userVotedOptionId === opt.optionId;
                          return (
                            <div
                              key={opt.optionId}
                              className={`poll-result-bar ${isVoted ? "user-choice" : ""}`}
                            >
                              <div
                                className={`poll-result-fill ${isVoted ? "user-choice-fill" : ""}`}
                                style={{ width: `${opt.percentage}%` }}
                              />
                              <div className="poll-result-content">
                                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {opt.text}
                                  {isVoted && (
                                    <span style={{ color: "var(--primary-color)", fontSize: "0.85rem", fontWeight: 700 }}>
                                      ✓ Your Vote
                                    </span>
                                  )}
                                </span>
                                <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                  {opt.votes} ({opt.percentage}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                          Total Votes: {post.totalVotes || 0} • Single vote recorded
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                          Click an option below to cast your vote:
                        </p>
                        {post.poll?.options?.map((opt) => (
                          <button
                            key={opt.optionId}
                            onClick={() => handleVote(post._id, opt.optionId)}
                            className="poll-option-vote-btn"
                          >
                            <span>{opt.text}</span>
                            <span style={{ color: "var(--primary-color)", fontSize: "0.85rem" }}>
                              Vote →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Campus Event Content */}
                {post.type === "event" && (() => {
                  const isPastEvent = post.event?.endAt && new Date(post.event.endAt) < new Date();
                  return (
                    <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <h4 style={{ fontSize: "1.1rem", color: "var(--text-main)", margin: 0 }}>
                          {post.event?.title}
                        </h4>
                        {isPastEvent && (
                          <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", border: "1px solid #fca5a5" }}>
                            EVENT ENDED
                          </span>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                            📍 LOCATION
                          </span>
                          <strong style={{ fontSize: "0.95rem" }}>{post.event?.venue}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                            🕒 START TIME
                          </span>
                          <span style={{ fontSize: "0.9rem" }}>
                            {new Date(post.event?.startAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Card-level contextual alert */}
                      {cardAlerts[post._id] && (
                        <div style={{
                          marginBottom: "0.75rem",
                          padding: "0.5rem 0.85rem",
                          borderRadius: "var(--radius)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor: cardAlerts[post._id].type === "success" ? "#dcfce7" : "#fee2e2",
                          color: cardAlerts[post._id].type === "success" ? "#166534" : "#991b1b",
                          border: `1px solid ${cardAlerts[post._id].type === "success" ? "#bbf7d0" : "#fca5a5"}`
                        }}>
                          {cardAlerts[post._id].message}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          👥 <strong>{post.totalRegistrations || 0}</strong> students registered
                        </span>

                        {isPastEvent ? (
                          <button
                            disabled
                            className="btn btn-outline"
                            style={{
                              backgroundColor: "#f1f5f9",
                              borderColor: "#cbd5e1",
                              color: "#64748b",
                              cursor: "not-allowed",
                              fontSize: "0.85rem"
                            }}
                          >
                            {post.isRegistered ? "Event Ended (Registered)" : "Event Ended"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(post._id)}
                            className={`btn ${post.isRegistered ? "btn-outline" : "btn-primary"}`}
                            style={{
                              backgroundColor: post.isRegistered ? "#f1f5f9" : undefined,
                              borderColor: post.isRegistered ? "#cbd5e1" : undefined
                            }}
                          >
                            {post.isRegistered ? "✓ Registered (Click to cancel)" : "Register for Event"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Post Interaction Bar (Likes & Bookmarks) */}
                <div className="post-interaction-bar">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleToggleLike(post._id)}
                      className={`btn-interaction ${post.isLiked ? "btn-interaction-liked" : ""}`}
                      title={post.isLiked ? "Unlike post" : "Like post"}
                    >
                      <span style={{ fontSize: "1rem" }}>{post.isLiked ? "❤️" : "🤍"}</span>
                      <span>{post.likesCount || 0} {post.likesCount === 1 ? "Like" : "Likes"}</span>
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() => handleToggleSave(post._id)}
                      className={`btn-interaction ${post.isSaved ? "btn-interaction-saved" : ""}`}
                      title={post.isSaved ? "Remove from bookmarks" : "Save post"}
                    >
                      <span style={{ fontSize: "1rem" }}>{post.isSaved ? "🔖" : "📑"}</span>
                      <span>{post.isSaved ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB C: Campus Clubs Directory */}
      {activeTab === "clubs" && (
        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h3>Campus Clubs & Student Societies</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Follow student clubs to receive their official announcements and event invitations directly in your 'Following' feed.
            </p>
          </div>

          {loadingClubs ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--text-muted)" }}>Loading campus clubs...</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {clubs.map((club) => (
                <div key={club._id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 0 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <span className="badge badge-org" style={{ fontSize: "0.75rem" }}>
                        {club.category || "Club"}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        👥 {club.followersCount || 0} followers
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.35rem" }}>{club.name}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1rem" }}>
                      {club.description || "Official university student organisation."}
                    </p>
                  </div>

                  {cardAlerts[club._id] && (
                    <div style={{
                      marginBottom: "0.5rem",
                      padding: "0.35rem 0.6rem",
                      borderRadius: "var(--radius)",
                      fontSize: "0.75rem",
                      backgroundColor: cardAlerts[club._id].type === "success" ? "#dcfce7" : "#fee2e2",
                      color: cardAlerts[club._id].type === "success" ? "#166534" : "#991b1b",
                      border: `1px solid ${cardAlerts[club._id].type === "success" ? "#bbf7d0" : "#fca5a5"}`
                    }}>
                      {cardAlerts[club._id].message}
                    </div>
                  )}

                  <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
                    <button
                      onClick={() => handleToggleFollow(club._id, club.isFollowing)}
                      className={`btn-follow ${club.isFollowing ? "btn-follow-active" : "btn-follow-inactive"}`}
                      style={{ width: "100%" }}
                    >
                      {club.isFollowing ? "Following ✓ (Click to unfollow)" : "+ Follow Club"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}


// ------------------------------------------------------------------------------
// Organisation Publishing & Post Management Component
// ------------------------------------------------------------------------------
function OrganisationPublishingSection() {
  const [activeTab, setActiveTab] = useState("normal"); // 'normal' | 'poll' | 'event'
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form states
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [eventData, setEventData] = useState({
    title: "",
    venue: "",
    startAt: "",
    endAt: ""
  });

  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch(`${API_BASE_URL}/api/posts/my-posts`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error("Failed to load organisation posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch organisation's own posts on mount
  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handlePollOptionChange = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setAlert(null);
    setSubmitting(true);

    let payload = { type: activeTab };

    if (activeTab === "normal") {
      payload.caption = caption;
      payload.imageUrl = imageUrl;
    } else if (activeTab === "poll") {
      payload.poll = {
        question: pollQuestion,
        options: pollOptions.filter((opt) => opt.trim().length > 0)
      };
    } else if (activeTab === "event") {
      payload.event = {
        title: eventData.title,
        venue: eventData.venue,
        startAt: eventData.startAt,
        endAt: eventData.endAt
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to publish post.");
      }

      setAlert({ type: "success", message: data.message });

      // Reset form fields
      setCaption("");
      setImageUrl("");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setEventData({ title: "", venue: "", startAt: "", endAt: "" });

      // Refresh posts list
      fetchMyPosts();
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete post.");
      }

      // Remove post from local state
      setPosts(posts.filter((p) => p._id !== postId));
      setAlert({ type: "success", message: "Post deleted successfully." });
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  };

  return (
    <>
      {/* 1. Content Publishing Form Card */}
      <div className="card">
        <h3 style={{ marginBottom: "0.5rem" }}>Publish New Campus Update</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
          Share an announcement, create an interactive poll, or schedule a campus event.
        </p>

        {alert && (
          <div className={`alert ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
            {alert.message}
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button
            type="button"
            className={`btn ${activeTab === "normal" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("normal")}
          >
            📝 Announcement
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "poll" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("poll")}
          >
            📊 Campus Poll
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "event" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("event")}
          >
            📅 Event Schedule
          </button>
        </div>

        <form onSubmit={handlePublish}>
          {/* TAB 1: Normal Announcement */}
          {activeTab === "normal" && (
            <>
              <div className="form-group">
                <label>Caption / Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="What would you like to announce to students?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/poster.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </>
          )}

          {/* TAB 2: Campus Poll */}
          {activeTab === "poll" && (
            <>
              <div className="form-group">
                <label>Poll Question</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Which topic would you like for the next workshop?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Options (Minimum 2, Maximum 6)</label>
                {pollOptions.map((option, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      required
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleRemovePollOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}
                    onClick={handleAddPollOption}
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB 3: Event Schedule */}
          {activeTab === "event" && (
            <>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Annual Tech Symposium 2026"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Venue / Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Auditorium / Lab 3 / Football Ground"
                  value={eventData.venue}
                  onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={eventData.startAt}
                    onChange={(e) => setEventData({ ...eventData, startAt: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={eventData.endAt}
                    onChange={(e) => setEventData({ ...eventData, endAt: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.75rem" }}
            disabled={submitting}
          >
            {submitting ? "Publishing to Campus..." : "🚀 Publish Post"}
          </button>
        </form>
      </div>

      {/* 2. Your Published Posts Section */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3>Your Published Posts</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Total: {posts.length}
          </span>
        </div>

        {loadingPosts ? (
          <p style={{ color: "var(--text-muted)" }}>Loading your published posts...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
            <p>You haven't published any posts yet.</p>
            <p style={{ fontSize: "0.85rem" }}>Use the form above to post announcements, polls, or events!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {posts.map((post) => (
              <div
                key={post._id}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius)",
                  padding: "1.25rem",
                  backgroundColor: "#ffffff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="badge">
                      {post.type === "normal" ? "📢 ANNOUNCEMENT" : post.type === "poll" ? "📊 POLL" : "📅 EVENT"}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn btn-outline"
                    style={{ color: "#ef4444", fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* Normal Post Content */}
                {post.type === "normal" && (
                  <div>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post media"
                        style={{
                          width: "100%",
                          maxHeight: "320px",
                          objectFit: "cover",
                          borderRadius: "var(--radius)",
                          marginBottom: "0.75rem"
                        }}
                      />
                    )}
                    <p style={{ fontSize: "0.95rem" }}>{post.caption}</p>
                  </div>
                )}

                {/* Poll Post Content */}
                {post.type === "poll" && (
                  <div>
                    <h4 style={{ marginBottom: "0.75rem" }}>{post.poll?.question}</h4>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {post.poll?.options?.map((opt) => (
                        <li
                          key={opt.optionId}
                          style={{
                            padding: "0.5rem 0.75rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "var(--radius)",
                            marginBottom: "0.4rem",
                            fontSize: "0.9rem"
                          }}
                        >
                          • {opt.text}
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      Votes: {post.totalVotes || 0}
                    </p>
                  </div>
                )}

                {/* Event Post Content */}
                {post.type === "event" && (
                  <div>
                    <h4 style={{ marginBottom: "0.3rem" }}>{post.event?.title}</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                      📍 <strong>Venue:</strong> {post.event?.venue}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      🕒 <strong>Time:</strong>{" "}
                      {new Date(post.event?.startAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}{" "}
                      -{" "}
                      {new Date(post.event?.endAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      Registered Students: {post.totalRegistrations || 0}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
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
