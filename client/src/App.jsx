// ==============================================================================
// Main Application Component (client/src/App.jsx)
// ==============================================================================
// Combines React Router and AuthContext to provide working authentication flows:
// - Student Registration & Login (validates @jklu.edu.in)
// - Organisation Login
// - Admin Login
// - Authenticated User Dashboard & Logout

import React, { useState, useEffect } from "react";
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
      ) : (
        <div className="card">
          <h3>Campus Activity Overview</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Welcome to your central campus hub. Browse updates, discover upcoming events, and participate in university polls.
          </p>
        </div>
      )}
    </div>
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

  // Fetch organisation's own posts on mount
  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch("http://localhost:5050/api/posts/my-posts", {
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
      const res = await fetch("http://localhost:5050/api/posts", {
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
      const res = await fetch(`http://localhost:5050/api/posts/${postId}`, {
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
