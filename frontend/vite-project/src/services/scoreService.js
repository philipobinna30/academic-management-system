import API from "./api";

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
// NORMALIZE SCORE
// ======================================================
const normalizeScore = (score) => {
  if (!score) return null;

  return {
    id: score?.id ?? null,
    student_id: score?.student_id ?? null,
    subject_id: score?.subject_id ?? null,
    marks: score?.marks ?? 0,
    subject_name:
      score?.subject?.name ||
      score?.subject_name ||
      "N/A",
  };
};

// ======================================================
// SAFE RESPONSE EXTRACTOR
// ======================================================
const extractData = (res) => {
  return res?.data?.data || res?.data || [];
};

// ======================================================
// CREATE SCORE
// ======================================================
export const createScore = async (data) => {
  try {
    const res = await API.post("/scores", data);

    return normalizeScore(extractData(res));
  } catch (e) {
    handleServiceError("Creating score", e);
  }
};

// ======================================================
// BULK SCORES
// ======================================================
export const createBulkScores = async (data) => {
  try {
    const res = await API.post("/scores/bulk", data);

    return extractData(res);
  } catch (e) {
    handleServiceError("Creating bulk scores", e);
  }
};

// ======================================================
// GET ALL SCORES
// ======================================================
export const getAllScores = async () => {
  try {
    const res = await API.get("/scores");

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeScore)
      : [];
  } catch (e) {
    handleServiceError("Fetching scores", e);
  }
};

// ======================================================
// GET SCORE (CLIENT SIDE)
// ======================================================
export const getScore = async (id) => {
  try {
    if (!id) throw new Error("Score ID is required");

    const scores = await getAllScores();

    return scores.find((s) => s.id === id) || null;
  } catch (e) {
    handleServiceError(`Fetching score ${id}`, e);
  }
};

// ======================================================
// UPDATE SCORE
// ======================================================
export const updateScore = async (id, data) => {
  try {
    const res = await API.patch(`/scores/${id}`, data);

    return normalizeScore(extractData(res));
  } catch (e) {
    handleServiceError(`Updating score ${id}`, e);
  }
};

// ======================================================
// DELETE SCORE
// ======================================================
export const deleteScore = async (id) => {
  try {
    const res = await API.delete(`/scores/${id}`);

    return res?.data;
  } catch (e) {
    handleServiceError(`Deleting score ${id}`, e);
  }
};

// ======================================================
// STUDENT SCORES (CLIENT FILTER)
// ======================================================
export const getStudentScores = async (studentId) => {
  try {
    if (!studentId)
      throw new Error("Student ID is required");

    const scores = await getAllScores();

    return scores.filter(
      (score) => score.student_id === studentId
    );
  } catch (e) {
    handleServiceError(
      `Fetching student scores ${studentId}`,
      e
    );
  }
};

// ======================================================
export default {
  createScore,
  createBulkScores,
  getAllScores,
  getScore,
  updateScore,
  deleteScore,
  getStudentScores,
};