import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./TeacherStudents.css";

// ======================================================
// CONTEXT
// ======================================================

import {
  useAuth,
} from "../../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherStudents,
} from "../../../services/teacherService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// TEACHER STUDENTS
// ======================================================

const TeacherStudents = () => {

  const navigate = useNavigate();

  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ======================================================
  // CURRENT TEACHER
  // ======================================================

  const teacherId =
    user?.user_id ||
    user?.id;

  // ======================================================
  // FETCH STUDENTS
  // ======================================================

  const fetchStudents =
    async () => {

      if (!teacherId) return;

      try {

        setLoading(true);
        setErrorMsg("");

        const data =
          await getTeacherStudents(
            teacherId
          );

        setStudents(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(error);

        setErrorMsg(
          error?.message ||
            "Failed to load students."
        );

        setStudents([]);

      } finally {

        setLoading(false);

      }

    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    fetchStudents();

  }, [teacherId]);

  // ======================================================
  // FILTERED STUDENTS
  // ======================================================

  const filteredStudents =
    useMemo(() => {

      const keyword =
        search.toLowerCase();

      return students.filter(
        (student) => {

          const userInfo =
            student.user || {};

          const course =
            student.course || {};

          return (

            String(student.id)
              .includes(keyword)

            ||

            (userInfo.full_name ||
              student.full_name ||
              "")
              .toLowerCase()
              .includes(keyword)

            ||

            (userInfo.email ||
              student.email ||
              "")
              .toLowerCase()
              .includes(keyword)

            ||

            (course.name ||
              student.course_name ||
              "")
              .toLowerCase()
              .includes(keyword)

          );

        }
      );

    }, [students, search]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const activeStudents =
    students.filter(
      (student) =>
        student.user?.is_active !== false
    ).length;

  const inactiveStudents =
    students.length -
    activeStudents;

  // ======================================================
  // VIEW PROFILE
  // ======================================================

  const handleView =
    (studentId) => {

      if (!studentId) return;

      navigate(
        `/teacher/students/${studentId}`
      );

    };

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

    <div className="teacher-students-page">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="teacher-students-header">

        <div>

          <h1>
            My Students
          </h1>

          <p>
            View students assigned to your courses,
            monitor academic performance and access
            individual student profiles.
          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <div className="student-summary">

        <div className="summary-card">

          <h3>
            Total Students
          </h3>

          <span>
            {students.length}
          </span>

        </div>

        <div className="summary-card active">

          <h3>
            Active
          </h3>

          <span>
            {activeStudents}
          </span>

        </div>

        <div className="summary-card inactive">

          <h3>
            Inactive
          </h3>

          <span>
            {inactiveStudents}
          </span>

        </div>

      </div>

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <div className="student-toolbar">

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {errorMsg && (

        <ErrorMessage
          message={errorMsg}
        />

      )}

      {/* ====================================================== */}
      {/* EMPTY */}
      {/* ====================================================== */}

      {!loading &&
        !errorMsg &&
        filteredStudents.length === 0 && (

          <div className="empty-state">

            <h3>
              No Students Found
            </h3>

            <p>

              There are no students assigned
              to your courses yet.

            </p>

          </div>

        )}

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      {!loading &&
        filteredStudents.length > 0 && (

          <div className="table-wrapper">

            <table className="students-table">

              <thead>

                <tr>

                  <th>Profile ID</th>

                  <th>Name</th>

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

                {filteredStudents.map(
                  (student) => {

                    const userInfo =
                      student.user || {};

                    const course =
                      student.course || {};

                    return (

                      <tr
                        key={student.id}
                      >

                        <td>

                          {student.id}

                        </td>

                        <td>

                          {userInfo.full_name ||
                            student.full_name ||
                            "N/A"}

                        </td>

                        <td>

                          {userInfo.email ||
                            student.email ||
                            "N/A"}

                        </td>

                        <td>

                          {course.name ||
                            student.course_name ||
                            "N/A"}

                        </td>

                        <td>

                          {student.total_score ?? 0}

                        </td>

                        <td>

                          {student.average_score ?? 0}

                        </td>

                        <td>

                          {student.gpa ?? 0}

                        </td>

                        <td>

                          {student.position ??
                            "-"}

                        </td>

                        <td>

                          <span
                            className={
                              userInfo.is_active ===
                              false
                                ? "status-badge inactive"
                                : "status-badge active"
                            }
                          >

                            {userInfo.is_active ===
                            false
                              ? "Inactive"
                              : "Active"}

                          </span>

                        </td>

                        <td>

                          <button
                            className="view-btn"
                            onClick={() =>
                              handleView(
                                student.id
                              )
                            }
                          >

                            View Profile

                          </button>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

    </div>

  );

};

export default TeacherStudents;