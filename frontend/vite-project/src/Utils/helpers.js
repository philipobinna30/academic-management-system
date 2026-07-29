// ======================================================
// EXTRACT SAFE ERROR MESSAGE
// FIXES:
// - FastAPI 422 validation errors
// - React object rendering crash
// - Axios/network errors
// ======================================================
export const getErrorMessage = (error) => {
  // ============================================
  // RESPONSE DETAIL
  // ============================================
  const detail =
    error?.response?.data?.detail;

  // ============================================
  // RESPONSE MESSAGE
  // ============================================
  const message =
    error?.response?.data?.message;

  // ============================================
  // NORMAL ERROR MESSAGE
  // ============================================
  if (typeof error?.message === "string") {
    return error.message;
  }

  // ============================================
  // STRING DETAIL
  // ============================================
  if (typeof detail === "string") {
    return detail;
  }

  // ============================================
  // FASTAPI 422 ARRAY ERRORS
  // ============================================
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const field =
          err?.loc?.[err.loc.length - 1];

        const msg = err?.msg;

        if (field && msg) {
          return `${field}: ${msg}`;
        }

        return msg;
      })
      .filter(Boolean)
      .join(", ");
  }

  // ============================================
  // OBJECT MESSAGE
  // ============================================
  if (typeof message === "string") {
    return message;
  }

  // ============================================
  // STRING ERROR
  // ============================================
  if (typeof error === "string") {
    return error;
  }

  // ============================================
  // NETWORK ERROR
  // ============================================
  if (
    error?.code === "ERR_NETWORK"
  ) {
    return "Unable to connect to server";
  }

  // ============================================
  // DEFAULT
  // ============================================
  return "Something went wrong";
};

// ======================================================
// SAFE API RESPONSE EXTRACTOR
// ======================================================
export const getResponseData = (
  response
) => {
  return response?.data || response;
};

// ======================================================
// ROLE NORMALIZER
// ======================================================
export const normalizeRole = (
  role
) => {
  if (!role) return "";

  return String(role).toLowerCase();
};

// ======================================================
// REDIRECT HELPER
// ======================================================
export const getDashboardRoute = (
  role
) => {
  switch (
    String(role).toLowerCase()
  ) {
    case "admin":
      return "/admin";

    case "teacher":
      return "/teacher";

    case "student":
      return "/student";

    default:
      return "/login";
  }
};

// ======================================================
// SAFE NUMBER CONVERTER
// ======================================================
export const toNumber = (
  value
) => {
  const number = Number(value);

  return isNaN(number)
    ? 0
    : number;
};

// ======================================================
// FORMAT DATE
// ======================================================
export const formatDate = (
  date
) => {
  if (!date) return "N/A";

  return new Date(
    date
  ).toLocaleDateString();
};

// ======================================================
// FORMAT TIME
// ======================================================
export const formatTime = (
  date
) => {
  if (!date) return "N/A";

  return new Date(
    date
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};