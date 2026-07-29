import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import {
  getAllScores,
  createScore,
  updateScore,
  deleteScore,
} from "../../../services/scoreService";

import { getAllStudents } from "../../../services/studentService";
import { getSubjects } from "../../../services/subjectService";
import { getTerms } from "../../../services/termService";
import { getCourses } from "../../../services/courseService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

const Scores = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [scores, setScores] = useState([]);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    student_id: "",
    subject_id: "",
    term_id: "",
    marks: "",
  });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [
        scoresData,
        studentsData,
        subjectsData,
        termsData,
        coursesData,
      ] = await Promise.all([
        getAllScores(),
        getAllStudents(),
        getSubjects(),
        getTerms(),
        getCourses(),
      ]);

      setScores(Array.isArray(scoresData) ? scoresData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setTerms(Array.isArray(termsData) ? termsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Failed to fetch scores:", error);
      setErrorMsg(error?.message || "Failed to load scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======================================================
  // LOOKUP MAPS
  // ======================================================

  const studentMap = Object.fromEntries(
    students.map((student) => [
      student.id,
      student?.full_name ||
        student?.user?.full_name ||
        `Student ${student.id}`,
    ])
  );

  const subjectMap = Object.fromEntries(
    subjects.map((subject) => [subject.id, subject.name])
  );

  const termMap = Object.fromEntries(
    terms.map((term) => [term.id, term.name])
  );

  const courseMap = Object.fromEntries(
    courses.map((course) => [course.id, course.name])
  );

  // ======================================================
  // FILTER SUBJECTS BY SELECTED STUDENT COURSE
  // ======================================================

  const selectedStudent = students.find(
    (student) =>
      String(student.id) === String(form.student_id)
  );

  const filteredSubjects = selectedStudent
    ? subjects.filter(
        (subject) =>
          Number(subject.course_id) ===
          Number(selectedStudent.course_id)
      )
    : [];

  // ======================================================
  // HELPERS
  // ======================================================

  const getStudentName = (id) =>
    studentMap[id] || `Student ${id}`;

  const getSubjectName = (id) =>
    subjectMap[id] || "N/A";

  const getTermName = (id) =>
    termMap[id] || "N/A";

  const getCourseName = (id) =>
    courseMap[id] || "N/A";

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "student_id") {
        updated.subject_id = "";
      }

      return updated;
    });
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setForm({
      student_id: "",
      subject_id: "",
      term_id: "",
      marks: "",
    });

    setEditingId(null);
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        student_id: Number(form.student_id),
        subject_id: Number(form.subject_id),
        term_id: Number(form.term_id),
        marks: Number(form.marks),
      };

      if (!payload.student_id)
        throw new Error("Please select a student");

      if (!payload.subject_id)
        throw new Error("Please select a subject");

      if (!payload.term_id)
        throw new Error("Please select a term");

      if (
        payload.marks < 0 ||
        payload.marks > 100
      ) {
        throw new Error(
          "Marks must be between 0 and 100"
        );
      }

      if (editingId) {
        const updated = await updateScore(
          editingId,
          payload
        );

        setScores((prev) =>
          prev.map((s) =>
            s.id === editingId ? updated : s
          )
        );

        alert("Score updated successfully");
      } else {
        const created = await createScore(payload);

        setScores((prev) => [
          created,
          ...prev,
        ]);

        alert("Score created successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Save score failed:", error);
      setErrorMsg(
        error?.message ||
          "Failed to save score"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (score) => {
    setForm({
      student_id: String(
        score.student_id || ""
      ),
      subject_id: String(
        score.subject_id || ""
      ),
      term_id: String(score.term_id || ""),
      marks: String(score.marks || ""),
    });

    setEditingId(score.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this score?"))
      return;

    try {
      await deleteScore(id);

      setScores((prev) =>
        prev.filter((s) => s.id !== id)
      );

      alert("Score deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      setErrorMsg(
        error?.message ||
          "Failed to delete score"
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      <div style={{ marginBottom: "25px" }}>
        <h2>Student Scores</h2>

        <p style={{ color: "#6b7280" }}>
          Scores entered here automatically
          generate student results, GPA,
          averages, and transcript data.
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >
        <select
          name="student_id"
          value={form.student_id}
          onChange={handleChange}
        >
          <option value="">
            Select Student
          </option>

          {students.map((s) => (
            <option
              key={s.id}
              value={s.id}
            >
              {s?.full_name ||
                s?.user?.full_name ||
                `Student ${s.id}`}
            </option>
          ))}
        </select>

        <select
          name="subject_id"
          value={form.subject_id}
          onChange={handleChange}
        >
          <option value="">
            {form.student_id
              ? "Select Subject"
              : "Select Student First"}
          </option>

          {filteredSubjects.map((s) => (
            <option
              key={s.id}
              value={s.id}
            >
              {s.name}
            </option>
          ))}
        </select>

        <select
          name="term_id"
          value={form.term_id}
          onChange={handleChange}
        >
          <option value="">
            Select Term
          </option>

          {terms.map((t) => (
            <option
              key={t.id}
              value={t.id}
            >
              {t.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="marks"
          value={form.marks}
          onChange={handleChange}
          min="0"
          max="100"
          placeholder="Marks"
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Score"
            : "Create Score"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
        )}
      </form>

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {loading ? (
        <Loader />
      ) : scores.length === 0 ? (
        <p>No scores available</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Subject</th>
              <th>Term</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {scores.map((score) => (
              <tr key={score.id}>
                <td>{score.id}</td>

                <td>
                  {getStudentName(
                    score.student_id
                  )}
                </td>

                <td>
                  {getCourseName(
                    score.course_id
                  )}
                </td>

                <td>
                  {score?.subject?.name ||
                    getSubjectName(
                      score.subject_id
                    )}
                </td>

                <td>
                  {getTermName(
                    score.term_id
                  )}
                </td>

                <td>{score.marks}</td>

                <td>
                  <button
                    onClick={() =>
                      handleEdit(score)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(score.id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const formStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default Scores;