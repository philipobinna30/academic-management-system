import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Global Navbar Component
 * Works across Admin, Teacher, and Student layouts
 */

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        padding: "12px 20px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* LEFT SIDE */}
      <div>
        <h3 style={{ margin: 0 }}>
          School Management System
        </h3>
      </div>

      {/* RIGHT SIDE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* USER ROLE DISPLAY */}
        <span
          style={{
            fontSize: "14px",
            color: "#374151",
            fontWeight: "bold",
          }}
        >
          {user?.role || "Guest"}
        </span>

        {/* LOGOUT BUTTON */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "6px",
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;