import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token + redirects
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#60a5fa" : "#fff",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "6px",
    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
    fontWeight: isActive ? "bold" : "normal",
  });

  return (
    <aside
      style={{
        width: "240px",
        background: "#0f172a",
        color: "#fff",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* TOP SECTION */}
      <div>
        <h2 style={{ marginBottom: "25px" }}>
          Student Portal
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink to="/student" end style={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/student/profile" style={linkStyle}>
            My Profile
          </NavLink>

          <NavLink to="/student/results" style={linkStyle}>
            My Results
          </NavLink>

          <NavLink to="/student/transcript" style={linkStyle}>
            My Transcript
          </NavLink>

          <NavLink to="/student/online-classes" style={linkStyle}>
            Online Classes
          </NavLink>
        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "none",
          borderRadius: "6px",
          background: "#ef4444",
          color: "white",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </aside>
  );
};

export default StudentSidebar;