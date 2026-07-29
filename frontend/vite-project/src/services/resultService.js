import API from "./api";

// ======================================================
const handleServiceError = (action, error) => {
  console.error(`${action} failed:`, error);

  const detail = error?.response?.data?.detail;

  let message = "Request failed";

  if (typeof detail === "string") message = detail;
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
const normalizeSubject = (subject) => {
  if (!subject) return null;

  return {
    subject_id:
      subject?.subject_id ??
      subject?.subject?.id ??
      subject?.id ??
      null,

    subject_name:
      subject?.subject_name ||
      subject?.subject?.name ||
      subject?.name ||
      "Unknown Subject",

    marks:
      subject?.marks ??
      subject?.score ??
      0,

    grade:
      subject?.grade ||
      "N/A",

    remark:
      subject?.remark ||
      subject?.remarks ||
      "N/A",
  };
};

// ======================================================
const normalizeResult = (result) => {
  if (!result) return null;

  return {
    id: result?.id ?? null,

    student_id:
      result?.student_id ?? null,

    student_name:
      result?.student_name || "N/A",

    course_id:
      result?.course_id ?? null,

    term_id:
      result?.term_id ?? null,

    academic_session_id:
      result?.academic_session_id ?? null,

    total_score:
      result?.total_score ?? 0,

    average_score:
      result?.average_score ?? 0,

    gpa:
      result?.gpa ?? 0,

    cumulative_gpa:
      result?.cumulative_gpa ?? 0,

    position:
      result?.position ?? null,

    remarks:
      result?.remarks || "N/A",

    is_locked:
      result?.is_locked ?? false,

    published:
      result?.published ?? false,

    subjects: Array.isArray(result?.subjects)
      ? result.subjects
          .map(normalizeSubject)
          .filter(Boolean)
      : [],
  };
};

// ======================================================
// GET STUDENT RESULT
// Latest published result
// GET /students/{id}/result
//
// Specific session & term
// GET /students/{id}/result/{session_id}/{term_id}
// ======================================================
export const getStudentResult = async (
  studentId,
  sessionId = null,
  termId = null
) => {
  try {
    if (!studentId)
      throw new Error("Student ID is required");

    let endpoint = `/${studentId}/result`;

    if (sessionId && termId) {
      endpoint = `/${studentId}/result/${sessionId}/${termId}`;
    }

    const res = await API.get(endpoint);

    return normalizeResult(res?.data);
  } catch (e) {
    handleServiceError(
      `Fetching result for student ${studentId}`,
      e
    );
  }
};

export const getResult = getStudentResult;

// ======================================================
// GET TRANSCRIPT
//
// Backend has NO transcript endpoint.
// Use latest result endpoint until transcript CRUD exists.
// ======================================================
export const getStudentTranscript = async (
  studentId
) => {
  try {
    if (!studentId)
      throw new Error("Student ID is required");

    const res = await API.get(
      `/${studentId}/result`
    );

    return res.data;
  } catch (e) {
    handleServiceError(
      `Fetching transcript for student ${studentId}`,
      e
    );
  }
};

export const getTranscript =
  getStudentTranscript;

// ======================================================
// PRINT RESULT
//
// Latest result
// GET /students/{id}/result/print
//
// Specific session & term
// GET /students/{id}/result/{session_id}/{term_id}/print
// ======================================================
export const printStudentResult = async (
  studentId,
  sessionId = null,
  termId = null
) => {
  try {
    if (!studentId)
      throw new Error("Student ID is required");

    let endpoint = `/${studentId}/result/print`;

    if (sessionId && termId) {
      endpoint = `/${studentId}/result/${sessionId}/${termId}/print`;
    }

    const response = await API.get(
      endpoint,
      {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    return new Blob(
      [response.data],
      {
        type: "application/pdf",
      }
    );
  } catch (e) {
    handleServiceError(
      `Printing result for student ${studentId}`,
      e
    );
  }
};

// ======================================================
// PRINT TRANSCRIPT
// Backend route exists
// ======================================================
export const printStudentTranscript = async (
  studentId
) => {
  try {
    if (!studentId)
      throw new Error("Student ID is required");

    const response = await API.get(
      `/${studentId}/transcript/print`,
      {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    return new Blob(
      [response.data],
      {
        type: "application/pdf",
      }
    );
  } catch (e) {
    handleServiceError(
      `Printing transcript for student ${studentId}`,
      e
    );
  }
};

// ======================================================
// RESULT STATUS ACTIONS
// ======================================================
export const publishResult = async (
  termId
) => {
  try {
    const res = await API.patch(
      `/terms/${termId}/publish`
    );

    return res.data;
  } catch (e) {
    handleServiceError(
      `Publishing result for term ${termId}`,
      e
    );
  }
};

// ======================================================
export const lockResult = async (
  termId
) => {
  try {
    const res = await API.patch(
      `/terms/${termId}/close`
    );

    return res.data;
  } catch (e) {
    handleServiceError(
      `Closing result for term ${termId}`,
      e
    );
  }
};

// ======================================================
export default {
  getStudentResult,
  getResult,
  getStudentTranscript,
  getTranscript,
  printStudentResult,
  printStudentTranscript,
  publishResult,
  lockResult,
};