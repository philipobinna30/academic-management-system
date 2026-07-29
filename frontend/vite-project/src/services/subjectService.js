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
const BASE = "/subjects";

// ======================================================
// SAFE EXTRACTOR
// ======================================================
const extractData = (res) => {
  return res?.data?.data ?? res?.data ?? null;
};

// ======================================================
// NORMALIZE SUBJECT
// ======================================================
const normalizeSubject = (subject) => {
  if (!subject) return null;

  return {
    id: subject.id,
    name: subject.name || "",
    course_id: subject.course_id || null,
  };
};

// ======================================================
// GET ALL SUBJECTS
// ======================================================
export const getSubjects = async () => {
  try {
    const res = await API.get(BASE);

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeSubject)
      : [];
  } catch (error) {
    handleServiceError("Fetching subjects", error);
  }
};

// ======================================================
// ⭐ FIXED: GET SUBJECTS BY COURSE (MISSING EXPORT)
// ======================================================
export const getSubjectsByCourse = async (courseId) => {
  try {
    const res = await API.get(
      `${BASE}/course/${courseId}`
    );

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeSubject)
      : [];
  } catch (error) {
    handleServiceError("Fetching subjects by course", error);
  }
};

// ======================================================
// GET SINGLE SUBJECT
// ======================================================
export const getSubject = async (subjectId) => {
  try {
    const res = await API.get(`${BASE}/${subjectId}`);

    return normalizeSubject(extractData(res));
  } catch (error) {
    handleServiceError("Fetching subject", error);
  }
};

// ======================================================
// CREATE SUBJECT
// ======================================================
export const createSubject = async (data) => {
  try {
    const res = await API.post(BASE, data);

    return normalizeSubject(extractData(res));
  } catch (error) {
    handleServiceError("Creating subject", error);
  }
};

// ======================================================
// UPDATE SUBJECT
// ======================================================
export const updateSubject = async (subjectId, data) => {
  try {
    const res = await API.patch(`${BASE}/${subjectId}`, data);

    return normalizeSubject(extractData(res));
  } catch (error) {
    handleServiceError("Updating subject", error);
  }
};

// ======================================================
// DELETE SUBJECT
// ======================================================
export const deleteSubject = async (subjectId) => {
  try {
    const res = await API.delete(`${BASE}/${subjectId}`);

    return extractData(res);
  } catch (error) {
    handleServiceError("Deleting subject", error);
  }
};

// ======================================================
// EXPORT COLLECTION
// ======================================================
const subjectService = {
  getSubjects,
  getSubjectsByCourse,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
};

export default subjectService;