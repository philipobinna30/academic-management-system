import React, { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================
import {
  getStudentResult,
} from "../../services/resultService";

const MyResults = () => {
  const { user } = useAuth();

  // ======================================================
  // STATES
  // ======================================================
  const [result, setResult] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // DERIVED IDS
  // ======================================================
  const studentProfileId =
    user?.student_profile_id;

  // ======================================================
  // LOAD LATEST PUBLISHED RESULT
  // Backend now automatically returns the
  // latest published result for students.
  // ======================================================
  useEffect(() => {
    if (studentProfileId) {
      loadResults();
    }
  }, [studentProfileId]);

  // ======================================================
  // FETCH RESULTS
  // ======================================================
  // ======================================================
// FETCH RESULTS
// ======================================================
const loadResults = async () => {
  try {
    setLoading(true);
    setErrorMsg("");

    // Backend returns the latest published result
    // when no session/term is supplied.
    const resultData =
      await getStudentResult(
        studentProfileId
      );

    setResult(resultData);
  } catch (error) {
    console.error(
      "Loading result failed:",
      error
    );

    setErrorMsg(
      error?.message ||
        "Failed to load results"
    );

    setResult(null);
  } finally {
    setLoading(false);
  }
};
  // ======================================================
  // DOWNLOAD RESULT
  // Backend automatically downloads
  // latest published result
  // ======================================================
  const downloadResult =
    async () => {
      try {
        if (!studentProfileId) {
          setErrorMsg(
            "Student profile not found"
          );
          return;
        }

        setErrorMsg("");

        const token =
          localStorage.getItem(
            "access_token"
          );

        const response =
          await fetch(
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
            "Failed to download result"
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

        link.download = `result-${studentProfileId}.pdf`;

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
            "Failed to download result"
        );
      }
    };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div>
        <h3>
          Loading results...
        </h3>
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

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            marginBottom: "10px",
          }}
        >
          My Results
        </h1>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          View your academic
          performance
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div
          style={{
            background:
              "#fee2e2",
            color: "#b91c1c",
                        padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !errorMsg &&
        !result && (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p>
              No published result
              available.
            </p>
          </div>
        )}

      {/* RESULT SUMMARY */}
      {result && (
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "25px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
              color: "#111827",
            }}
          >
            Result Summary
          </h2>

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
            value={result.gpa}
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
      )}

      {/* SUBJECTS TABLE */}
      {subjects.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            overflowX: "auto",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead
              style={{
                background:
                  "#f3f4f6",
              }}
            >
              <tr>
                <TableHead title="S/N" />
                <TableHead title="Subject" />
                <TableHead title="Score" />
                <TableHead title="Grade" />
                <TableHead title="Remark" />
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
      )}

      {/* DOWNLOAD BUTTON */}
      {result && (
        <div
          style={{
            marginTop: "25px",
          }}
        >
          <button
            onClick={
              downloadResult
            }
            style={{
              padding:
                "12px 18px",
              background:
                "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius:
                "6px",
              cursor: "pointer",
              fontWeight:
                "600",
            }}
          >
            Download Result
            PDF
          </button>
        </div>
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
}) => (
  <div
    style={{
      marginBottom: "18px",
      paddingBottom: "10px",
      borderBottom:
        "1px solid #e5e7eb",
    }}
  >
    <h3
      style={{
        marginBottom: "5px",
        color: "#374151",
        fontSize: "14px",
      }}
    >
      {label}
    </h3>

    <p
      style={{
        color: "#111827",
        fontSize: "17px",
      }}
    >
      {value ?? "N/A"}
    </p>
  </div>
);

// ======================================================
// TABLE HEAD
// ======================================================
const TableHead = ({
  title,
}) => (
  <th
    style={{
      textAlign: "left",
      padding: "14px",
      color: "#374151",
    }}
  >
    {title}
  </th>
);

// ======================================================
// TABLE CELL
// ======================================================
const TableCell = ({
  value,
}) => (
  <td
    style={{
      padding: "14px",
      color: "#111827",
    }}
  >
    {value}
  </td>
);

export default MyResults;