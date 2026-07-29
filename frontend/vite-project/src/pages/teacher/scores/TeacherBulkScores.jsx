import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import {
  getTeacherCourses,
  getTeacherStudents,
  teacherBulkCreateScores,
} from "../../../services/teacherService";

import {
  getSubjectsByCourse,
} from "../../../services/subjectService";

import {
  getActiveTerm,
} from "../../../services/termService";

// ======================================================
// CONTEXT
// ======================================================
import { useAuth } from "../../../context/AuthContext";

// ======================================================
// COMPONENTS
// ======================================================
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// HELPERS
// ======================================================
import {
  toNumber,
  getErrorMessage,
} from "../../../utils/helpers";

/**
 * ======================================================
 * Teacher Bulk Scores
 * ======================================================
 * Backend Endpoint
 * POST /teachers/{teacher_id}/scores/bulk
 * ======================================================
 */

const TeacherBulkScores = () => {
  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================
  // ======================================================
// CURRENT TEACHER
// ======================================================
const teacherId =
  user?.user_id ??
  user?.id;

console.log("USER OBJECT:", user);
console.log("TEACHER ID:", teacherId);
  // ======================================================
  // STATE
  // ======================================================
  const [courses, setCourses] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [termId, setTermId] =
    useState("");

  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    if (!teacherId) return;

    initializePage();
  }, [teacherId]);

  // ======================================================
  // LOAD INITIAL DATA
  // ======================================================
  const initializePage =
    async () => {
      try {
        setPageLoading(true);
        setErrorMsg("");

        const [
          teacherCourses,
          activeTerm,
        ] = await Promise.all([
          getTeacherCourses(
            teacherId
          ),
          getActiveTerm(),
        ]);

        setCourses(
          Array.isArray(
            teacherCourses
          )
            ? teacherCourses
            : []
        );

        if (activeTerm) {
          setTermId(
            activeTerm.id
          );
        }
      } catch (error) {
        console.error(error);

        setErrorMsg(
          getErrorMessage(error)
        );
      } finally {
        setPageLoading(false);
      }
    };

  // ======================================================
  // LOAD SUBJECTS + STUDENTS
  // ======================================================
  // ======================================================
// LOAD SUBJECTS + STUDENTS
// ======================================================
useEffect(() => {
  if (!selectedCourse || !teacherId) {
    setSubjects([]);
    setStudents([]);
    setRows([]);
    setSelectedSubject("");
    return;
  }

  // Clear previously selected subject whenever course changes
  setSelectedSubject("");

  loadCourseData();
}, [selectedCourse, teacherId]);
  const loadCourseData =
  async () => {

    if (!teacherId || !selectedCourse) {
      return;
    }

    try {
        setLoading(true);
        setErrorMsg("");

        const [
          courseSubjects,
          courseStudents,
        ] = await Promise.all([
          getSubjectsByCourse(
            selectedCourse
          ),
          getTeacherStudents(
            teacherId,
            selectedCourse
          ),
        ]);

        const subjectsList =
          Array.isArray(
            courseSubjects
          )
            ? courseSubjects
            : [];

        const studentsList =
          Array.isArray(
            courseStudents
          )
            ? courseStudents
            : [];

        setSubjects(
  subjectsList
);

setStudents(
  studentsList
);

setRows(
  studentsList.map(
    (student) => ({
      student_id: student.id,
      marks: "",
    })
  )
);
      } catch (error) {
        console.error(error);

        setErrorMsg(
          getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // HANDLE SCORE CHANGE
  // ======================================================
  const handleScoreChange = (
    index,
    value
  ) => {
    const updatedRows = [
      ...rows,
    ];

    updatedRows[index] = {
      ...updatedRows[index],
      marks: value,
    };

    setRows(updatedRows);
  };

  // ======================================================
  // SUBMIT SCORES
  // ======================================================
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setErrorMsg("");
      setSuccessMsg("");

      if (!selectedCourse) {
        setErrorMsg(
          "Please select a course."
        );
        return;
      }

      if (!selectedSubject) {
        setErrorMsg(
          "Please select a subject."
        );
        return;
      }

      if (!termId) {
        setErrorMsg(
          "No active term found."
        );
        return;
      }

      const payload =
        rows
          .filter(
            (row) =>
              row.marks !== ""
          )
          .map((row) => ({
            student_id:
              toNumber(
                row.student_id
              ),
            subject_id:
              toNumber(
                selectedSubject
              ),
            term_id:
              toNumber(
                termId
              ),
            marks:
              toNumber(
                row.marks
              ),
          }));

      if (
        payload.length === 0
      ) {
        setErrorMsg(
          "Enter at least one score."
        );
        return;
      }

      try {
        setLoading(true);

        await teacherBulkCreateScores(
          teacherId,
          payload
        );

        setSuccessMsg(
          `${payload.length} score(s) submitted successfully.`
        );

        setRows(
          rows.map((row) => ({
            ...row,
            marks: "",
          }))
        );
      } catch (error) {
        setErrorMsg(
          getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================
  // PART 2 STARTS HERE
  // (return (...) )
  // ============================

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Bulk Score Entry</h2>

        <p style={{ color: "#6b7280" }}>
          Submit multiple scores for students in your assigned course.
        </p>

        {termId && (
          <p
            style={{
              color: "#16a34a",
              marginTop: "8px",
            }}
          >
            Active Term ID: {termId}
          </p>
        )}
      </div>

      {errorMsg && (
        <ErrorMessage message={errorMsg} />
      )}

      {successMsg && (
        <p
          style={{
            color: "green",
            marginBottom: "15px",
          }}
        >
          {successMsg}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* ==========================================
            COURSE
        ========================================== */}
        <div style={fieldStyle}>
          <label>Course</label>

          <select
            value={selectedCourse}
            onChange={(e) =>
              setSelectedCourse(e.target.value)
            }
          >
            <option value="">
              Select Course
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* ==========================================
            SUBJECT
        ========================================== */}
        <div style={fieldStyle}>
          <label>Subject</label>

          <select
            value={selectedSubject}
            onChange={(e) =>
              setSelectedSubject(e.target.value)
            }
            disabled={!selectedCourse}
          >
            <option value="">
              Select Subject
            </option>

            {subjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* ==========================================
            TABLE
        ========================================== */}
        {loading ? (
          <Loader />
        ) : students.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No.</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {students.map(
                (student, index) => (
                  <tr key={student.id}>
                    <td>
                      {student.user
                        ?.full_name ??
                        student.full_name ??
                        "N/A"}
                    </td>

                    <td>
                      {student.id}
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          rows[index]
                            ?.marks ?? ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        ) : (
          selectedCourse && (
            <p>
              No students found for this
              course.
            </p>
          )
        )}

        <button
          type="submit"
          disabled={
            loading ||
            !selectedCourse ||
            !selectedSubject ||
            students.length === 0
          }
          style={submitButtonStyle}
        >
          {loading
            ? "Submitting..."
            : "Submit Scores"}
        </button>
      </form>
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "18px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const submitButtonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default TeacherBulkScores;