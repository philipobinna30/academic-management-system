import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { setGlobalLogoutHandler } from "../services/api";

const AuthContext = createContext();

// ======================================================
// GET USER FROM STORAGE (SAFE VERSION)
// ======================================================
const getStoredUser = () => {
  const access_token =
    localStorage.getItem("access_token");

  if (!access_token) return null;

  return {
    access_token,

    refresh_token:
      localStorage.getItem(
        "refresh_token"
      ),

    token_type:
      localStorage.getItem(
        "token_type"
      ) || "bearer",

    role:
      localStorage.getItem("role") ||
      null,

    user_id:
      localStorage.getItem("user_id")
        ? Number(
            localStorage.getItem(
              "user_id"
            )
          )
        : null,

    student_profile_id:
      localStorage.getItem(
        "student_profile_id"
      )
        ? Number(
            localStorage.getItem(
              "student_profile_id"
            )
          )
        : null,
  };
};

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] = useState(
    () => getStoredUser()
  );

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // LOGOUT
  // ======================================================
  const logout = () => {
    localStorage.clear();

    setUser(null);

    window.location.href =
      "/login";
  };

  // ======================================================
  // SYNC WITH API INTERCEPTOR
  // FIXED
  // ======================================================
  useEffect(() => {
    setGlobalLogoutHandler(logout);

    return () => {
      setGlobalLogoutHandler(null);
    };
  }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    setUser(getStoredUser());

    setLoading(false);
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================
  const login = (loginData) => {
    const {
      access_token,
      refresh_token,
      token_type = "bearer",
      role,
      user_id,
      student_profile_id,
    } = loginData;

    if (access_token) {
      localStorage.setItem(
        "access_token",
        access_token
      );
    }

    if (refresh_token) {
      localStorage.setItem(
        "refresh_token",
        refresh_token
      );
    }

    localStorage.setItem(
      "token_type",
      token_type
    );

    if (role) {
      localStorage.setItem(
        "role",
        role
      );
    }

    if (user_id != null) {
      localStorage.setItem(
        "user_id",
        String(user_id)
      );
    }

    if (
      student_profile_id != null
    ) {
      localStorage.setItem(
        "student_profile_id",
        String(student_profile_id)
      );
    }

    setUser(getStoredUser());
  };

  // ======================================================
  // SYNC
  // ======================================================
  const syncAuth = () => {
    setUser(getStoredUser());
  };

  // ======================================================
  // DERIVED STATE
  // ======================================================
  const isAuthenticated =
    !!user?.access_token;

  const isAdmin =
    user?.role === "admin";

  const isTeacher =
    user?.role === "teacher";

  const isStudent =
    user?.role === "student";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        syncAuth,
        loading,

        isAuthenticated,
        isAdmin,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);