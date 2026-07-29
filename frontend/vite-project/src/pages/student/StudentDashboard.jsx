import React, { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================
import { getMyProfile } from "../../services/studentService";
import { getStudentResult } from "../../services/resultService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

/**
 * Student Dashboard
 * Fully aligned with backend response structure
 */

const StudentDashboard = () => {
  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // LOAD DATA
  // ======================================================
  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  // ======================================================
  // FETCH DASHBOARD
  // ======================================================
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // PROFILE
      const profileData = await getMyProfile();

      setProfile(profileData);

      // RESULT
      const profileId =
        profileData?.id ||
        user?.student_profile_id;

      if (profileId) {
        try {
          const response =
            await getStudentResult(profileId);

          const resultData =
            response?.data ||
            response?.result ||
            response ||
            null;

          setResult(resultData);
        } catch (err) {
          console.error(
            "Result fetch failed:",
            err
          );

          setResult(null);
        }
      }
    } catch (error) {
      console.error(
        "Dashboard load error:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DERIVED VALUES
  // ======================================================

  const subjects = Array.isArray(result?.subjects)
    ? result.subjects
    : [];

  const totalSubjects =
    result?.number_of_subjects ??
    subjects.length;

  const totalMarks =
    result?.total_score ??
    profile?.total_score ??
    0;

  const averageScore =
    result?.average_score ??
    profile?.average_score ??
    0;

  const gpa =
    result?.gpa ??
    profile?.gpa ??
    0;

  const position =
    result?.position ??
    profile?.position ??
    "N/A";

  const transcriptReady =
    result?.id ? "Ready" : "Not Ready";

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return <Loader />;
  }

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
          Student Dashboard
        </h1>

        <p style={{ color: "#6b7280" }}>
          Welcome{" "}
          {profile?.full_name ||
            result?.student_name ||
            "Student"}
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <ErrorMessage message={errorMsg} />
      )}

      {/* DASHBOARD CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <DashboardCard
          title="Subjects"
          value={totalSubjects}
          color="#2563eb"
        />

        <DashboardCard
          title="Total Marks"
          value={totalMarks}
          color="#059669"
        />

        <DashboardCard
          title="Average Score"
          value={averageScore}
          color="#f59e0b"
        />

        <DashboardCard
          title="GPA"
          value={gpa}
          color="#ef4444"
        />

        <DashboardCard
          title="Position"
          value={position}
          color="#7c3aed"
        />

        <DashboardCard
          title="Transcript"
          value={transcriptReady}
          color="#0ea5e9"
        />
      </div>

      {/* PROFILE SUMMARY */}
      {profile && (
        <div
          style={{
            marginTop: "35px",
            background: "#fff",
            padding: "25px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            Profile Summary
          </h2>

          <SummaryRow
            label="Full Name"
            value={profile.full_name}
          />

          <SummaryRow
            label="Email"
            value={profile.email}
          />

          <SummaryRow
            label="Course"
            value={profile.course_name}
          />

          <SummaryRow
            label="Role"
            value={profile.role}
          />
        </div>
      )}

      {/* RESULT SUMMARY */}
      {result && (
        <div
          style={{
            marginTop: "35px",
            background: "#fff",
            padding: "25px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            Academic Summary
          </h2>

          <SummaryRow
            label="Student Name"
            value={result.student_name}
          />

          <SummaryRow
            label="Term"
            value={result.term_name}
          />

          <SummaryRow
            label="Session"
            value={result.session_year}
          />

          <SummaryRow
            label="Total Score"
            value={result.total_score}
          />

          <SummaryRow
            label="Average Score"
            value={result.average_score}
          />

          <SummaryRow
            label="GPA"
            value={result.gpa}
          />

          <SummaryRow
            label="Cumulative GPA"
            value={result.cumulative_gpa}
          />

          <SummaryRow
            label="Position"
            value={result.position}
          />

          <SummaryRow
            label="Class Size"
            value={result.class_size}
          />

          <SummaryRow
            label="Remarks"
            value={result.remarks}
          />

          <SummaryRow
            label="Promotion Status"
            value={result.promotion_status}
          />

          <SummaryRow
            label="Attendance"
            value={
              result.attendance &&
              result.total_school_days
                ? `${result.attendance}/${result.total_school_days}`
                : "N/A"
            }
          />

          <SummaryRow
            label="Teacher Comment"
            value={result.teacher_comment}
          />

          <SummaryRow
            label="Principal Comment"
            value={result.principal_comment}
          />

          <SummaryRow
            label="Next Term Begins"
            value={result.next_term_begins}
          />

          <SummaryRow
            label="Verification Link"
            value={result.verification_link}
          />
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
        fontSize: "24px",
        fontWeight: "bold",
        color,
      }}
    >
      {value ?? "N/A"}
    </p>
  </div>
);

// ======================================================
// SUMMARY ROW
// ======================================================
const SummaryRow = ({
  label,
  value,
}) => (
  <div
    style={{
      marginBottom: "16px",
      paddingBottom: "10px",
      borderBottom: "1px solid #e5e7eb",
    }}
  >
    <h4
      style={{
        marginBottom: "5px",
        color: "#6b7280",
        fontSize: "14px",
      }}
    >
      {label}
    </h4>

    <p
      style={{
        color: "#111827",
        fontSize: "16px",
      }}
    >
      {value ?? "N/A"}
    </p>
  </div>
);

export default StudentDashboard;