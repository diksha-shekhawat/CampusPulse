// ==============================================================================
// Authentication Context (client/src/context/AuthContext.jsx)
// ==============================================================================
// Manages the global authentication state for Campus Pulse per the V1 Blueprint.
// - Stores current user profile, role ('student', 'organisation', 'admin'), and loading state.
// - Checks /api/auth/me on mount to automatically restore the session from the httpOnly cookie.
// - Provides login, student register, and logout functions to all components.

import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthSession = async () => {
    try {
      // Include credentials: 'include' so httpOnly cookies are sent with the request
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include"
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data);
        setRole(data.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch {
      console.warn("Could not reach backend or session expired.");
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if a user session already exists on page load/refresh
  useEffect(() => {
    checkAuthSession();
  }, []);

  /**
   * Log in a user based on their role.
   * @param {string} targetRole - 'student', 'organisation', or 'admin'
   * @param {Object} credentials - Form input values
   */
  const login = async (targetRole, credentials) => {
    let endpoint = "";
    if (targetRole === "student") endpoint = `${API_BASE_URL}/api/auth/student/login`;
    else if (targetRole === "organisation") endpoint = `${API_BASE_URL}/api/auth/organisation/login`;
    else if (targetRole === "admin") endpoint = `${API_BASE_URL}/api/auth/admin/login`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    setUser(data.data);
    setRole(data.role);
    return data;
  };

  /**
   * Register a new student account.
   */
  const registerStudent = async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/student/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(studentData)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Registration failed");
    }

    setUser(data.data);
    setRole(data.role);
    return data;
  };

  /**
   * Log out and clear the session cookie.
   */
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    login,
    registerStudent,
    logout,
    refreshSession: checkAuthSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for consuming auth in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
