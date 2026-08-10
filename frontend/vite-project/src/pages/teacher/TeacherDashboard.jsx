import React, {
  useEffect,
  useState,
} from "react";

import "./TeacherDashboard.css";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacher,
  getTeacherCourses,
  getTeacherStudents,
  getTeacherScores,
  getTeacherOnlineClasses,
} from "../../services/teacherService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

/**
 * ======================================================
 * Teacher Dashboard
 * ======================================================
 */

const TeacherDashboard = () => {
  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================

  const teacherId =
    Number(user?.user_id ?? user?.id);

  // ======================================================
  // STATE
  // ======================================================

  const [teacher, setTeacher] =
    useState(null);

  const [courses, setCourses] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [scores, setScores] =
    useState([]);

  const [onlineClasses, setOnlineClasses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  useEffect(() => {
    if (teacherId) {
      fetchDashboardData();
    }
  }, [teacherId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // ==================================================
      // VALIDATE TEACHER ID
      // ==================================================

      if (!teacherId) {
        setErrorMsg(
          "Teacher ID not found."
        );

        return;
      }

      // ==================================================
      // FETCH DASHBOARD DATA
      // ==================================================

      const results =
        await Promise.allSettled([
          getTeacher(teacherId),

          getTeacherCourses(
            teacherId
          ),

          getTeacherStudents(
            teacherId
          ),

          getTeacherScores(
            teacherId
          ),

          getTeacherOnlineClasses(
            teacherId
          ),
        ]);

      const [
        teacherRes,
        courseRes,
        studentRes,
        scoreRes,
        onlineRes,
      ] = results;

      // ==================================================
      // TEACHER
      // ==================================================

      if (
        teacherRes.status ===
        "fulfilled"
      ) {
        setTeacher(
          teacherRes.value
        );
      } else {
        console.error(
          "Teacher request failed:",
          teacherRes.reason
        );

        setTeacher(null);
      }

      // ==================================================
      // COURSES
      // ==================================================

      if (
        courseRes.status ===
          "fulfilled" &&
        Array.isArray(
          courseRes.value
        )
      ) {
        setCourses(
          courseRes.value
        );
      } else {
        console.error(
          "Courses request failed:",
          courseRes.reason
        );

        setCourses([]);
      }

      // ==================================================
      // STUDENTS
      // ==================================================

      if (
        studentRes.status ===
          "fulfilled" &&
        Array.isArray(
          studentRes.value
        )
      ) {
        setStudents(
          studentRes.value
        );
      } else {
        console.error(
          "Students request failed:",
          studentRes.reason
        );

        setStudents([]);
      }

      // ==================================================
      // SCORES
      // ==================================================

      if (
        scoreRes.status ===
          "fulfilled" &&
        Array.isArray(
          scoreRes.value
        )
      ) {
        setScores(
          scoreRes.value
        );
      } else {
        console.error(
          "Scores request failed:",
          scoreRes.reason
        );

        setScores([]);
      }

      // ==================================================
      // ONLINE CLASSES
      // ==================================================

      if (
        onlineRes.status ===
          "fulfilled" &&
        Array.isArray(
          onlineRes.value
        )
      ) {
        setOnlineClasses(
          onlineRes.value
        );
      } else {
        console.error(
          "Online classes request failed:",
          onlineRes.reason
        );

        setOnlineClasses([]);
      }

    } catch (error) {
      console.error(
        "Dashboard load error:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load dashboard."
      );

    } finally {
      setLoading(false);
    }
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
    <div className="teacher-dashboard">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="teacher-dashboard-header">

        <div>

          <h1>
            Teacher Dashboard
          </h1>

          <p>
            Welcome{" "}
            {teacher?.full_name ||
              user?.full_name ||
              "Teacher"}
          </p>

        </div>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* ==================================================
          DASHBOARD STATS
      ================================================== */}

      <div className="teacher-dashboard-grid">

        <DashboardCard
          title="Courses"
          value={courses.length}
          color="#2563eb"
        />

        <DashboardCard
          title="Students"
          value={students.length}
          color="#059669"
        />

        <DashboardCard
          title="Scores"
          value={scores.length}
          color="#f59e0b"
        />

        <DashboardCard
          title="Online Classes"
          value={onlineClasses.length}
          color="#7c3aed"
        />

      </div> 
       jsx
      {/* ==================================================
          COURSE OVERVIEW
      ================================================== */}

      {courses.length > 0 && (
        <div className="teacher-dashboard-section">

          <div className="section-header">

            <h2>
              My Courses
            </h2>

            <span>
              {courses.length} Assigned
            </span>

          </div>

          <div className="course-grid">

            {courses.map((course) => (
              <div
                key={course.id}
                className="course-card"
              >

                <div className="course-card-header">

                  <h3>
                    {course.name ||
                      "Untitled Course"}
                  </h3>

                  <span className="course-id">
                    #{course.id}
                  </span>

                </div>

                <p className="course-description">
                  {course.description ||
                    "No description available."}
                </p>

                <div className="course-footer">

                  <span>
                    Subjects:{" "}
                    {Array.isArray(
                      course.subjects
                    )
                      ? course.subjects.length
                      : 0}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* ==================================================
          UPCOMING ONLINE CLASSES
      ================================================== */}

      {onlineClasses.length > 0 && (
        <div className="teacher-dashboard-section">

          <div className="section-header">

            <h2>
              Upcoming Online Classes
            </h2>

            <span>
              {onlineClasses.length} Total
            </span>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>

                <tr>

                  <th>
                    Title
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Start Time
                  </th>

                  <th>
                    End Time
                  </th>

                  <th>
                    Meeting
                  </th>

                </tr>

              </thead>

              <tbody>

                {onlineClasses
                  .slice(0, 5)
                  .map((item) => (

                    <tr
                      key={item.id}
                    >

                      <td>
                        {item.title ||
                          "Untitled Class"}
                      </td>

                      <td>
                        {item.subject?.name ||
                          item.subject_name ||
                          item.subject_id ||
                          "N/A"}
                      </td>

                      <td>
                        {item.start_time
                          ? new Date(
                              item.start_time
                            ).toLocaleString()
                          : "N/A"}
                      </td>

                      <td>
                        {item.end_time
                          ? new Date(
                              item.end_time
                            ).toLocaleString()
                          : "N/A"}
                      </td>

                      <td>

                        {item.meeting_link ? (

                          <a
                            href={
                              item.meeting_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meeting-link"
                          >
                            Join
                          </a>

                        ) : (

                          <span className="muted">
                            No Link
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
};

// ======================================================
// DASHBOARD CARD
// ======================================================

const DashboardCard = ({
  title,
  value,
  color,
}) => {

  return (
    <div
      className="dashboard-card"
      style={{
        borderTop: `4px solid ${color}`,
      }}
    >

      <h3>
        {title}
      </h3>

      <p
        style={{
          color,
        }}
      >
        {value}
      </p>

    </div>
  );
};

// ======================================================
// EXPORT
// ======================================================

export default TeacherDashboard;
