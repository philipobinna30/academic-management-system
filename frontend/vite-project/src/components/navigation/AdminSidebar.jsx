import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Admin Sidebar Navigation
 * Reusable inside AdminLayout
 */

const AdminSidebar = () => {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#60a5fa" : "#fff",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: "6px",
    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
    fontWeight: isActive ? "bold" : "normal",
  });

  return (
    <aside
      style={{
        width: "240px",
        background: "#111",
        color: "#fff",
        padding: "20px",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* ================= TITLE ================= */}
      <h2 style={{ marginBottom: "20px" }}>
        Admin Panel
      </h2>

      {/* ================= NAVIGATION ================= */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <NavLink to="/admin" end style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/students" style={linkStyle}>
          Students
        </NavLink>

        <NavLink to="/admin/teachers" style={linkStyle}>
          Teachers
        </NavLink>

        <NavLink to="/admin/parents" style={linkStyle}>
          Parents
        </NavLink>

        <NavLink to="/admin/courses" style={linkStyle}>
          Courses
        </NavLink>

        <NavLink to="/admin/subjects" style={linkStyle}>
          Subjects
        </NavLink>

        <NavLink to="/admin/scores" style={linkStyle}>
          Scores
        </NavLink>

        <NavLink to="/admin/scores/bulk" style={linkStyle}>
          Bulk Scores
        </NavLink>

        <NavLink to="/admin/results" style={linkStyle}>
          Results
        </NavLink>

        <NavLink to="/admin/terms" style={linkStyle}>
          Terms
        </NavLink>

        <NavLink to="/admin/sessions" style={linkStyle}>
          Sessions
        </NavLink>

        <NavLink to="/admin/online-classes" style={linkStyle}>
          Online Classes
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;