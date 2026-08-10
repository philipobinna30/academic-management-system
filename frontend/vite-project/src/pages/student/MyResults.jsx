import React, { useEffect, useState } from "react";

import "./MyResults.css";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getStudentResult,
} from "../../services/resultService";

// ======================================================
// COMPONENT
// ======================================================

const MyResults = () => {
  const { user } = useAuth();

  // ======================================================
  // STATES
  // ======================================================

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // DERIVED IDS
  // ======================================================

  const studentProfileId =
    user?.student_profile_id;

  // ======================================================
  // LOAD LATEST PUBLISHED RESULT
  // ======================================================

  useEffect(() => {
    if (studentProfileId) {
      loadResults();
    }
  }, [studentProfileId]);

  // ======================================================
  // FETCH RESULT
  // ======================================================

  const loadResults = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const resultData =
        await getStudentResult(
          studentProfileId
        );

      setResult(resultData || null);
    } catch (error) {
      console.error(
        "Loading result failed:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load results."
      );

      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DOWNLOAD RESULT
  // ======================================================

  const downloadResult = async () => {
    try {
      if (!studentProfileId) {
        setErrorMsg(
          "Student profile not found."
        );
        return;
      }

      setErrorMsg("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await fetch(
        `http://localhost:8000/crud/students/${studentProfileId}/result/print`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to download result."
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `result-${studentProfileId}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to download result."
      );
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="my-results-loading">
        <div className="my-results-loader">
          Loading results...
        </div>
      </div>
    );
  }

  // ======================================================
  // SUBJECTS
  // ======================================================

  const subjects = Array.isArray(
    result?.subjects
  )
    ? result.subjects
    : [];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="my-results">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="my-results-header">

        <div>
          <h1>My Results</h1>

          <p>
            View your academic
            performance
          </p>
        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMsg && (
        <div className="my-results-error">
          {errorMsg}
        </div>
      )}

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!loading &&
        !errorMsg &&
        !result && (
          <div className="my-results-empty">

            <div className="empty-icon">
              📊
            </div>

            <h3>
              No Published Result
            </h3>

            <p>
              No published result is
              currently available for
              your account.
            </p>

          </div>
        )}

      {/* ======================================================
          RESULT CONTENT
      ====================================================== */}

      {result && (
        <>
          {/* ====================================================
              RESULT SUMMARY
          ==================================================== */}

          <div className="result-summary">

            <div className="result-section-header">
              <div>
                <h2>
                  Result Summary
                </h2>

                <p>
                  Your academic performance
                  for the published term.
                </p>
              </div>

              <div className="result-status">
                Published
              </div>
            </div>

            <div className="result-summary-grid">

              <ProfileRow
                label="Student Name"
                value={
                  result.student_name
                }
              />

              <ProfileRow
                label="Academic Session"
                value={
                  result.session_year
                }
              />

              <ProfileRow
                label="Term"
                value={
                  result.term_name
                }
              />

              <ProfileRow
                label="Total Score"
                value={
                  result.total_score
                }
              />

              <ProfileRow
                label="Average Score"
                value={
                  result.average_score
                }
              />

              <ProfileRow
                label="GPA"
                value={
                  result.gpa
                }
              />

              <ProfileRow
                label="Cumulative GPA"
                value={
                  result.cumulative_gpa
                }
              />

              <ProfileRow
                label="Position"
                value={
                  result.position
                }
              />

              <ProfileRow
                label="Remarks"
                value={
                  result.remarks
                }
              />

              <ProfileRow
                label="Promotion Status"
                value={
                  result.promotion_status
                }
              />

              <ProfileRow
                label="Class Size"
                value={
                  result.class_size
                }
              />

              <ProfileRow
                label="Number Of Subjects"
                value={
                  result.number_of_subjects ??
                  subjects.length
                }
              />

            </div>

          </div>

          {/* ====================================================
              SUBJECT PERFORMANCE
          ==================================================== */}

          <div className="subjects-section">

            <div className="result-section-header">

              <div>
                <h2>
                  Subject Performance
                </h2>

                <p>
                  Detailed breakdown of
                  your subjects and grades.
                </p>
              </div>

              <span className="subject-count">
                {subjects.length} Subjects
              </span>

            </div>

            {subjects.length > 0 ? (

              <div className="results-table-wrapper">

                <table className="results-table">

                  <thead>
                    <tr>

                      <TableHead
                        title="S/N"
                      />

                      <TableHead
                        title="Subject"
                      />

                      <TableHead
                        title="Score"
                      />

                      <TableHead
                        title="Grade"
                      />

                      <TableHead
                        title="Remark"
                      />

                    </tr>
                  </thead>

                  <tbody>

                    {subjects.map(
                      (
                        subject,
                        index
                      ) => (

                        <tr
                          key={
                            subject?.subject_id ||
                            index
                          }
                        >

                          <TableCell
                            value={
                              index + 1
                            }
                          />

                          <TableCell
                            value={
                              subject?.subject_name ||
                              "N/A"
                            }
                          />

                          <TableCell
                            value={
                              subject?.marks ??
                              0
                            }
                          />

                          <TableCell
                            value={
                              subject?.grade ||
                              "-"
                            }
                          />

                          <TableCell
                            value={
                              subject?.remark ||
                              "-"
                            }
                          />

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="no-subjects">
                <p>
                  No subject records are
                  available for this result.
                </p>
              </div>

            )}

          </div>

          {/* ====================================================
              DOWNLOAD
          ==================================================== */}

          <div className="result-download-section">

            <button
              type="button"
              onClick={
                downloadResult
              }
              className="download-result-button"
            >
              Download Result PDF
            </button>

          </div>
        </>
      )}

    </div>
  );
};

// ======================================================
// PROFILE ROW
// ======================================================

const ProfileRow = ({
  label,
  value,
}) => {
  return (
    <div className="result-profile-row">

      <span className="result-profile-label">
        {label}
      </span>

      <span className="result-profile-value">
        {value ?? "N/A"}
      </span>

    </div>
  );
};

// ======================================================
// TABLE HEAD
// ======================================================

const TableHead = ({
  title,
}) => {
  return (
    <th className="results-table-head">
      {title}
    </th>
  );
};

// ======================================================
// TABLE CELL
// ======================================================

const TableCell = ({
  value,
}) => {
  return (
    <td className="results-table-cell">
      {value ?? "N/A"}
    </td>
  );
};

export default MyResults;

