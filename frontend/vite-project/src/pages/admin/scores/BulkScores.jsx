import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import { createBulkScores } from "../../../services/scoreService";

import { getAllStudents } from "../../../services/studentService";
import { getSubjects } from "../../../services/subjectService";
import { getTerms } from "../../../services/termService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * Bulk Scores Page (Admin / Teacher)
 * Fully aligned with backend blueprint
 */

const BulkScores = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [rows, setRows] = useState([
    {
      student_id: "",
      subject_id: "",
      term_id: "",
      score: "",
    },
  ]);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // LOAD INITIAL DATA
  // ======================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [studentsData, subjectsData, termsData] =
        await Promise.all([
          getAllStudents(),
          getSubjects(),
          getTerms(),
        ]);

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : []
      );

      setSubjects(
        Array.isArray(subjectsData)
          ? subjectsData
          : []
      );

      setTerms(
        Array.isArray(termsData)
          ? termsData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load bulk score data:",
        error
      );

      setErrorMsg(
        error.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // SUBJECT FILTER PER ROW
  // ======================================================

  const getSubjectsForStudent = (
    studentId
  ) => {
    const student = students.find(
      (s) =>
        String(s.id) === String(studentId)
    );

    if (!student) return [];

    return subjects.filter(
      (subject) =>
        Number(subject.course_id) ===
        Number(student.course_id)
    );
  };

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (
    index,
    e
  ) => {
    const { name, value } = e.target;

    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updated = {
          ...row,
          [name]: value,
        };

        // Reset subject when student changes

        if (name === "student_id") {
          updated.subject_id = "";
        }

        return updated;
      })
    );
  };

  // ======================================================
  // ADD ROW
  // ======================================================

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        student_id: "",
        subject_id: "",
        term_id: "",
        score: "",
      },
    ]);
  };

  // ======================================================
  // REMOVE ROW
  // ======================================================

  const removeRow = (index) => {
    if (rows.length === 1) return;

    setRows((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetRows = () => {
    setRows([
      {
        student_id: "",
        subject_id: "",
        term_id: "",
        score: "",
      },
    ]);
  };

  // ======================================================
  // SUBMIT BULK SCORES
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setErrorMsg("");

      const cleanedRows = rows.filter(
        (row) =>
          row.student_id &&
          row.subject_id &&
          row.term_id &&
          row.score !== ""
      );

      if (cleanedRows.length === 0) {
        throw new Error(
          "No valid rows to submit"
        );
      }

      const invalidRow =
        cleanedRows.find(
          (row) =>
            Number(row.score) < 0 ||
            Number(row.score) > 100
        );

      if (invalidRow) {
        throw new Error(
          "Scores must be between 0 and 100"
        );
      }

      const payload =
        cleanedRows.map((row) => ({
          student_id: Number(
            row.student_id
          ),
          subject_id: Number(
            row.subject_id
          ),
          term_id: Number(
            row.term_id
          ),
          marks: Number(row.score),
        }));

      await createBulkScores(payload);

      alert(
        "Bulk scores submitted successfully"
      );

      resetRows();
    } catch (error) {
      console.error(
        "Bulk submission failed:",
        error
      );

      setErrorMsg(
        error.message ||
          "Failed to submit scores"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2>Bulk Scores Entry</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Enter multiple student
          scores. Results and GPA
          are automatically generated
          by the backend.
        </p>
      </div>

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {loading ? (
        <Loader />
      ) : (
        <form
          onSubmit={handleSubmit}
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Term</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        name="student_id"
                        value={
                          row.student_id
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        required
                      >
                        <option value="">
                          Select Student
                        </option>

                        {students.map(
                          (
                            student
                          ) => (
                            <option
                              key={
                                student.id
                              }
                              value={
                                student.id
                              }
                            >
                              {student.full_name ||
                                `Student ${student.id}`}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <select
                        name="subject_id"
                        value={
                          row.subject_id
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        required
                      >
                        <option value="">
                          {row.student_id
                            ? "Select Subject"
                            : "Select Student First"}
                        </option>

                        {getSubjectsForStudent(
                          row.student_id
                        ).map(
                          (
                            subject
                          ) => (
                            <option
                              key={
                                subject.id
                              }
                              value={
                                subject.id
                              }
                            >
                              {
                                subject.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <select
                        name="term_id"
                        value={
                          row.term_id
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        required
                      >
                        <option value="">
                          Select Term
                        </option>

                        {terms.map(
                          (term) => (
                            <option
                              key={
                                term.id
                              }
                              value={
                                term.id
                              }
                            >
                              {term.name}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <input
                        name="score"
                        type="number"
                        min="0"
                        max="100"
                        value={
                          row.score
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            e
                          )
                        }
                        required
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          removeRow(
                            index
                          )
                        }
                        disabled={
                          rows.length ===
                          1
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={addRow}
            >
              + Add Row
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit All Scores"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
};

export default BulkScores;