import API from "./api";

// ======================================================
// ERROR HANDLER
// ======================================================
const handleServiceError = (action, error) => {
  console.error(`${action} failed:`, error);

  const detail = error?.response?.data?.detail;

  let message = "Request failed";

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
// BASE
// ======================================================
const BASE = "/terms";

// ======================================================
// SAFE EXTRACTOR
// ======================================================
const extractData = (res) => {
  return res?.data?.data ?? res?.data ?? null;
};

// ======================================================
// NORMALIZE TERM
// ======================================================
const normalizeTerm = (term) => {
  if (!term) return null;

  return {
    id: term.id,

    name: term.name || "",

    // ==================================================
    // REQUIRED FOR RESULTS FILTERING
    // ==================================================
    session_id:
      term.session_id ??
      term.academic_session_id ??
      term.session?.id ??
      null,

    session_name:
      term.session_name ??
      term.session?.name ??
      "",

    is_active: term.is_active ?? false,

    is_closed: term.is_closed ?? false,

    start_date: term.start_date || null,

    end_date: term.end_date || null,

    next_term_begins:
      term.next_term_begins || null,
  };
};

// ======================================================
// GET ALL TERMS
// ======================================================
export const getTerms = async () => {
  try {
    const res = await API.get(BASE);

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeTerm)
      : [];
  } catch (error) {
    handleServiceError("Fetching terms", error);
  }
};

// ======================================================
// GET ACTIVE TERM
// ======================================================
export const getActiveTerm = async () => {
  try {
    const res = await API.get(`${BASE}/active`);

    return normalizeTerm(extractData(res));
  } catch (error) {
    handleServiceError("Fetching active term", error);
  }
};

// ======================================================
// GET SINGLE TERM
// ======================================================
export const getTerm = async (termId) => {
  try {
    const res = await API.get(`${BASE}/${termId}`);

    return normalizeTerm(extractData(res));
  } catch (error) {
    handleServiceError("Fetching term", error);
  }
};

// ======================================================
// CREATE TERM
// ======================================================
export const createTerm = async (data) => {
  try {
    const res = await API.post(BASE, data);

    return normalizeTerm(extractData(res));
  } catch (error) {
    handleServiceError("Creating term", error);
  }
};

// ======================================================
// UPDATE TERM
// ======================================================
export const updateTerm = async (termId, data) => {
  try {
    const res = await API.patch(`${BASE}/${termId}`, data);

    return normalizeTerm(extractData(res));
  } catch (error) {
    handleServiceError("Updating term", error);
  }
};

// ======================================================
// DELETE TERM
// ======================================================
export const deleteTerm = async (termId) => {
  try {
    const res = await API.delete(`${BASE}/${termId}`);

    return extractData(res);
  } catch (error) {
    handleServiceError("Deleting term", error);
  }
};

// ======================================================
// EXPORT COLLECTION
// ======================================================
const termService = {
  getTerms,
  getActiveTerm,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
};

export default termService;