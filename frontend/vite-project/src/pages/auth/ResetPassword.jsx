import React, { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { resetPassword } from "../../services/authServices";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token =
    searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) {
      setErrorMsg(
        "Invalid or missing reset token."
      );
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(
        token,
        newPassword
      );

      setSuccessMsg(
        response?.message ||
        "Password reset successful."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setErrorMsg(
        error?.message ||
        "Password reset failed."
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
        onSubmit={handleReset}
        style={{ width: 420 }}
      >
        <h1>Reset Password</h1>

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
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;