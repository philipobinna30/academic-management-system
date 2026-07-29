import React from "react";

/**
 * Terms Table Component
 * Used in Admin panel
 */

const TermsTable = ({ terms = [], onEdit, onDelete }) => {
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
            <th style={thStyle}>Term Name</th>
            <th style={thStyle}>Session</th>
            <th style={thStyle}>Start Date</th>
            <th style={thStyle}>End Date</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {terms.length === 0 ? (
            <tr>
              <td colSpan="7" style={emptyStyle}>
                No terms found
              </td>
            </tr>
          ) : (
            terms.map((term, index) => (
              <tr key={term.id} style={rowStyle}>
                <td style={tdStyle}>{index + 1}</td>

                <td style={tdStyle}>
                  {term.name || "N/A"}
                </td>

                <td style={tdStyle}>
                  {term.session_name || "N/A"}
                </td>

                <td style={tdStyle}>
                  {term.start_date || "N/A"}
                </td>

                <td style={tdStyle}>
                  {term.end_date || "N/A"}
                </td>

                <td style={tdStyle}>
                  {term.is_active ? "Active" : "Inactive"}
                </td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onEdit?.(term)}
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete?.(term.id)}
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

export default TermsTable;