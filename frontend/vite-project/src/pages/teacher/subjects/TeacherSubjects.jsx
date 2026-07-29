import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================
import {
  getTeacherCourses,
} from "../../../services/teacherService";

import {
  getSubjects,
} from "../../../services/subjectService";

// ======================================================
// COMPONENTS
// ======================================================
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * ======================================================
 * Teacher Subjects
 *
 * Backend Compatible
 *
 * GET /teachers/{teacher_id}/courses
 * GET /subjects
 * ======================================================
 */

const TeacherSubjects = () => {
  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================
  const teacherId =
    user?.user_id ||
    user?.id;

  // ======================================================
  // STATE
  // ======================================================
  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // LOAD SUBJECTS
  // ======================================================
  useEffect(() => {
    if (teacherId) {
      loadSubjects();
    }
  }, [teacherId]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // ==================================================
      // LOAD TEACHER COURSES
      // ==================================================
      const teacherCourses =
        await getTeacherCourses(
          teacherId
        );

      const courseIds =
        Array.isArray(
          teacherCourses
        )
          ? teacherCourses
              .map(
                (course) =>
                  course.id
              )
              .filter(Boolean)
          : [];

      // ==================================================
      // LOAD ALL SUBJECTS
      // ==================================================
      const allSubjects =
        await getSubjects();

      const filteredSubjects =
        Array.isArray(
          allSubjects
        )
          ? allSubjects.filter(
              (subject) =>
                courseIds.includes(
                  subject.course_id
                )
            )
          : [];

      setSubjects(
        filteredSubjects
      );
    } catch (error) {
      console.error(
        "Failed to load teacher subjects:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load subjects."
      );

      setSubjects([]);
    } finally {
      setLoading(false);
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
          My Subjects
        </h1>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Subjects assigned to your
          courses.
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* EMPTY */}
      {!loading &&
        !errorMsg &&
        subjects.length === 0 && (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p>
              No subjects assigned
              yet.
            </p>
          </div>
        )}

      {/* TABLE */}
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
                <TableHead title="Subject ID" />
                <TableHead title="Subject Name" />
                <TableHead title="Course ID" />
              </tr>
            </thead>

            <tbody>
              {subjects.map(
                (
                  subject,
                  index
                ) => (
                  <tr
                    key={subject.id}
                    style={{
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <TableCell
                      value={index + 1}
                    />

                    <TableCell
                      value={subject.id}
                    />

                    <TableCell
                      value={
                        subject.name
                      }
                    />

                    <TableCell
                      value={
                        subject.course_id
                      }
                    />
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

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

export default TeacherSubjects;