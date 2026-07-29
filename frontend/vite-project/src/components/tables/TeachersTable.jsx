import React from "react";

/**
 * Teachers Table Component
 * Used in Admin panel
 */

const TeachersTable = ({ teachers = [], onEdit, onDelete, onView }) => {
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
            <th style={thStyle}>Full Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan="6" style={emptyStyle}>
                No teachers found
              </td>
            </tr>
          ) : (
            teachers.map((teacher, index) => (
              <tr key={teacher.id} style={rowStyle}>
                <td style={tdStyle}>{index + 1}</td>

                <td style={tdStyle}>
                  {teacher.full_name || "N/A"}
                </td>

                <td style={tdStyle}>
                  {teacher.email || "N/A"}
                </td>

                <td style={tdStyle}>
                  {teacher.phone || "N/A"}
                </td>

                <td style={tdStyle}>
                  {teacher.department || "N/A"}
                </td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onView?.(teacher)}
                      style={viewBtn}
                    >
                      View
                    </button>

                    <button
                      onClick={() => onEdit?.(teacher)}
                      style={editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete?.(teacher.id)}
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

const viewBtn = {
  padding: "6px 10px",
  border: "none",
  borderRadius: "5px",
  background: "#10b981",
  color: "#fff",
  cursor: "pointer",
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

export default TeachersTable;