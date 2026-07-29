import React, { useEffect, useState } from "react";
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
 * Teacher Dashboard (UPDATED)
 *
 * Fully aligned with:
 * - Teacher CRUD endpoints
 * - Normalized teacher service layer
 * - Backend response consistency
 * ======================================================
 */

const TeacherDashboard = () => {
  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================
  const teacherId = Number(user?.user_id ?? user?.id);

  // ======================================================
  // STATE
  // ======================================================
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [scores, setScores] =useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

      if (!teacherId) {
        setErrorMsg("Teacher ID not found");
        return;
      }

      // ======================================================
      // PARALLEL FETCH
      // ======================================================
      const results = await Promise.allSettled([
        getTeacher(teacherId),
        getTeacherCourses(teacherId),
        getTeacherStudents(teacherId),
        getTeacherScores(teacherId),
        getTeacherOnlineClasses(teacherId),
      ]);

      const [
        teacherRes,
        courseRes,
        studentRes,
        scoreRes,
        onlineRes,
      ] = results;

      // ======================================================
      // TEACHER
      // ======================================================
      if (teacherRes.status === "fulfilled") {
        setTeacher(teacherRes.value);
      } else {
        console.error("Teacher:", teacherRes.reason);
        setTeacher(null);
      }

      // ======================================================
      // COURSES
      // ======================================================
      if (
        courseRes.status === "fulfilled" &&
        Array.isArray(courseRes.value)
      ) {
        setCourses(courseRes.value);
      } else {
        console.error("Courses:", courseRes.reason);
        setCourses([]);
      }

      // ======================================================
      // STUDENTS
      // ======================================================
      if (
        studentRes.status === "fulfilled" &&
        Array.isArray(studentRes.value)
      ) {
        setStudents(studentRes.value);
      } else {
        console.error("Students:", studentRes.reason);
        setStudents([]);
      }

      // ======================================================
      // SCORES
      // ======================================================
      if (
        scoreRes.status === "fulfilled" &&
        Array.isArray(scoreRes.value)
      ) {
        setScores(scoreRes.value);
      } else {
        console.error("Scores:", scoreRes.reason);
        setScores([]);
      }

      // ======================================================
      // ONLINE CLASSES
      // ======================================================
      if (
        onlineRes.status === "fulfilled" &&
        Array.isArray(onlineRes.value)
      ) {
        setOnlineClasses(onlineRes.value);
      } else {
        console.error("Online Classes:", onlineRes.reason);
        setOnlineClasses([]);
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
      setErrorMsg(error?.message || "Failed to load dashboard");
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
  // UI
  // ======================================================
  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
        >
          Teacher Dashboard
        </h1>

        <p style={{ color: "#6b7280" }}>
          Welcome{" "}
          {teacher?.full_name ||
            user?.full_name ||
            "Teacher"}
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <ErrorMessage message={errorMsg} />
      )}

      {/* STATS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px,1fr))",
          gap: "20px",
        }}
      >
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

      {/* COURSES */}
      {courses.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            My Courses
          </h2>

          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                padding: "12px 0",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <h3>
                {course.name ||
                  "Untitled Course"}
              </h3>

              <p
                style={{
                  color: "#6b7280",
                }}
              >
                {course.description ||
                  "No description"}
              </p>

              <small>
                Subjects:{" "}
                {Array.isArray(
                  course.subjects
                )
                  ? course.subjects.length
                  : 0}
              </small>
            </div>
          ))}
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
}) => (
  <div
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      borderLeft: `6px solid ${color}`,
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ marginBottom: "10px" }}>
      {title}
    </h3>

    <p
      style={{
        fontSize: "28px",
        fontWeight: "bold",
        color,
      }}
    >
      {value}
    </p>
  </div>
);

export default TeacherDashboard;