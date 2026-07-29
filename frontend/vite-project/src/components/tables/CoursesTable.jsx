import React from "react";

/**
 * ======================================================
 * COURSES TABLE
 * Backend Compatible
 * ======================================================
 */

const CoursesTable = ({
  courses = [],
  teachers = [],
  onEdit,
  onDelete,
}) => {
  // ======================================================
  // GET TEACHER NAME
  // ======================================================

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(
      (t) =>
        Number(t.id) ===
        Number(teacherId)
    );

    return (
      teacher?.full_name ||
      "Unassigned"
    );
  };

  // ======================================================
  // GET SUBJECT COUNT
  // ======================================================

  const getSubjectCount = (
    subjects
  ) => {
    return Array.isArray(subjects)
      ? subjects.length
      : 0;
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
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
        {/* HEADER */}

        <thead
          style={{
            background:
              "#f3f4f6",
          }}
        >
          <tr>
            <th style={thStyle}>
              S/N
            </th>

            <th style={thStyle}>
              Course Name
            </th>

            <th style={thStyle}>
              Description
            </th>

            <th style={thStyle}>
              Teacher
            </th>

            <th style={thStyle}>
              Subjects
            </th>

            <th style={thStyle}>
              Actions
            </th>
          </tr>
        </thead>

        {/* BODY */}

        <tbody>
          {courses.length ===
          0 ? (
            <tr>
              <td
                colSpan={6}
                style={
                  emptyStyle
                }
              >
                No courses available
              </td>
            </tr>
          ) : (
            courses.map(
              (
                course,
                index
              ) => (
                <tr
                  key={
                    course.id ||
                    index
                  }
                  style={
                    rowStyle
                  }
                >
                  <td
                    style={
                      tdStyle
                    }
                  >
                    {index + 1}
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {
                      course.name
                    }
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {course.description ||
                      "N/A"}
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {getTeacherName(
                      course.teacher_id
                    )}
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {getSubjectCount(
                      course.subjects
                    )}
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onEdit?.(
                            course
                          )
                        }
                        disabled={
                          !onEdit
                        }
                        style={
                          editBtn
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete?.(
                            course.id
                          )
                        }
                        disabled={
                          !onDelete
                        }
                        style={
                          deleteBtn
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ======================================================
   STYLES
====================================================== */

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "#374151",
};

const tdStyle = {
  padding: "12px",
  color: "#111827",
};

const rowStyle = {
  borderBottom:
    "1px solid #e5e7eb",
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

export default CoursesTable;