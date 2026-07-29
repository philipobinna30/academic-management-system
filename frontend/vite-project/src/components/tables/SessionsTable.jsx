import React from "react";

/**
 * Sessions Table Component
 * Displays academic sessions in admin panel
 */

const SessionsTable = ({ sessions = [], onEdit, onDelete }) => {
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
            <th style={thStyle}>Session Name</th>
            <th style={thStyle}>Start Year</th>
            <th style={thStyle}>End Year</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan="6" style={emptyStyle}>
                No sessions available
              </td>
            </tr>
          ) : (
            sessions.map((session, index) => (
              <tr key={session.id} style={rowStyle}>
                <td style={tdStyle}>{index + 1}</td>

                <td style={tdStyle}>
                  {session.name || "N/A"}
                </td>

                <td style={tdStyle}>
                  {session.start_year}
                </td>

                <td style={tdStyle}>
                  {session.end_year}
                </td>

                <td style={tdStyle}>
                  {session.is_active ? "Active" : "Inactive"}
                </td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onEdit?.(session)}
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete?.(session.id)}
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

export default SessionsTable;