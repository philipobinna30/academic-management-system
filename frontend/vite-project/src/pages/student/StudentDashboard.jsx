import React, { useEffect, useState } from "react";

import "./StudentDashboard.css";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import { getMyProfile } from "../../services/studentService";
import { getStudentResult } from "../../services/resultService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

/**
 * ======================================================
 * Student Dashboard
 *
 * Fully aligned with backend response structure
 * ======================================================
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

      // ==================================================
      // PROFILE
      // ==================================================

      const profileData = await getMyProfile();

      setProfile(profileData);

      // ==================================================
      // RESULT
      // ==================================================

      const profileId =
        profileData?.id ||
        profileData?.student_profile_id ||
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
        } catch (error) {
          console.error(
            "Result fetch failed:",
            error
          );

          setResult(null);
        }
      } else {
        setResult(null);
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

  const subjects = Array.isArray(
    result?.subjects
  )
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
    result?.id
      ? "Ready"
      : "Not Ready";

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
    <div className="student-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="student-dashboard-header">

        <div>

          <h1>
            Student Dashboard
          </h1>

          <p>
            Welcome{" "}
            {profile?.full_name ||
              result?.student_name ||
              user?.full_name ||
              "Student"}
          </p>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* ======================================================
          DASHBOARD CARDS
      ====================================================== */}

      <div className="student-dashboard-grid">

        <DashboardCard
          title="Subjects"
          value={totalSubjects}
          color="blue"
        />

        <DashboardCard
          title="Total Marks"
          value={totalMarks}
          color="green"
        />

        <DashboardCard
          title="Average Score"
          value={averageScore}
          color="orange"
        />

        <DashboardCard
          title="GPA"
          value={gpa}
          color="red"
        />

        <DashboardCard
          title="Position"
          value={position}
          color="purple"
        />

        <DashboardCard
          title="Transcript"
          value={transcriptReady}
          color="cyan"
        />

      </div>

      {/* ======================================================
          PROFILE SUMMARY
      ====================================================== */}

      {profile && (

        <div className="student-dashboard-section">

          <div className="section-header">

            <h2>
              Profile Summary
            </h2>

          </div>

          <div className="summary-grid">

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
              value={
                profile.course_name ||
                profile.course?.name
              }
            />

            <SummaryRow
              label="Role"
              value={profile.role}
            />

          </div>

        </div>

      )}

      {/* ======================================================
          RESULT SUMMARY
      ====================================================== */}

      {result && (

        <div className="student-dashboard-section">

          <div className="section-header">

            <h2>
              Academic Summary
            </h2>

            <span className="result-status">
              Published
            </span>

          </div>

          <div className="summary-grid">

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
                result.attendance != null &&
                result.total_school_days != null
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

          </div>

          {/* ==================================================
              VERIFICATION LINK
          ================================================== */}

          {result.verification_link && (

            <div className="verification-box">

              <span>
                Verification Link
              </span>

              <a
                href={result.verification_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Verify Result
              </a>

            </div>

          )}

        </div>

      )}

      {/* ======================================================
          SUBJECT PERFORMANCE
      ====================================================== */}

      {subjects.length > 0 && (

        <div className="student-dashboard-section">

          <div className="section-header">

            <h2>
              Subject Performance
            </h2>

            <span>
              {subjects.length} Subjects
            </span>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>

                <tr>

                  <th>
                    S/N
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Grade
                  </th>

                  <th>
                    Remark
                  </th>

                </tr>

              </thead>

              <tbody>

                {subjects.map(
                  (subject, index) => (

                    <tr
                      key={
                        subject?.subject_id ||
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {subject?.subject_name ||
                          subject?.name ||
                          "N/A"}
                      </td>

                      <td>
                        {subject?.marks ??
                          subject?.score ??
                          0}
                      </td>

                      <td>
                        {subject?.grade ||
                          "-"}
                      </td>

                      <td>
                        {subject?.remark ||
                          subject?.remarks ||
                          "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* ======================================================
          NO RESULT
      ====================================================== */}

      {!result && !errorMsg && (

        <div className="student-dashboard-empty">

          <h2>
            No Published Result
          </h2>

          <p>
            Your academic result has not
            been published yet.
          </p>

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
    className={`dashboard-card dashboard-card-${color}`}
  >

    <div className="dashboard-card-content">

      <span className="dashboard-card-title">
        {title}
      </span>

      <strong className="dashboard-card-value">
        {value ?? "N/A"}
      </strong>

    </div>

  </div>
);

// ======================================================
// SUMMARY ROW
// ======================================================

const SummaryRow = ({
  label,
  value,
}) => (

  <div className="summary-row">

    <span className="summary-label">
      {label}
    </span>

    <strong className="summary-value">
      {value ?? "N/A"}
    </strong>

  </div>
);

export default StudentDashboard;

