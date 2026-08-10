import React, {
  useEffect,
  useState,
} from "react";

import "./StudentOnlineClasses.css";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getStudentOnlineClasses,
} from "../../services/onlineClassService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

/**
 * ======================================================
 * Student Online Classes
 * ======================================================
 */

const StudentOnlineClasses = () => {
  const { user } = useAuth();

  // ======================================================
  // STATES
  // ======================================================

  const [classes, setClasses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // LOAD CLASSES
  // ======================================================

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  // ======================================================
  // FETCH CLASSES
  // ======================================================

  const loadClasses = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data =
        await getStudentOnlineClasses();

      const safeData =
        Array.isArray(data)
          ? data
          : [];

      setClasses(safeData);
    } catch (error) {
      console.error(
        "Online class error:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load online classes"
      );

      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    try {
      return new Date(
        value
      ).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (value) => {
    if (!value) {
      return "N/A";
    }

    try {
      return new Date(
        value
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "Invalid Time";
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
    <div className="student-online-classes">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="online-classes-header">

        <div>

          <h1>
            Online Classes
          </h1>

          <p>
            Join your scheduled
            online classes
          </p>

        </div>

        <div className="classes-count">

          <span>
            {classes.length}
          </span>

          <small>
            Classes
          </small>

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
          EMPTY STATE
      ====================================================== */}

      {!loading &&
        classes.length === 0 &&
        !errorMsg && (

          <div className="online-classes-empty">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              No Online Classes Yet
            </h3>

            <p>
              Your scheduled classes
              will appear here once
              your teacher publishes
              them.
            </p>

          </div>

        )}

      {/* ======================================================
          CLASSES GRID
      ====================================================== */}

      {classes.length > 0 && (

        <div className="online-classes-grid">

          {classes.map(
            (cls, index) => {

              const isCompleted =
                cls?.end_time
                  ? new Date(
                      cls.end_time
                    ) < new Date()
                  : false;

              return (

                <div
                  key={
                    cls?.id ||
                    index
                  }
                  className={`online-class-card ${
                    isCompleted
                      ? "completed"
                      : "upcoming"
                  }`}
                >

                  {/* ==================================================
                      CARD HEADER
                  ================================================== */}

                  <div className="online-class-card-header">

                    <div>

                      <h3>
                        {cls?.title ||
                          "Untitled Class"}
                      </h3>

                      <span className="class-id">
                        Class #
                        {cls?.id ||
                          "N/A"}
                      </span>

                    </div>

                    <span
                      className={`class-status ${
                        isCompleted
                          ? "completed-status"
                          : "upcoming-status"
                      }`}
                    >
                      {isCompleted
                        ? "Completed"
                        : "Upcoming"}
                    </span>

                  </div>

                  {/* ==================================================
                      DESCRIPTION
                  ================================================== */}

                  <p className="online-class-description">
                    {cls?.description ||
                      "No description available."}
                  </p>

                  {/* ==================================================
                      CLASS INFORMATION
                  ================================================== */}

                  <div className="class-info-list">

                    <ClassInfo
                      label="Subject ID"
                      value={
                        cls?.subject_id ||
                        "N/A"
                      }
                    />

                    <ClassInfo
                      label="Term ID"
                      value={
                        cls?.term_id ||
                        "N/A"
                      }
                    />

                    <ClassInfo
                      label="Date"
                      value={formatDate(
                        cls?.start_time
                      )}
                    />

                    <ClassInfo
                      label="Start Time"
                      value={formatTime(
                        cls?.start_time
                      )}
                    />

                    <ClassInfo
                      label="End Time"
                      value={formatTime(
                        cls?.end_time
                      )}
                    />

                  </div>

                  {/* ==================================================
                      JOIN BUTTON
                  ================================================== */}

                  <div className="class-action">

                    {cls?.meeting_link ? (

                      <a
                        href={
                          cls.meeting_link
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`join-class-button ${
                          isCompleted
                            ? "disabled"
                            : ""
                        }`}
                        onClick={
                          isCompleted
                            ? (
                                event
                              ) =>
                                event.preventDefault()
                            : undefined
                        }
                      >
                        {isCompleted
                          ? "Class Completed"
                          : "Join Class"}
                      </a>

                    ) : (

                      <button
                        type="button"
                        disabled
                        className="join-class-button no-link"
                      >
                        No Meeting Link
                      </button>

                    )}

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
};

// ======================================================
// CLASS INFO COMPONENT
// ======================================================

const ClassInfo = ({
  label,
  value,
}) => {

  return (
    <div className="class-info-row">

      <span className="class-info-label">
        {label}
      </span>

      <span className="class-info-value">
        {value}
      </span>

    </div>
  );
};

export default StudentOnlineClasses;

