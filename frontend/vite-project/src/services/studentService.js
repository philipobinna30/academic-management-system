
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
const extractData = (res) => {
  return res?.data?.data || res?.data || [];
};

// ======================================================
const normalizeStudent = (student) => {
  if (!student) return null;

  return {
    // ==================================================
    // STUDENT PROFILE INFORMATION
    // ==================================================

    id:
      student?.id ??
      student?.student_profile_id ??
      null,

    user_id:
      student?.user_id ??
      student?.user?.id ??
      null,

    full_name:
      student?.user?.full_name ||
      student?.full_name ||
      "N/A",

    email:
      student?.user?.email ||
      student?.email ||
      "N/A",

    role:
      student?.user?.role ||
      student?.role ||
      "student",

    // ==================================================
    // ACCOUNT STATUS
    // ==================================================

    is_active:
      student?.is_active ??
      student?.user?.is_active ??
      true,

    is_verified:
      student?.is_verified ??
      student?.email_verified ??
      student?.user?.is_verified ??
      student?.user?.email_verified ??
      false,

    // Keep email_verified as well so the frontend can
    // safely read either field.
    email_verified:
      student?.email_verified ??
      student?.is_verified ??
      student?.user?.email_verified ??
      student?.user?.is_verified ??
      false,

    created_at:
      student?.created_at ??
      student?.user?.created_at ??
      null,

    // ==================================================
    // COURSE INFORMATION
    // ==================================================

    course_id:
      student?.course_id ??
      student?.course?.id ??
      null,

    course_name:
      student?.course?.name ||
      student?.course_name ||
      "N/A",

    // ==================================================
    // PARENT INFORMATION
    // ==================================================

    parent_id:
      student?.parent_id ??
      student?.parent?.id ??
      null,

    // ==================================================
    // ACADEMIC PERFORMANCE
    // ==================================================

    total_score:
      student?.total_score ?? 0,

    average_score:
      student?.average_score ?? 0,

    gpa:
      student?.gpa ?? 0,

    position:
      student?.position ??
      student?.academic_position ??
      student?.rank ??
      null,

    remarks:
      student?.remarks ??
      student?.comment ??
      student?.note ??
      "",
  };
};

// ======================================================
const normalizeResult = (result) => {
  if (!result) return null;

  return {
    ...result,

    subjects: Array.isArray(
      result?.subjects
    )
      ? result.subjects
      : [],

    gpa:
      result?.gpa ?? 0,

    cumulative_gpa:
      result?.cumulative_gpa ?? 0,

    total_score:
      result?.total_score ?? 0,

    average_score:
      result?.average_score ?? 0,
  };
};

// ======================================================
// GET ALL STUDENTS
// GET /crud/students/profiles/all
// ======================================================
export const getAllStudents = async () => {
  try {
    const res = await API.get(
      "/profiles/all"
    );

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeStudent)
      : [];
  } catch (e) {
    handleServiceError(
      "Fetching students",
      e
    );
  }
};

// ======================================================
// GET MY PROFILE
// GET /crud/students/me/profile
// ======================================================
export const getMyProfile = async () => {
  try {
    const res = await API.get(
      "/me/profile"
    );

    return normalizeStudent(
      extractData(res)
    );
  } catch (e) {
    handleServiceError(
      "Fetching my profile",
      e
    );
  }
};

// ======================================================
// GET STUDENT PROFILE
// GET /crud/students/{student_id}/profile
//
// IMPORTANT:
// TeacherStudentProfile page needs:
// user
// course
// parent_id
// user_id
//
// Therefore DO NOT normalize.
// Return raw StudentProfileResponse.
// ======================================================
export const getStudentProfile = async (
  studentId
) => {
  try {
    const res = await API.get(
      `/${studentId}/profile`
    );

    return extractData(res);
  } catch (e) {
    handleServiceError(
      `Fetching student profile ${studentId}`,
      e
    );
  }
};

// ======================================================
// GET STUDENT
// GET /crud/students/{student_id}
// ======================================================
export const getStudentById = async (
  studentId
) => {
  try {
    const res = await API.get(
      `/${studentId}`
    );

    return normalizeStudent(
      extractData(res)
    );
  } catch (e) {
    handleServiceError(
      `Fetching student ${studentId}`,
      e
    );
  }
};

// ======================================================
// CREATE STUDENT
// POST /crud/students/
// ======================================================
export const createStudent = async (
  data
) => {
  try {
    const res = await API.post(
      "/",
      data
    );

    return normalizeStudent(
      extractData(res)
    );
  } catch (e) {
    handleServiceError(
      "Creating student",
      e
    );
  }
};

// ======================================================
// UPDATE STUDENT
// PATCH /crud/students/{id}
// ======================================================
export const updateStudent = async (
  id,
  data
) => {
  try {
    const res = await API.patch(
      `/${id}`,
      data
    );

    return normalizeStudent(
      extractData(res)
    );
  } catch (e) {
    handleServiceError(
      `Updating student ${id}`,
      e
    );
  }
};

// ======================================================
// DELETE STUDENT
// DELETE /crud/students/{id}
// ======================================================
export const deleteStudent = async (
  id
) => {
  try {
    const res = await API.delete(
      `/${id}`
    );

    return res.data;
  } catch (e) {
    handleServiceError(
      `Deleting student ${id}`,
      e
    );
  }
};

// ======================================================
// VIEW RESULT
// GET /crud/students/{id}/result
// ======================================================
export const getStudentResult = async (
  id
) => {
  try {
    const res = await API.get(
      `/${id}/result`
    );

    return normalizeResult(
      extractData(res)
    );
  } catch (e) {
    handleServiceError(
      "Fetching result",
      e
    );
  }
};

// ======================================================
// PRINT RESULT
// GET /crud/students/{id}/result/print
// ======================================================
export const printStudentResult = async (
  id
) => {
  try {
    const res = await API.get(
      `/${id}/result/print`,
      {
        responseType: "blob",
      }
    );

    return res.data;
  } catch (e) {
    handleServiceError(
      "Printing result",
      e
    );
  }
};

// ======================================================
// PRINT TRANSCRIPT
// GET /crud/students/{id}/transcript/print
// ======================================================
export const printStudentTranscript =
  async (id) => {
    try {
      const res = await API.get(
        `/${id}/transcript/print`,
        {
          responseType: "blob",
        }
      );

      return res.data;
    } catch (e) {
      handleServiceError(
        "Printing transcript",
        e
      );
    }
  };

export default {
  getAllStudents,
  getMyProfile,
  getStudentProfile,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentResult,
  printStudentResult,
  printStudentTranscript,
};

