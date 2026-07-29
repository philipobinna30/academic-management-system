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
const BASE = "/teachers";

// ======================================================
// SAFE EXTRACTOR
// ======================================================
const extractData = (res) => {
  return res?.data?.data ?? res?.data ?? null;
};

// ======================================================
// NORMALIZE TEACHER
// ======================================================
const normalizeTeacher = (teacher) => {
  if (!teacher) return null;

  return {
    id: teacher.id,
    full_name: teacher.full_name || "",
    email: teacher.email || "",
    role: teacher.role || "teacher",
    is_active: teacher.is_active ?? true,
    is_verified: teacher.is_verified ?? false,
    permissions: teacher.permissions || [],
  };
};

// ======================================================
// NORMALIZE COURSE
// ======================================================
const normalizeCourse = (course) => {
  if (!course) return null;

  return {
    id: course.id,
    name: course.name || "",
    description: course.description || "",
    teacher_id: course.teacher_id ?? null,
    subjects: Array.isArray(course.subjects)
      ? course.subjects
      : [],
  };
};

// ======================================================
// NORMALIZE STUDENT
// ======================================================
const normalizeStudent = (student) => {
  if (!student) return null;

  return {
    id: student.id,
    user_id: student.user_id,
    parent_id: student.parent_id,
    course_id: student.course_id,

    total_score: student.total_score ?? 0,
    average_score: student.average_score ?? 0,
    gpa: student.gpa ?? 0,
    position: student.position ?? null,
    remarks: student.remarks ?? "",

    user: student.user || null,
    course: student.course || null,
  };
};

// ======================================================
// CREATE TEACHER
// ======================================================
export const createTeacher = async (data) => {
  try {
    const res = await API.post(BASE, data);
    return normalizeTeacher(extractData(res));
  } catch (error) {
    handleServiceError("Creating teacher", error);
  }
};

// ======================================================
// GET ALL TEACHERS
// ======================================================
export const getTeachers = async (
  search = "",
  skip = 0,
  limit = 20
) => {
  try {
    const res = await API.get(BASE, {
      params: {
        search: search || undefined,
        skip,
        limit,
      },
    });

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeTeacher)
      : [];
  } catch (error) {
    handleServiceError("Fetching teachers", error);
  }
};

// ======================================================
// GET SINGLE TEACHER
// ======================================================
export const getTeacher = async (teacherId) => {
  try {
    const res = await API.get(
      `${BASE}/${teacherId}`
    );

    return normalizeTeacher(extractData(res));
  } catch (error) {
    handleServiceError("Fetching teacher", error);
  }
};

// ======================================================
// UPDATE TEACHER
// ======================================================
export const updateTeacher = async (
  teacherId,
  data
) => {
  try {
    const res = await API.patch(
      `${BASE}/${teacherId}`,
      data
    );

    return normalizeTeacher(extractData(res));
  } catch (error) {
    handleServiceError("Updating teacher", error);
  }
};

// ======================================================
// DELETE TEACHER
// ======================================================
export const deleteTeacher = async (
  teacherId
) => {
  try {
    const res = await API.delete(
      `${BASE}/${teacherId}`
    );

    return extractData(res);
  } catch (error) {
    handleServiceError("Deleting teacher", error);
  }
};

// ======================================================
// ASSIGN COURSE
// ======================================================
export const assignCourseToTeacher = async (
  teacherId,
  courseId
) => {
  try {
    const res = await API.patch(
      `${BASE}/${teacherId}/assign-course/${courseId}`
    );

    return extractData(res);
  } catch (error) {
    handleServiceError("Assigning course", error);
  }
};

// ======================================================
// REMOVE COURSE
// ======================================================
export const removeCourseFromTeacher = async (
  teacherId,
  courseId
) => {
  try {
    const res = await API.patch(
      `${BASE}/${teacherId}/remove-course/${courseId}`
    );

    return extractData(res);
  } catch (error) {
    handleServiceError("Removing course", error);
  }
};

// ======================================================
// GET TEACHER COURSES
// ======================================================
export const getTeacherCourses = async (
  teacherId
) => {
  try {
    const res = await API.get(
      `${BASE}/${teacherId}/courses`
    );

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeCourse)
      : [];
  } catch (error) {
    handleServiceError(
      "Fetching teacher courses",
      error
    );
  }
};

// ======================================================
// GET TEACHER STUDENTS
// ======================================================
export const getTeacherStudents = async (
  teacherId
) => {
  try {
    const res = await API.get(
      `${BASE}/${teacherId}/students`
    );

    const data = extractData(res);

    return Array.isArray(data)
      ? data.map(normalizeStudent)
      : [];
  } catch (error) {
    handleServiceError(
      "Fetching teacher students",
      error
    );
  }
};
// ======================================================
// GET SINGLE STUDENT PROFILE
// ======================================================
export const getTeacherStudentProfile = async (
  teacherId,
  studentId
) => {
  try {
    const res = await API.get(
      `${BASE}/${teacherId}/students/${studentId}`
    );

    return normalizeStudent(extractData(res));
  } catch (error) {
    handleServiceError(
      "Fetching student profile",
      error
    );
  }
};

// ======================================================
// GET TEACHER SCORES
// ======================================================
// ======================================================
// GET TEACHER SCORES
// ======================================================
export const getTeacherScores = async (
  teacherId,
  filters = {}
) => {
  try {
    const res = await API.get(
      `${BASE}/${teacherId}/scores`,
      {
        params: {
          course_id: filters.course_id,
          term_id: filters.term_id,
          subject_id: filters.subject_id,
          student_id: filters.student_id,
        },
      }
    );

    const data = extractData(res);

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    handleServiceError(
      "Fetching teacher scores",
      error
    );
  }
};
// ======================================================
// CREATE TEACHER SCORE
// ======================================================
export const createTeacherScore = async (
  teacherId,
  scoreData
) => {
  try {
    const res = await API.post(
      `${BASE}/${teacherId}/scores`,
      scoreData
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Creating teacher score",
      error
    );
  }
};

// ======================================================
// UPDATE TEACHER SCORE
// ======================================================
export const updateTeacherScore = async (
  teacherId,
  scoreId,
  updates
) => {
  try {
    const res = await API.patch(
      `${BASE}/${teacherId}/scores/${scoreId}`,
      updates
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Updating teacher score",
      error
    );
  }
};

// ======================================================
// DELETE TEACHER SCORE
// ======================================================
export const deleteTeacherScore = async (
  teacherId,
  scoreId
) => {
  try {
    const res = await API.delete(
      `${BASE}/${teacherId}/scores/${scoreId}`
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Deleting teacher score",
      error
    );
  }
};

// ======================================================
// BULK CREATE SCORES
// Matches:
// POST /teachers/{teacher_id}/scores/bulk
// ======================================================
export const teacherBulkCreateScores = async (
  teacherId,
  scores
) => {
  try {
    const res = await API.post(
      `${BASE}/${teacherId}/scores/bulk`,
      scores
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Creating bulk scores",
      error
    );
  }
};

// ======================================================
// BULK UPDATE SCORES
// (only if backend exposes it)
// PATCH /teachers/{teacher_id}/scores/bulk
// ======================================================
export const teacherBulkUpdateScores = async (
  teacherId,
  scores
) => {
  try {
    const res = await API.patch(
      `${BASE}/${teacherId}/scores/bulk`,
      scores
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Updating bulk scores",
      error
    );
  }
};

// ======================================================
// BULK DELETE SCORES
// (only if backend exposes it)
// ======================================================
export const teacherBulkDeleteScores = async (
  teacherId,
  scoreIds
) => {
  try {
    const res = await API.delete(
      `${BASE}/${teacherId}/scores/bulk`,
      {
        data: {
          score_ids: scoreIds,
        },
      }
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Deleting bulk scores",
      error
    );
  }
};

// ======================================================
// GET ONLINE CLASSES
// ======================================================
export const getTeacherOnlineClasses = async (
  teacherId
) => {
  try {
    const res = await API.get(
      `${BASE}/${teacherId}/online-classes`
    );

    const data = extractData(res);

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    handleServiceError(
      "Fetching teacher online classes",
      error
    );
  }
};

// ======================================================
// CREATE ONLINE CLASS
// ======================================================
export const createTeacherOnlineClass = async (
  teacherId,
  classData
) => {
  try {
    const res = await API.post(
      `${BASE}/${teacherId}/online-classes`,
      classData
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Creating online class",
      error
    );
  }
};

// ======================================================
// UPDATE ONLINE CLASS
// ======================================================
export const updateTeacherOnlineClass = async (
  teacherId,
  classId,
  updates
) => {
  try {
    const res = await API.patch(
      `${BASE}/${teacherId}/online-classes/${classId}`,
      updates
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Updating online class",
      error
    );
  }
};

// ======================================================
// DELETE ONLINE CLASS
// ======================================================
export const deleteTeacherOnlineClass = async (
  teacherId,
  classId
) => {
  try {
    const res = await API.delete(
      `${BASE}/${teacherId}/online-classes/${classId}`
    );

    return extractData(res);
  } catch (error) {
    handleServiceError(
      "Deleting online class",
      error
    );
  }
};

// ======================================================
// FRONTEND COMPATIBILITY ALIASES
// ======================================================
export const teacherCreateScore =
  createTeacherScore;

export const teacherUpdateScore =
  updateTeacherScore;

export const teacherDeleteScore =
  deleteTeacherScore;

// ======================================================
// EXPORT COLLECTION
// ======================================================
const teacherService = {
  // ======================================================
  // TEACHER CRUD
  // ======================================================
  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,

  // ======================================================
  // COURSE MANAGEMENT
  // ======================================================
  assignCourseToTeacher,
  removeCourseFromTeacher,
  getTeacherCourses,

  // ======================================================
  // STUDENT MANAGEMENT
  // ======================================================
  getTeacherStudents,
  getTeacherStudentProfile,

  // ======================================================
  // SCORE CRUD
  // ======================================================
  getTeacherScores,
  createTeacherScore,
  updateTeacherScore,
  deleteTeacherScore,

  // ======================================================
  // BULK SCORE CRUD
  // ======================================================
  teacherBulkCreateScores,
  teacherBulkUpdateScores,
  teacherBulkDeleteScores,

  // ======================================================
  // ONLINE CLASS CRUD
  // ======================================================
  getTeacherOnlineClasses,
  createTeacherOnlineClass,
  updateTeacherOnlineClass,
  deleteTeacherOnlineClass,

  // ======================================================
  // FRONTEND COMPATIBILITY ALIASES
  // ======================================================
  teacherCreateScore,
  teacherUpdateScore,
  teacherDeleteScore,
};

// ======================================================
// DEFAULT EXPORT
// ======================================================
export default teacherService;