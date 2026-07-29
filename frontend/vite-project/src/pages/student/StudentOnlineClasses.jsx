import React, {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getStudentOnlineClasses,
} from "../../services/onlineClassService";

const StudentOnlineClasses = () => {
  const { user } = useAuth();

  // ======================================================
  // STATES
  // ======================================================

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

      const data = await getStudentOnlineClasses();

      const safeData = Array.isArray(data) ? data : [];

      setClasses(safeData);
    } catch (error) {
      console.error("Online class error:", error);

      setErrorMsg(
        error?.message || "Failed to load online classes"
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
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (value) => {
    if (!value) return "N/A";
    try {
      return new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Time";
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div>
        <h3>Loading online classes...</h3>
      </div>
    );
  }

  return (
    <div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "30px", marginBottom: "10px" }}>
          Online Classes
        </h1>

        <p style={{ color: "#6b7280" }}>
          Join your scheduled online classes
        </p>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMsg && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!loading && classes.length === 0 && !errorMsg && (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>
            No Online Classes Yet
          </h3>

          <p style={{ color: "#6b7280" }}>
            Your scheduled classes will appear here once your teacher publishes them.
          </p>
        </div>
      )}

      {/* ======================================================
          CLASSES GRID
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {classes.map((cls, index) => {
          const isCompleted = cls?.end_time
            ? new Date(cls.end_time) < new Date()
            : false;

          return (
            <div
              key={cls?.id || index}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>
                {cls?.title || "Untitled Class"}
              </h3>

              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "15px",
                }}
              >
                {cls?.description || "No description available"}
              </p>

              <ClassInfo label="Subject ID" value={cls?.subject_id || "N/A"} />
              <ClassInfo label="Term ID" value={cls?.term_id || "N/A"} />
              <ClassInfo label="Date" value={formatDate(cls?.start_time)} />
              <ClassInfo label="Start Time" value={formatTime(cls?.start_time)} />
              <ClassInfo label="End Time" value={formatTime(cls?.end_time)} />

              {/* STATUS */}
              <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: isCompleted ? "#dcfce7" : "#dbeafe",
                    color: isCompleted ? "#166534" : "#1d4ed8",
                  }}
                >
                  {isCompleted ? "Completed" : "Upcoming"}
                </span>
              </div>

              {/* JOIN BUTTON */}
              {cls?.meeting_link ? (
                <a
                  href={cls.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "6px",
                    background: isCompleted ? "#9ca3af" : "#2563eb",
                    color: "#fff",
                    fontWeight: "600",
                    textDecoration: "none",
                    pointerEvents: isCompleted ? "none" : "auto",
                  }}
                >
                  {isCompleted ? "Class Completed" : "Join Class"}
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#9ca3af",
                    color: "#fff",
                    border: "none",
                    cursor: "not-allowed",
                  }}
                >
                  No Meeting Link
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ======================================================
// CLASS INFO COMPONENT
// ======================================================

const ClassInfo = ({ label, value }) => {
  return (
    <p style={{ color: "#4b5563", marginBottom: "6px", fontSize: "14px" }}>
      <strong>{label}:</strong> {value}
    </p>
  );
};

export default StudentOnlineClasses;