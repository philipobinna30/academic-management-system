import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import { getAllStudents } from "../../services/studentService";
import { getTeachers } from "../../services/teacherService";
import { getCourses } from "../../services/courseService";
import { getSubjects } from "../../services/subjectService";
import { getAllOnlineClasses } from "../../services/onlineClassService";

// ======================================================
// SAFE LENGTH HELPER
// ======================================================
const safeLength = (data) => {
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data?.items)) return data.items.length;
  if (Array.isArray(data?.data)) return data.data.length;
  if (Array.isArray(data?.results)) return data.results.length;
  return 0;
};

// ======================================================
// DEFAULT DASHBOARD STATS
// ======================================================
const defaultStats = [
  { title: "Students", value: 0, color: "#2563eb" },
  { title: "Teachers", value: 0, color: "#059669" },
  { title: "Courses", value: 0, color: "#d97706" },
  { title: "Subjects", value: 0, color: "#7c3aed" },
  { title: "Results", value: "Per Student", color: "#dc2626" },
  { title: "Online Classes", value: 0, color: "#0891b2" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(false);

  // ======================================================
  // FETCH DASHBOARD STATS
  // ======================================================
  const fetchStats = async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        getAllStudents(),
        getTeachers(),
        getCourses(),
        getSubjects(),
        getAllOnlineClasses(),
      ]);

      const students =
        results[0].status === "fulfilled"
          ? results[0].value
          : [];

      const teachers =
        results[1].status === "fulfilled"
          ? results[1].value
          : [];

      const courses =
        results[2].status === "fulfilled"
          ? results[2].value
          : [];

      const subjects =
        results[3].status === "fulfilled"
          ? results[3].value
          : [];

      const onlineClasses =
        results[4].status === "fulfilled"
          ? results[4].value
          : [];

      // Log failures without crashing dashboard
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Dashboard API ${index + 1} failed:`,
            result.reason
          );
        }
      });

      setStats([
        {
          title: "Students",
          value: safeLength(students),
          color: "#2563eb",
        },
        {
          title: "Teachers",
          value: safeLength(teachers),
          color: "#059669",
        },
        {
          title: "Courses",
          value: safeLength(courses),
          color: "#d97706",
        },
        {
          title: "Subjects",
          value: safeLength(subjects),
          color: "#7c3aed",
        },
        {
          title: "Results",
          value: "Per Student",
          color: "#dc2626",
        },
        {
          title: "Online Classes",
          value: safeLength(onlineClasses),
          color: "#0891b2",
        },
      ]);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);

      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
          Admin Dashboard
        </h1>

        <p style={{ color: "#6b7280" }}>
          {loading
            ? "Loading system data..."
            : "Welcome to the Academic Management System"}
        </p>
      </div>

      {/* DASHBOARD CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {stats.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            color={item.color}
          />
        ))}
      </div>

      {/* SYSTEM OVERVIEW */}
      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>
          System Overview
        </h2>

        <p
          style={{
            lineHeight: "1.7",
            color: "#4b5563",
          }}
        >
          Use the sidebar navigation to manage students,
          teachers, courses, subjects, scores, academic
          terms, sessions, transcripts, and online classes.
        </p>
      </div>
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
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        borderLeft: `6px solid ${color}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          marginBottom: "10px",
          color: "#374151",
        }}
      >
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
};

export default AdminDashboard;