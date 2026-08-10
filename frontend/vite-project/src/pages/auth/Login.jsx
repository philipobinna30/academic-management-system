import React, { useState, useEffect } from "react";
import "./Login.css";

import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authServices";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
} from "react-icons/fa";

import schoolLogo from "../../assets/myapo-logo.png";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ======================================================
  // SAFE ROLE REDIRECT
  // ======================================================

  useEffect(() => {
    if (!user?.access_token || !user?.role) return;

    const role = user.role.toLowerCase();

    const timer = setTimeout(() => {
      switch (role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;

        case "teacher":
          navigate("/teacher", { replace: true });
          break;

        case "student":
          navigate("/student", { replace: true });
          break;

        default:
          navigate("/", { replace: true });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // ======================================================
  // LOGIN HANDLER
  // ======================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    try {
      const data = await loginUser(email, password);

      if (!data?.access_token) {
        throw new Error("Invalid login response from server");
      }

      login({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type || "bearer",
        role: data.role,
        user_id: data.user_id,
        student_profile_id: data.student_profile_id,
      });
    } catch (error) {
      const msg =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error?.message ||
        "Login failed";

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ===========================
          LEFT SIDE
      ============================ */}

      <div className="login-left">

        <div className="overlay">

          <div className="logo-section">

            <img
              src={schoolLogo}
              alt="MYAPO Logo"
              className="school-logo"
            />

            <h1 className="school-name">
              MYAPO
            </h1>

            <p className="school-subtitle">
              Academic Management System
            </p>

            <p className="school-motto">
              Knowledge • Excellence • Success
            </p>

          </div>

          <p
            style={{
              marginTop: "25px",
              lineHeight: "1.9",
            }}
          >
            Welcome to the MYAPO Academic Management System,
            a modern platform built to simplify academic
            administration, student management, online classes,
            examinations, transcripts, result computation,
            admissions, and school communication.
          </p>

          <div className="feature-box">

            <div>
              <FaUserGraduate />
              <span>Student Portal</span>
            </div>

            <div>
              <FaUserGraduate />
              <span>Teacher Dashboard</span>
            </div>

            <div>
              <FaUserGraduate />
              <span>Administrator Control Panel</span>
            </div>

          </div>

        </div>

      </div>

      {/* ===========================
          RIGHT SIDE
      ============================ */}

      <div className="login-right">

        <form
          onSubmit={handleLogin}
          autoComplete="on"
          className="login-card"
        >

          <h2 className="login-title">
            Welcome Back
          </h2>

          <p className="login-description">
            Sign in to continue to your dashboard
          </p>

          {errorMsg && (
            <div className="error-box">
              {errorMsg}
            </div>
          )}

          {/* ===========================
              EMAIL
          ============================ */}

          <div className="input-group">

            <FaEnvelope className="input-icon" />

            <input
              className="login-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          {/* ===========================
              PASSWORD
          ============================ */}

          <div className="input-group">

            <FaLock className="input-icon" />

            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </span>

          </div>

          {/* ===========================
              REMEMBER ME + FORGOT PASSWORD
          ============================ */}

          <div className="login-options">

            <label className="remember-me">

              <input type="checkbox" />

              Remember Me

            </label>

            <Link
              to="/forgot-password"
              className="forgot-link"
            >
              Forgot Password?
            </Link>

          </div>

          {/* ===========================
              LOGIN BUTTON
          ============================ */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* ===========================
              FOOTER
          ============================ */}

          <div className="login-footer">

            <p>
              © {new Date().getFullYear()} MYAPO Academic
              Management System
            </p>

            <p>
              Empowering Schools Through Technology
            </p>

          </div>

        </form>

      </div>

    </div>
  );
};

export default Login;