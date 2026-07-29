import { AUTH_API } from "./api";

// ======================================================
// SAFE ERROR HANDLER (CONSISTENT WITH OTHER SERVICES)
// ======================================================
const handleAuthError = (action, error) => {
  console.error(`${action} failed:`, error);

  const detail = error?.response?.data?.detail;

  let message = "Authentication request failed";

  if (typeof detail === "string") {
    message = detail;
  } else if (Array.isArray(detail)) {
    message = detail[0]?.msg || "Validation error";
  } else {
    message =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error";
  }

  throw new Error(message);
};

// ======================================================
// LOGIN
// ======================================================
export const loginUser = async (email, password) => {
  try {
    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const res = await AUTH_API.post("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = res?.data || {};

    return {
      access_token: data?.access_token ?? null,
      refresh_token: data?.refresh_token ?? null,
      token_type: data?.token_type || "bearer",
      role: data?.role ?? null,
      user_id: data?.user_id ?? data?.id ?? null,
      student_profile_id:
        data?.student_profile_id ?? data?.student_id ?? null,
    };
  } catch (error) {
    handleAuthError("Login", error);
  }
};

// ======================================================
// REFRESH TOKEN
// ======================================================
export const refreshAccessToken = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");

    if (!refresh_token) {
      throw new Error("No refresh token found");
    }

    const res = await AUTH_API.post("/refresh", null, {
      params: {
        token: refresh_token,
      },
    });

    const data = res?.data || {};

    // update access token
    if (data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }

    // optional backend variation support
    if (data?.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  } catch (error) {
    handleAuthError("Refresh token", error);
  }
};

// ======================================================
// SEND VERIFICATION EMAIL
// ======================================================
export const sendVerificationEmail = async (email) => {
  try {
    const res = await AUTH_API.post("/send-verification", { email });
    return res?.data;
  } catch (error) {
    handleAuthError("Send verification email", error);
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================
export const forgotPassword = async (email) => {
  try {
    const res = await AUTH_API.post("/forgot-password", { email });
    return res?.data;
  } catch (error) {
    handleAuthError("Forgot password", error);
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================
export const resetPassword = async (token, new_password) => {
  try {
    const res = await AUTH_API.post("/reset-password", {
      token,
      new_password,
    });

    return res?.data;
  } catch (error) {
    handleAuthError("Reset password", error);
  }
};

// ======================================================
// LOGOUT (KEEP SINGLE SOURCE OF TRUTH IN CONTEXT)
// ======================================================
export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};