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
// SAFE EXTRACTOR
// ======================================================
const extractData = (response) => {
  return (
    response?.data?.data ??
    response?.data?.results ??
    response?.data ??
    []
  );
};

// ======================================================
// NORMALIZE COURSE
// ======================================================
const normalizeCourse = (course) => {
  if (!course) return null;

  return {
    id: course?.id ?? null,

    name:
      course?.name ||
      course?.course_name ||
      "",

    description:
      course?.description || "",

    teacher_id:
      course?.teacher_id ??
      course?.teacher?.id ??
      null,

    teacher:
      course?.teacher ?? null,

    subjects: Array.isArray(
      course?.subjects
    )
      ? course.subjects
      : [],
  };
};

// ======================================================
// CREATE COURSE
// POST /courses
// ======================================================
export const createCourse = async (
  courseData
) => {
  try {
    const response = await API.post(
      "/courses/",
      courseData
    );

    return normalizeCourse(
      extractData(response)
    );
  } catch (error) {
    handleServiceError(
      "Creating course",
      error
    );
  }
};

// ======================================================
// GET ALL COURSES
// GET /courses
// ======================================================
export const getCourses = async () => {
  try {
    const response = await API.get(
      "/courses"
    );

    const data =
      extractData(response);

    return Array.isArray(data)
      ? data
          .map(normalizeCourse)
          .filter(Boolean)
      : [];
  } catch (error) {
    handleServiceError(
      "Fetching courses",
      error
    );
  }
};

export const getAllCourses =
  getCourses;

// ======================================================
// GET COURSE BY ID
// GET /courses/{courseId}
// ======================================================
export const getCourseById = async (
  courseId
) => {
  try {
    const response = await API.get(
      `/courses/${courseId}`
    );

    return normalizeCourse(
      extractData(response)
    );
  } catch (error) {
    handleServiceError(
      `Fetching course ${courseId}`,
      error
    );
  }
};

// ======================================================
// GET COURSES BY TEACHER
// GET /teachers/{teacherId}/courses
// ======================================================
export const getCoursesByTeacher =
  async (teacherId) => {
    try {
      const response =
        await API.get(
          `/teachers/${teacherId}/courses`
        );

      const data =
        extractData(response);

      return Array.isArray(data)
        ? data
            .map(normalizeCourse)
            .filter(Boolean)
        : [];
    } catch (error) {
      handleServiceError(
        `Fetching teacher courses ${teacherId}`,
        error
      );
    }
  };

// ======================================================
// UPDATE COURSE
// PATCH /courses/{courseId}
// ======================================================
export const updateCourse = async (
  courseId,
  updateData
) => {
  try {
    const response =
      await API.patch(
        `/courses/${courseId}`,
        updateData
      );

    return normalizeCourse(
      extractData(response)
    );
  } catch (error) {
    handleServiceError(
      `Updating course ${courseId}`,
      error
    );
  }
};

// ======================================================
// DELETE COURSE
// DELETE /courses/{courseId}
// ======================================================
export const deleteCourse = async (
  courseId
) => {
  try {
    const response =
      await API.delete(
        `/courses/${courseId}`
      );

    return response?.data;
  } catch (error) {
    handleServiceError(
      `Deleting course ${courseId}`,
      error
    );
  }
};

// ======================================================
// EXPORT
// ======================================================
const courseService = {
  createCourse,
  getCourses,
  getAllCourses,
  getCourseById,
  getCoursesByTeacher,
  updateCourse,
  deleteCourse,
};

export default courseService;