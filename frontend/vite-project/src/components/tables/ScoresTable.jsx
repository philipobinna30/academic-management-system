import React from "react";

/**
 * Scores Table Component
 * Displays student scores in admin/teacher panel
 */

const ScoresTable = ({ scores = [], onEdit, onDelete }) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        overflowX: "auto",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        {/* ================= HEADER ================= */}
        <thead style={{ background: "#f3f4f6" }}>
          <tr>
            <th style={thStyle}>S/N</th>
            <th style={thStyle}>Student</th>
            <th style={thStyle}>Subject</th>
            <th style={thStyle}>CA</th>
            <th style={thStyle}>Exam</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Grade</th>
            <th style={thStyle}>Remark</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {scores.length === 0 ? (
            <tr>
              <td colSpan="9" style={emptyStyle}>
                No scores available
              </td>
            </tr>
          ) : (
            scores.map((score, index) => (
              <tr key={score.id} style={rowStyle}>
                <td style={tdStyle}>{index + 1}</td>

                <td style={tdStyle}>
                  {score.student_name || "N/A"}
                </td>

                <td style={tdStyle}>
                  {score.subject_name || "N/A"}
                </td>

                <td style={tdStyle}>{score.ca}</td>
                <td style={tdStyle}>{score.exam}</td>

                <td style={tdStyle}>
                  {score.total ?? (score.ca + score.exam)}
                </td>

                <td style={tdStyle}>{score.grade}</td>
                <td style={tdStyle}>{score.remark}</td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onEdit?.(score)}
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete?.(score.id)}
                      style={deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ================= STYLES ================= */

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "#374151",
  fontSize: "14px",
};

const tdStyle = {
  padding: "12px",
  color: "#111827",
  fontSize: "14px",
};

const rowStyle = {
  borderBottom: "1px solid #e5e7eb",
};

const emptyStyle = {
  textAlign: "center",
  padding: "20px",
  color: "#6b7280",
};

const editBtn = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "5px",
  background: "#3b82f6",
  color: "#fff",
  cursor: "pointer",
};

const deleteBtn = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "5px",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
};

export default ScoresTable;