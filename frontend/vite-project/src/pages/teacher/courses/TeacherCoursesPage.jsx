import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import { getTeacherCourses } from "../../../services/teacherService";

// ======================================================
// CONTEXT
// ======================================================
import { useAuth } from "../../../context/AuthContext";

// ======================================================
// COMPONENTS
// ======================================================
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * Teacher Courses Page
 *
 * Backend:
 * GET /teachers/{teacher_id}/courses
 *
 * Returns:
 * [
 *   {
 *     id,
 *     name,
 *     description,
 *     teacher_id,
 *     subjects:[]
 *   }
 * ]
 */

const TeacherCoursesPage = () => {
  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // FETCH COURSES
  // ======================================================
  const fetchCourses = async () => {
    if (!user?.user_id) return;

    setLoading(true);

    try {
      setErrorMsg("");

      console.log(
        "Loading courses for teacher:",
        user.user_id
      );

      const data = await getTeacherCourses(
        user.user_id
      );

      console.log("Teacher courses:", data);

      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load courses:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load assigned courses"
      );

      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INIT
  // ======================================================
  useEffect(() => {
    fetchCourses();
  }, [user?.user_id]);

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return <Loader />;
  }

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: "25px" }}>
        <h2>My Courses</h2>

        <p style={{ color: "#6b7280" }}>
          Courses assigned to you.
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <ErrorMessage message={errorMsg} />
      )}

      {/* EMPTY */}
      {!loading &&
        !errorMsg &&
        courses.length === 0 && (
          <p>No courses assigned yet.</p>
        )}

      {/* TABLE */}
      {courses.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Description</th>
              <th>Subjects</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>

                <td>
                  {course.name || "N/A"}
                </td>

                <td>
                  {course.description || "N/A"}
                </td>

                <td>
                  {Array.isArray(
                    course.subjects
                  )
                    ? course.subjects.length
                    : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* ======================================================
   STYLES
====================================================== */

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default TeacherCoursesPage;