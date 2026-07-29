import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authServices";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await forgotPassword(email);

      setSuccessMsg(
        response?.message ||
        "Password reset link sent successfully."
      );

      setEmail("");

    } catch (error) {
      setErrorMsg(
        error?.message ||
        "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 400,
          padding: 30,
        }}
      >
        <h1>Forgot Password</h1>

        {successMsg && (
          <p style={{ color: "green" }}>
            {successMsg}
          </p>
        )}

        {errorMsg && (
          <p style={{ color: "red" }}>
            {errorMsg}
          </p>
        )}

        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>

        <div
          style={{
            marginTop: "15px",
            textAlign: "center",
          }}
        >
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;