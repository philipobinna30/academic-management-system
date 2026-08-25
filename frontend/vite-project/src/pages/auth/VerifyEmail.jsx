import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          "https://academic-management-system-o8zf.onrender.com/auth/verify-email",
          {
            params: { token },
          }
        );

        setStatus("success");
        setMessage(
          response.data?.message ||
            "Email verified successfully"
        );
      } catch (error) {
        setStatus("error");

        setMessage(
          error.response?.data?.detail ||
            "Email verification failed. The verification link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="verify-email-page">
      <div className="verify-email-container">

        {status === "loading" && (
          <div className="verify-email-content">
            <h1>Verifying Your Email</h1>

            <p>
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="verify-email-content success">
            <div className="verify-icon">✓</div>

            <h1>Email Verified Successfully</h1>

            <p>{message}</p>

            <Link
              to="/login"
              className="verify-email-button"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="verify-email-content error">
            <div className="verify-icon">!</div>

            <h1>Verification Failed</h1>

            <p>{message}</p>

            <Link
              to="/login"
              className="verify-email-button"
            >
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </main>
  );
};

export default VerifyEmail;