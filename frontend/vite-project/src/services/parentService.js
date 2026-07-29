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
// NORMALIZE PARENT
// ======================================================
const normalizeParent = (parent) => {
  if (!parent) return null;

  return {
    id: parent?.id ?? null,
    full_name: parent?.full_name || parent?.user?.full_name || "",
    email: parent?.email || parent?.user?.email || "",
    phone: parent?.phone || "",
  };
};

// ======================================================
// CREATE PARENT
// ======================================================
export const createParent = async (data) => {
  try {
    const res = await API.post("/parents", data);

    return normalizeParent(res?.data);
  } catch (e) {
    handleServiceError("Creating parent", e);
  }
};

// ======================================================
// GET ALL PARENTS
// ======================================================
export const getAllParents = async () => {
  try {
    const res = await API.get("/parents");

    const data = res?.data || [];

    return Array.isArray(data)
      ? data.map(normalizeParent)
      : [];
  } catch (e) {
    handleServiceError("Fetching parents", e);
  }
};

// ======================================================
// GET PARENT BY ID
// ======================================================
export const getParent = async (id) => {
  try {
    if (!id) throw new Error("Parent ID is required");

    const res = await API.get(`/parents/${id}`);

    return normalizeParent(res?.data);
  } catch (e) {
    handleServiceError(`Fetching parent ${id}`, e);
  }
};

// ======================================================
// SEARCH PARENTS (CLIENT SIDE)
// ======================================================
export const searchParents = async (term) => {
  try {
    const parents = await getAllParents();

    const keyword = (term || "").toLowerCase();

    return parents.filter((p) =>
      (p.full_name || "").toLowerCase().includes(keyword) ||
      (p.email || "").toLowerCase().includes(keyword) ||
      String(p.phone || "").toLowerCase().includes(keyword)
    );
  } catch (e) {
    handleServiceError("Searching parents", e);
  }
};

// ======================================================
// UPDATE PARENT
// ======================================================
export const updateParent = async (id, data) => {
  try {
    if (!id) throw new Error("Parent ID is required");

    const res = await API.patch(`/parents/${id}`, data);

    return normalizeParent(res?.data);
  } catch (e) {
    handleServiceError(`Updating parent ${id}`, e);
  }
};

// ======================================================
// DELETE PARENT
// ======================================================
export const deleteParent = async (id) => {
  try {
    if (!id) throw new Error("Parent ID is required");

    const res = await API.delete(`/parents/${id}`);

    return res?.data || { success: true };
  } catch (e) {
    handleServiceError(`Deleting parent ${id}`, e);
  }
};

// ======================================================
export default {
  createParent,
  getAllParents,
  getParent,
  searchParents,
  updateParent,
  deleteParent,
};