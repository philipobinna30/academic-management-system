import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaBookOpen,
  FaLaptop,
  FaClipboardList,
  FaArrowUp,
  FaBell,
  FaPlusCircle,
  FaDatabase,
  FaCheckCircle,
} from "react-icons/fa";

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
  {
    title: "Students",
    value: 0,
    color: "#2563eb",
    icon: <FaUserGraduate />,
  },
  {
    title: "Teachers",
    value: 0,
    color: "#059669",
    icon: <FaChalkboardTeacher />,
  },
  {
    title: "Courses",
    value: 0,
    color: "#d97706",
    icon: <FaBook />,
  },
  {
    title: "Subjects",
    value: 0,
    color: "#7c3aed",
    icon: <FaBookOpen />,
  },
  {
    title: "Results",
    value: "Per Student",
    color: "#dc2626",
    icon: <FaClipboardList />,
  },
  {
    title: "Online Classes",
    value: 0,
    color: "#0891b2",
    icon: <FaLaptop />,
  },
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
          icon: <FaUserGraduate />,
        },
        {
          title: "Teachers",
          value: safeLength(teachers),
          color: "#059669",
          icon: <FaChalkboardTeacher />,
        },
        {
          title: "Courses",
          value: safeLength(courses),
          color: "#d97706",
          icon: <FaBook />,
        },
        {
          title: "Subjects",
          value: safeLength(subjects),
          color: "#7c3aed",
          icon: <FaBookOpen />,
        },
        {
          title: "Results",
          value: "Per Student",
          color: "#dc2626",
          icon: <FaClipboardList />,
        },
        {
          title: "Online Classes",
          value: safeLength(onlineClasses),
          color: "#0891b2",
          icon: <FaLaptop />,
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
    <div className="admin-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-badge">
            <FaBell />
            MYAPO ADMIN PANEL
          </span>

          <h1>
            Welcome Back,
            <span> Administrator 👋</span>
          </h1>

          <p>
            {loading
              ? "Loading dashboard statistics..."
              : "Monitor students, teachers, courses, subjects, online classes and academic activities from one central dashboard."}
          </p>

        </div>

        <div className="dashboard-date">

          <h3>
            {new Date().toLocaleDateString()}
          </h3>

          <span>
            System Status
          </span>

          <div className="status-online">
            <FaCheckCircle />
            Online
          </div>

        </div>

      </div>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="quick-actions">

        <button>
          <FaPlusCircle />
          Add Student
        </button>

        <button>
          <FaPlusCircle />
          Add Teacher
        </button>

        <button>
          <FaPlusCircle />
          Add Course
        </button>

        <button>
          <FaPlusCircle />
          Publish Results
        </button>

      </div>

      {/* ======================================================
          DASHBOARD CARDS
      ====================================================== */}

      <div className="dashboard-grid">

        {stats.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            color={item.color}
            icon={item.icon}
          />
        ))}

      </div>

      {/* ======================================================
          DASHBOARD DETAILS
      ====================================================== */}

      <div className="dashboard-bottom">

        {/* ==========================
            SYSTEM OVERVIEW
        =========================== */}

        <div className="dashboard-panel">

          <h2>
            <FaDatabase />
            System Overview
          </h2>

          <p>
            Welcome to the MYAPO Academic Management System.
            This dashboard provides a centralized view of
            students, teachers, courses, subjects, online
            classes and academic records.
          </p>

          <div className="system-status">

            <div>
              <FaCheckCircle className="status-icon" />
              Backend Connected
            </div>

            <div>
              <FaCheckCircle className="status-icon" />
              Database Online
            </div>

            <div>
              <FaCheckCircle className="status-icon" />
              Authentication Active
            </div>

            <div>
              <FaCheckCircle className="status-icon" />
              Academic System Ready
            </div>

          </div>

        </div>

        {/* ==========================
            RECENT ACTIVITIES
        =========================== */}

        <div className="dashboard-panel">

          <h2>
            <FaArrowUp />
            Recent Activities
          </h2>

          <ul className="activity-list">

            <li>
              <FaCheckCircle />
              Dashboard loaded successfully.
            </li>

            <li>
              <FaCheckCircle />
              Student records synchronized.
            </li>

            <li>
              <FaCheckCircle />
              Teacher information available.
            </li>

            <li>
              <FaCheckCircle />
              Online classes synchronized.
            </li>

            <li>
              <FaCheckCircle />
              Academic records ready.
            </li>

          </ul>

        </div>

      </div>

      {/* ======================================================
          ADMIN TIPS
      ====================================================== */}

      <div className="dashboard-tips">

        <h2>Administrator Tips</h2>

        <div className="tips-grid">

          <div className="tip-card">
            <h3>Students</h3>
            <p>
              Keep student information updated to ensure
              accurate academic records.
            </p>
          </div>

          <div className="tip-card">
            <h3>Teachers</h3>
            <p>
              Assign teachers to courses before publishing
              academic results.
            </p>
          </div>

          <div className="tip-card">
            <h3>Results</h3>
            <p>
              Verify all uploaded scores before locking or
              publishing results.
            </p>
          </div>

          <div className="tip-card">
            <h3>Online Classes</h3>
            <p>
              Schedule classes early so students receive
              timely notifications.
            </p>
          </div>

        </div>

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
  icon,
}) => {
  return (
    <div
      className="dashboard-card"
      style={{
        borderTop: `5px solid ${color}`,
      }}
    >
      <div className="card-top">

        <div
          className="card-icon"
          style={{
            background: color,
          }}
        >
          {icon}
        </div>

        <div>

          <h3>{title}</h3>

          <p
            className="card-value"
            style={{
              color,
            }}
          >
            {value}
          </p>

        </div>

      </div>

      <div className="card-footer">

        <span>View Details</span>

        <FaArrowUp />

      </div>

    </div>
  );
};

export default AdminDashboard;