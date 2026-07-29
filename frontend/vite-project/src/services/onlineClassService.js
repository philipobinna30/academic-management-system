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
// NORMALIZER
// ======================================================
const normalizeClass = (cls) => {
  if (!cls) return null;

  return {
    id: cls.id,
    title: cls.title || "Untitled Class",
    description: cls.description || "",
    subject_id: cls.subject_id ?? null,
    term_id: cls.term_id ?? null,
    start_time: cls.start_time || null,
    end_time: cls.end_time || null,
    meeting_link: cls.meeting_link || "",
  };
};

// ======================================================
// GET ALL ONLINE CLASSES
// ======================================================
export const getOnlineClasses = async () => {
  try {
    const res = await API.get("/online-classes");

    const data = res?.data || [];

    return Array.isArray(data)
      ? data.map(normalizeClass).filter(Boolean)
      : [];
  } catch (error) {
    handleServiceError("Fetching online classes", error);
  }
};

// alias (IMPORTANT FIX)
export const getAllOnlineClasses = getOnlineClasses;

// ======================================================
// GET SINGLE CLASS
// ======================================================
export const getOnlineClass = async (classId) => {
  try {
    if (!classId) throw new Error("Class ID is required");

    const res = await API.get(`/online-classes/${classId}`);

    return normalizeClass(res?.data);
  } catch (error) {
    handleServiceError(`Fetching class ${classId}`, error);
  }
};

// ======================================================
// GET STUDENT CLASSES
// ======================================================
export const getStudentOnlineClasses = async () => {
  try {
    const res = await API.get("/online-classes");

    const data = res?.data || [];

    return Array.isArray(data)
      ? data.map(normalizeClass).filter(Boolean)
      : [];
  } catch (error) {
    handleServiceError("Fetching student online classes", error);
  }
};

// ======================================================
// CREATE CLASS
// ======================================================
export const createOnlineClass = async (data) => {
  try {
    const res = await API.post("/online-classes", data);
    return normalizeClass(res?.data);
  } catch (error) {
    handleServiceError("Creating online class", error);
  }
};

// ======================================================
// UPDATE CLASS
// ======================================================
export const updateOnlineClass = async (classId, data) => {
  try {
    if (!classId) throw new Error("Class ID is required");

    const res = await API.patch(
      `/online-classes/${classId}`,
      data
    );

    return normalizeClass(res?.data);
  } catch (error) {
    handleServiceError(`Updating class ${classId}`, error);
  }
};

// ======================================================
// DELETE CLASS
// ======================================================
export const deleteOnlineClass = async (classId) => {
  try {
    if (!classId) throw new Error("Class ID is required");

    const res = await API.delete(`/online-classes/${classId}`);

    return res?.data;
  } catch (error) {
    handleServiceError(`Deleting class ${classId}`, error);
  }
};

// ======================================================
// SINGLE CLEAN EXPORT STYLE (NO DUPLICATES)
// ======================================================
export default {
  getOnlineClasses,
  getAllOnlineClasses,
  getOnlineClass,
  getStudentOnlineClasses,
  createOnlineClass,
  updateOnlineClass,
  deleteOnlineClass,
};