import React, {
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherCourses,
  assignCourseToTeacher,
  removeCourseFromTeacher,
} from "../../../services/teacherService";

import { getCourses } from "../../../services/courseService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * ======================================================
 * TEACHER COURSES
 * Fully aligned with backend routes
 *
 * GET    /teachers/{teacher_id}/courses
 * PATCH  /teachers/{teacher_id}/assign-course/{course_id}
 * PATCH  /teachers/{teacher_id}/remove-course/{course_id}
 * ======================================================
 */

const TeacherCourses = () => {
  const { teacherId } = useParams();

  // ======================================================
  // STATE
  // ======================================================

  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [selectedCourseId, setSelectedCourseId] =
    useState("");

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [
        teacherCourses,
        allCoursesData,
      ] = await Promise.all([
        getTeacherCourses(teacherId),
        getCourses(),
      ]);

      setCourses(
        Array.isArray(teacherCourses)
          ? teacherCourses
          : []
      );

      setAllCourses(
        Array.isArray(allCoursesData)
          ? allCoursesData
          : []
      );
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to load teacher courses"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INIT
  // ======================================================

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  // ======================================================
  // AVAILABLE COURSES
  // ======================================================

  const availableCourses =
    allCourses.filter(
      (course) => !course.teacher_id
    );

  // ======================================================
  // ASSIGN COURSE
  // ======================================================

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) return;

    try {
      setSubmitting(true);
      setErrorMsg("");

      await assignCourseToTeacher(
        Number(teacherId),
        Number(selectedCourseId)
      );

      alert(
        "Course assigned successfully"
      );

      setSelectedCourseId("");

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to assign course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // REMOVE COURSE
  // ======================================================

  const handleRemove = async (
    courseId
  ) => {
    const confirmed =
      window.confirm(
        "Remove this course from the teacher?"
      );

    if (!confirmed) return;

    try {
      setErrorMsg("");

      await removeCourseFromTeacher(
        Number(teacherId),
        Number(courseId)
      );

      alert(
        "Course removed successfully"
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to remove course"
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h2>Teacher Courses</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Manage courses assigned to
          Teacher ID{" "}
          <strong>{teacherId}</strong>
        </p>
      </div>

      {/* ASSIGN FORM */}

      <form
        onSubmit={handleAssign}
        style={formStyle}
      >
        <select
          value={selectedCourseId}
          onChange={(e) =>
            setSelectedCourseId(
              e.target.value
            )
          }
          required
        >
          <option value="">
            Select Course
          </option>

          {availableCourses.map(
            (course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.name}
              </option>
            )
          )}
        </select>

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Assigning..."
            : "Assign Course"}
        </button>
      </form>

      {/* ERROR */}

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* CONTENT */}

      {loading ? (
        <Loader />
      ) : courses.length === 0 ? (
        <p>
          No courses assigned to this
          teacher.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Course</th>
              <th>Description</th>
              <th>Teacher ID</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>

                <td>{course.name}</td>

                <td>
                  {course.description ||
                    "N/A"}
                </td>

                <td>
                  {course.teacher_id ||
                    "N/A"}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(
                        course.id
                      )
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const formStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default TeacherCourses;