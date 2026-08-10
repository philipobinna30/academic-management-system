import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import "./Transcript.css";

// ======================================================
// SERVICES
// ======================================================

import {
  printStudentTranscript,
} from "../../../services/resultService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaFilePdf,
  FaDownload,
  FaIdCard,
  FaSearch,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * ======================================================
 * TRANSCRIPT PAGE
 * Modern Admin Dashboard Version
 * ======================================================
 */

const Transcript = () => {

  // ======================================================
  // ROUTE PARAM
  // ======================================================

  const {
    studentId: routeStudentId,
  } = useParams();

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

      setErrorMsg(
        "Student ID is required."
      );

      return;

    }

    try {

      setLoading(true);

      setErrorMsg("");

      setDownloaded(false);

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

      console.error(error);

      setErrorMsg(

        error?.message ||

        error?.response?.data?.detail ||

        "Failed to download transcript."

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // AUTO LOAD FROM ROUTE
  // ======================================================

  useEffect(() => {

    if (routeStudentId) {

      fetchTranscript();

    }

    // eslint-disable-next-line

  }, [routeStudentId]);

  // ======================================================
  // RESET STATUS WHEN ID CHANGES
  // ======================================================

  useEffect(() => {

    setDownloaded(false);

  }, [studentId]);

  // ======================================================
  // DASHBOARD STATS
  // ======================================================

  const totalDownloads =
    downloaded ? 1 : 0;

  const selectedStudent =
    studentId || "--";

  const downloadStatus =
    downloaded
      ? "Completed"
      : "Pending";

  // ======================================================
  // HELPER
  // ======================================================

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      fetchTranscript();

    }

  };

  // ======================================================
  // PART 2 STARTS BELOW
  // ======================================================

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="transcript-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="transcript-header">

        <div>

          <h1>
            Student Transcript
          </h1>

          <p>
            Download and manage official academic transcripts.
          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <div className="transcript-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaIdCard />

          </div>

          <div>

            <h2>

              {selectedStudent}

            </h2>

            <span>

              Selected Student

            </span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaDownload />

          </div>

          <div>

            <h2>

              {totalDownloads}

            </h2>

            <span>

              Downloads

            </span>

          </div>

        </div>

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaFileAlt />

          </div>

          <div>

            <h2>

              {downloadStatus}

            </h2>

            <span>

              Status

            </span>

          </div>

        </div>

      </div>

      {/* ======================================================
          SEARCH CARD
      ====================================================== */}

      <div className="search-card">

        <h2>

          Load Transcript

        </h2>

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input

            type="number"

            placeholder="Enter Student ID"

            value={studentId}

            onChange={(e) =>
              setStudentId(
                e.target.value
              )
            }

            onKeyDown={handleKeyDown}

          />

          <button

            className="load-btn"

            onClick={fetchTranscript}

            disabled={
              loading || !studentId
            }

          >

            <FaDownload />

            {loading
              ? "Loading..."
              : "Load Transcript"}

          </button>

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
          LOADING
      ====================================================== */}

      {loading ? (

        <Loader />

      ) : (

        <div className="transcript-card">

          <div className="transcript-icon">

            <FaFilePdf />

          </div>

          <h2>

            Transcript PDF

          </h2>

          <p>

            Enter a valid Student ID and click
            <strong> Load Transcript </strong>
            to generate the official academic transcript.

          </p>

          <div className="transcript-info">

            <div>

              <span>

                Student ID

              </span>

              <strong>

                {studentId || "--"}

              </strong>

            </div>

            <div>

              <span>

                Download Status

              </span>

              <strong>

                {downloaded
                  ? "Completed"
                  : "Pending"}

              </strong>

            </div>

          </div>

          {downloaded && (

            <div className="download-success">

              <FaCheckCircle />

              Transcript downloaded successfully.

            </div>

          )}

          <button

            className="download-btn"

            disabled={!studentId}

            onClick={() =>
              window.open(
                `http://localhost:8000/crud/students/${studentId}/transcript/print`,
                "_blank"
              )
            }

          >

            <FaFilePdf />

            Download PDF

          </button>

        </div>

      )}

    </div>

  );

};

export default Transcript;