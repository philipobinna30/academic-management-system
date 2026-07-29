import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Teacher Sidebar Navigation
 * Used inside TeacherLayout
 */

const TeacherSidebar = () => {
  const { logout } = useAuth();

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#60a5fa" : "#fff",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "6px",
    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
    fontWeight: isActive ? "bold" : "normal",
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      style={{
        width: "240px",
        background: "#1f2937",
        color: "#fff",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* ================= TOP SECTION ================= */}
      <div>
        <h2 style={{ marginBottom: "25px" }}>Teacher Panel</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <NavLink to="/teacher" end style={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/teacher/students" style={linkStyle}>
            Students
          </NavLink>

          <NavLink to="/teacher/scores" style={linkStyle}>
            Scores
          </NavLink>

          <NavLink to="/teacher/bulk-scores" style={linkStyle}>
            Bulk Scores
          </NavLink>

          <NavLink to="/teacher/courses" style={linkStyle}>
            Courses
          </NavLink>

          <NavLink to="/teacher/subjects" style={linkStyle}>
            Subjects
          </NavLink>

          <NavLink to="/teacher/online-classes" style={linkStyle}>
            Online Classes
          </NavLink>
        </nav>
      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            background: "#ef4444",
            border: "none",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;