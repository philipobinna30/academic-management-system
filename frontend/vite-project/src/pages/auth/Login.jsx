import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authServices";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // SAFE ROLE REDIRECT (FIXED STABILITY)
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
    <div className="login-container">
      <form onSubmit={handleLogin} autoComplete="on">
        <h1>Login</h1>

        {errorMsg && (
          <p style={{ color: "red" }}>
            {errorMsg}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        {/* ======================================================
            FORGOT PASSWORD LINK
           ====================================================== */}

        <div
          style={{
            textAlign: "right",
            marginTop: "8px",
            marginBottom: "15px",
          }}
        >
          <Link
            to="/forgot-password"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Forgot Password?
          </Link>
        </div>

        <button disabled={loading}>
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;