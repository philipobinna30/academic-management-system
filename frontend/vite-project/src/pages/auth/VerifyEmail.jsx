
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
          "http://localhost:8000/auth/verify-email",
          {
            params: { token },
          }
        );

        setStatus("success");
        setMessage(
          response.data?.message ||
            "Your email has been successfully verified."
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
    <main className="auth-page">
      <div className="auth-container">
        {status === "loading" && (
          <>
            <h1>Verifying Your Email</h1>
            <p>Please wait while we verify your email address...</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1>Email Verified Successfully</h1>
            <p>{message}</p>

            <Link to="/login" className="auth-button">
              Continue to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1>Verification Failed</h1>
            <p>{message}</p>

            <Link to="/login" className="auth-button">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default VerifyEmail;
