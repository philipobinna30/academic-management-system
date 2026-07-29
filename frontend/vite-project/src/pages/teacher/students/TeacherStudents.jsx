import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { getTeacherStudents } from "../../../services/teacherService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * Teacher Students
 * Fully aligned with FastAPI backend + teacherService normalization
 */

const TeacherStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // FETCH STUDENTS
  // ======================================================
  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const teacherId = user?.user_id || user?.id;

      if (!teacherId) {
        throw new Error("Teacher ID not found.");
      }

      const data = await getTeacherStudents(teacherId);

      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load students:", error);

      setErrorMsg(
        error?.message || "Failed to load students."
      );

      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // VIEW PROFILE
  // ======================================================
  const handleView = (studentId) => {
    if (!studentId) return;

    navigate(`/teacher/students/${studentId}`);
  };

  // ======================================================
  // LOADING STATE
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
      <div style={{ marginBottom: 20 }}>
        <h2>My Students</h2>

        <p style={{ color: "#6b7280" }}>
          View students assigned to your courses.
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <ErrorMessage message={errorMsg} />
      )}

      {/* EMPTY STATE */}
      {!loading && students.length === 0 && !errorMsg && (
        <p>No students found.</p>
      )}

      {/* TABLE */}
      {students.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Profile ID</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Total Score</th>
              <th>Average</th>
              <th>GPA</th>
              <th>Position</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const user = student?.user || {};
              const course = student?.course || {};

              return (
                <tr key={student.id}>
                  <td>{student.id}</td>

                  <td>
                    {user.full_name ||
                      student.full_name ||
                      "N/A"}
                  </td>

                  <td>
                    {user.email ||
                      student.email ||
                      "N/A"}
                  </td>

                  <td>
                    {course.name ||
                      student.course_name ||
                      "N/A"}
                  </td>

                  <td>{student.total_score ?? 0}</td>

                  <td>{student.average_score ?? 0}</td>

                  <td>{student.gpa ?? 0}</td>

                  <td>{student.position ?? "-"}</td>

                  <td>
                    {user.is_active === false
                      ? "Inactive"
                      : "Active"}
                  </td>

                  <td>
                    <button
                      onClick={() => handleView(student.id)}
                      style={buttonStyle}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const buttonStyle = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "4px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

export default TeacherStudents;