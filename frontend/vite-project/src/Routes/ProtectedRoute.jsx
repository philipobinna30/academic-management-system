import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ======================================================
// ROLE ROUTES
// ======================================================
const ROLE_ROUTES = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const { user, loading } = useAuth();

  // ======================================================
  // WAIT FOR AUTH RESTORE (IMPORTANT FIX)
  // ======================================================
  if (loading) {
    return null; // or a loader spinner
  }

  // ======================================================
  // NOT AUTHENTICATED
  // ======================================================
  if (!user?.access_token || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user.role).toLowerCase();
  const required = requiredRole
    ? String(requiredRole).toLowerCase()
    : null;

  // ======================================================
  // ROLE MISMATCH HANDLING (FIXED SAFETY)
  // ======================================================
  if (required && userRole !== required) {
    const redirectTo = ROLE_ROUTES[userRole];

    return (
      <Navigate
        to={redirectTo || "/login"}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;