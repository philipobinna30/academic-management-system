import API from "./api";

// ======================================================
const handleServiceError = (action, error) => {
  console.error(`${action} failed:`, error);

  const detail = error?.response?.data?.detail;

  let message = "Request failed";

  if (typeof detail === "string")
    message = detail;
  else if (Array.isArray(detail))
    message = detail[0]?.msg || "Validation error";
  else
    message =
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error";

  throw new Error(message);
};

// ======================================================
// NORMALIZE SESSION
// ======================================================
const normalizeSession = (session) => {
  if (!session) return null;

  return {
    id: session?.id ?? null,
    name: session?.name || session?.title || "Untitled Session",
    is_active: session?.is_active ?? session?.active ?? false,
    start_date: session?.start_date || null,
    end_date: session?.end_date || null,
    created_at: session?.created_at || null,
    updated_at: session?.updated_at || null,
  };
};

// ======================================================
// BASE PATH
// ======================================================
const BASE = "/sessions";

// ======================================================
// CREATE SESSION
// ======================================================
export const createSession = async (data) => {
  try {
    const res = await API.post(BASE, data);

    const payload = res?.data?.data || res?.data;

    return normalizeSession(payload);
  } catch (e) {
    handleServiceError("Creating session", e);
  }
};

// ======================================================
// GET ALL SESSIONS
// ======================================================
export const getSessions = async () => {
  try {
    const res = await API.get(BASE);

    const payload = res?.data?.data || res?.data || [];

    return Array.isArray(payload)
      ? payload.map(normalizeSession)
      : [];
  } catch (e) {
    handleServiceError("Fetching sessions", e);
  }
};

// ======================================================
// ALIAS FOR RESULTS PAGE
// ======================================================
export const getAcademicSessions = getSessions;

// ======================================================
// GET SINGLE SESSION
// ======================================================
export const getSession = async (id) => {
  try {
    if (!id)
      throw new Error("Session ID is required");

    const res = await API.get(`${BASE}/${id}`);

    const payload = res?.data?.data || res?.data;

    return normalizeSession(payload);
  } catch (e) {
    handleServiceError(`Fetching session ${id}`, e);
  }
};

// ======================================================
// UPDATE SESSION
// ======================================================
export const updateSession = async (id, data) => {
  try {
    const res = await API.patch(
      `${BASE}/${id}`,
      data
    );

    const payload = res?.data?.data || res?.data;

    return normalizeSession(payload);
  } catch (e) {
    handleServiceError(`Updating session ${id}`, e);
  }
};

// ======================================================
// DELETE SESSION
// ======================================================
export const deleteSession = async (id) => {
  try {
    const res = await API.delete(`${BASE}/${id}`);

    return res?.data;
  } catch (e) {
    handleServiceError(`Deleting session ${id}`, e);
  }
};

// ======================================================
// ACTIVATE SESSION
// ======================================================
export const activateSession = async (id) => {
  try {
    const res = await API.patch(
      `${BASE}/${id}/activate`
    );

    const payload = res?.data?.data || res?.data;

    return normalizeSession(payload);
  } catch (e) {
    handleServiceError(`Activating session ${id}`, e);
  }
};

// ======================================================
export default {
  createSession,
  getSessions,
  getAcademicSessions,
  getSession,
  updateSession,
  deleteSession,
  activateSession,
};