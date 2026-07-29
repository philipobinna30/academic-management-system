import React from "react";

import {
  useAuth,
} from "../context/AuthContext";

import {
  Outlet,
  NavLink,
} from "react-router-dom";

// ======================================================
// SIDEBAR CONFIG
// ======================================================
const sidebarLinks = [

  {
    label: "Dashboard",
    to: "/admin",
  },

  {
    label: "Students",
    to: "/admin/students",
  },

  {
    label: "Teachers",
    to: "/admin/teachers",
  },

  {
    label: "Parents",
    to: "/admin/parents",
  },

  {
    label: "Courses",
    to: "/admin/courses",
  },

  {
    label: "Subjects",
    to: "/admin/subjects",
  },

  {
    label: "Scores",
    to: "/admin/scores",
  },

  {
    label: "Bulk Scores",
    to: "/admin/scores/bulk",
  },

  {
    label: "Results",
    to: "/admin/results",
  },

  {
    label: "Terms",
    to: "/admin/terms",
  },

  {
    label: "Sessions",
    to: "/admin/sessions",
  },

  {
    label: "Online Classes",
    to: "/admin/online-classes",
  },
];

// ======================================================
// ADMIN LAYOUT
// ======================================================
const AdminLayout = () => {

  const {
    user,
    logout,
  } = useAuth();

  // ======================================================
  // LOGOUT
  // ======================================================
  const handleLogout = () => {

    logout();
  };

  return (

    <div style={styles.wrapper}>

      {/* ================= SIDEBAR ================= */}
      <aside style={styles.sidebar}>

        <h2 style={styles.title}>
          Admin Panel
        </h2>

        <nav style={styles.nav}>

          {sidebarLinks.map((link) => (

            <NavLink
              key={link.to}
              to={link.to}
              style={navLinkStyle}
              end={link.to === "/admin"}
            >
              {link.label}
            </NavLink>

          ))}

          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>

        </nav>

      </aside>

      {/* ================= MAIN AREA ================= */}
      <div style={styles.mainArea}>

        {/* HEADER */}
        <header style={styles.header}>

          <span>
            Welcome, {user?.role || "Admin"}
          </span>

        </header>

        {/* PAGE CONTENT */}
        <main style={styles.content}>

          <Outlet />

        </main>

      </div>

    </div>
  );
};

// ======================================================
// STYLES
// ======================================================
const styles = {

  wrapper: {
    display: "flex",
    minHeight: "100vh",
  },

  sidebar: {
    width: "240px",
    background: "#111",
    color: "#fff",
    padding: "20px",
  },

  title: {
    marginBottom: "20px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "12px 20px",
    borderBottom: "1px solid #ddd",
  },

  content: {
    padding: "20px",
  },

  logoutBtn: {
    marginTop: "20px",
    padding: "10px",
    cursor: "pointer",
    background: "#ef4444",
    color: "#fff",
    border: "none",
  },
};

// ======================================================
// ACTIVE NAV STYLE
// ======================================================
const navLinkStyle = ({
  isActive,
}) => ({

  color:
    isActive
      ? "#60a5fa"
      : "#fff",

  textDecoration: "none",

  fontWeight:
    isActive
      ? "bold"
      : "normal",
});

export default AdminLayout;