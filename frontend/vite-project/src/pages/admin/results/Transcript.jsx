import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// ======================================================
// SERVICES
// ======================================================
import {
  printStudentTranscript,
} from "../../../services/resultService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// TRANSCRIPT PAGE (ADMIN)
// Fully aligned with transcript endpoint
// ======================================================
const Transcript = () => {
  const { studentId: routeStudentId } =
    useParams();

  // ======================================================
  // STATE
  // ======================================================
  const [studentId, setStudentId] =
    useState(routeStudentId || "");

  const [downloaded, setDownloaded] =
  useState(false);
  
  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");


  // ======================================================
// DOWNLOAD TRANSCRIPT
// ======================================================
const fetchTranscript = async () => {
  if (!studentId) {
    setErrorMsg("Student ID is required");
    return;
  }

  setLoading(true);

  try {
    setErrorMsg("");

    const blob =
      await printStudentTranscript(
        studentId
      );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `student-transcript-${studentId}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
    setDownloaded(true);

  } catch (error) {
    console.error(
      "Transcript download failed:",
      error
    );

    setErrorMsg(
      error?.message ||
      "Failed to download transcript"
    );

  } finally {
    setLoading(false);
  }
};
  // ======================================================
  // AUTO LOAD
  // ======================================================
  useEffect(() => {
    if (routeStudentId) {
      fetchTranscript();
    }
    // eslint-disable-next-line
  }, [routeStudentId]);

  // ======================================================
  // SUBJECT COUNT
  // ======================================================
  const getSubjectCount = (
    termResult
  ) => {
    return (
      termResult?.subjects?.length ||
      0
    );
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2>
          Student Transcript
        </h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          View complete
          academic transcript.
        </p>
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="number"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) =>
            setStudentId(
              e.target.value
            )
          }
        />

        <button
          onClick={fetchTranscript}
        >
          Load Transcript
        </button>
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
          LOADING
      ====================================================== */}
      {loading ? (
        <Loader />
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <h3>
            Transcript Download
          </h3>

          <p>
            Enter a Student ID above and click{" "}
            <strong>
              Load Transcript
            </strong>
            .
          </p>

          <p>
            The transcript will be downloaded directly
            from the backend as a PDF.
          </p>

          <p>
            <strong>
              Student ID:
            </strong>{" "}
            {studentId || "N/A"}
          </p>

          <button
            onClick={() =>
              window.open(
                `http://localhost:8000/crud/students/${studentId}/transcript/print`,
                "_blank"
              )
            }
            disabled={!studentId}
            style={{
              marginTop: "15px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#2563eb",
              color: "#fff",
              cursor: studentId
                ? "pointer"
                : "not-allowed",
            }}
          >
            Download Transcript PDF
          </button>
        </div>
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

export default Transcript;