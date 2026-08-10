import React, {
  useEffect,
  useState,
} from "react";

import "./TeacherScores.css";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherScores,
  teacherCreateScore,
  teacherUpdateScore,
  teacherDeleteScore,
  getTeacherCourses,
  getTeacherStudents,
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
// ICONS
// ======================================================

import {
  FaClipboardList,
  FaBook,
  FaUserGraduate,
  FaSave,
  FaTimes,
  FaEdit,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * ======================================================
 * Teacher Scores
 * ======================================================
 */

const TeacherScores = () => {

  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================

  const teacherId =
    user?.user_id ??
    user?.id;

  // ======================================================
  // STATE
  // ======================================================

  const [scores, setScores] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  const [form, setForm] =
    useState({
      student_id: "",
      subject_id: "",
      term_id: "",
      marks: "",
    });

  // ======================================================
  // FETCH SCORES
  // ======================================================

  const fetchScores =
    async () => {

      if (!teacherId) return;

      try {

        setLoading(true);
        setErrorMsg("");

        const data =
          await getTeacherScores(
            teacherId
          );

        setScores(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(error);

        setScores([]);

        setErrorMsg(
          error?.message ??
          "Failed to load scores."
        );

      } finally {

        setLoading(false);

      }

    };

  // ======================================================
  // LOAD INITIAL DATA
  // ======================================================

  const loadInitialData =
    async () => {

      try {

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

          setForm((prev) => ({
            ...prev,
            term_id: String(
              activeTerm.id
            ),
          }));

        }

      } catch (error) {

        console.error(error);

      }

    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    if (!teacherId) return;

    fetchScores();
    loadInitialData();

  }, [teacherId]);

  // ======================================================
  // LOAD STUDENTS & SUBJECTS
  // ======================================================

  useEffect(() => {

    if (
      !selectedCourse ||
      !teacherId
    ) {

      setStudents([]);
      setSubjects([]);

      return;

    }

    const loadCourseData =
      async () => {

        try {

          const [
            courseStudents,
            courseSubjects,
          ] = await Promise.all([
            getTeacherStudents(
              teacherId,
              selectedCourse
            ),
            getSubjectsByCourse(
              selectedCourse
            ),
          ]);

          setStudents(
            Array.isArray(courseStudents)
              ? courseStudents
              : []
          );

          setSubjects(
            Array.isArray(courseSubjects)
              ? courseSubjects
              : []
          );

        } catch (error) {

          console.error(error);

          setStudents([]);
          setSubjects([]);

        }

      };

    loadCourseData();

  }, [
    selectedCourse,
    teacherId,
  ]);

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm =
    () => {

      setEditingId(null);

      setSelectedCourse("");

      setStudents([]);

      setSubjects([]);

      setForm((prev) => ({
        student_id: "",
        subject_id: "",
        term_id:
          prev.term_id,
        marks: "",
      }));

      setSuccessMsg("");
      setErrorMsg("");

    };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (submitting) return;

      setSubmitting(true);

      try {

        setErrorMsg("");
        setSuccessMsg("");

        const payload = {

          student_id:
            Number(form.student_id),

          subject_id:
            Number(form.subject_id),

          term_id:
            Number(form.term_id),

          marks:
            Number(form.marks),

        };

        if (
          Object.values(payload).some(
            (v) => Number.isNaN(v)
          )
        ) {

          throw new Error(
            "Please complete all required fields."
          );

        }

        if (
          payload.marks < 0 ||
          payload.marks > 100
        ) {

          throw new Error(
            "Marks must be between 0 and 100."
          );

        }

        if (editingId) {

          await teacherUpdateScore(
            teacherId,
            editingId,
            payload
          );

          setSuccessMsg(
            "Score updated successfully."
          );

        } else {

          await teacherCreateScore(
            teacherId,
            payload
          );

          setSuccessMsg(
            "Score created successfully."
          );

        }

        resetForm();

        await fetchScores();

      } catch (error) {

        console.error(error);

        setErrorMsg(
          error?.message ??
          "Failed to save score."
        );

      } finally {

        setSubmitting(false);

      }

    };


  // ======================================================
  // EDIT SCORE
  // ======================================================

  const handleEdit =
    (score) => {

      setEditingId(score.id);

      const courseId =
        score.course?.id ??
        score.course_id ??
        score.subject?.course_id;

      if (courseId) {
        setSelectedCourse(
          String(courseId)
        );
      }

      setForm({

        student_id: String(
          score.student?.id ??
          score.student_id
        ),

        subject_id: String(
          score.subject?.id ??
          score.subject_id
        ),

        term_id: String(
          score.term?.id ??
          score.term_id
        ),

        marks: String(
          score.marks ?? ""
        ),

      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };

  // ======================================================
  // DELETE SCORE
  // ======================================================

  const handleDelete =
    async (scoreId) => {

      if (
        !window.confirm(
          "Delete this score?"
        )
      ) {
        return;
      }

      try {

        setErrorMsg("");
        setSuccessMsg("");

        await teacherDeleteScore(
          teacherId,
          scoreId
        );

        setScores((prev) =>
          prev.filter(
            (item) =>
              item.id !== scoreId
          )
        );

        setSuccessMsg(
          "Score deleted successfully."
        );

      } catch (error) {

        console.error(error);

        setErrorMsg(
          error?.message ??
          "Failed to delete score."
        );

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

    <div className="teacher-scores-page">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="teacher-score-header">

        <div>

          <h1>Teacher Scores</h1>

          <p>
            Create, update and manage
            your students' scores.
          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* SUCCESS */}
      {/* ====================================================== */}

      {successMsg && (

        <div className="success-message">

          <FaCheckCircle />

          <span>
            {successMsg}
          </span>

        </div>

      )}

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* ====================================================== */}
      {/* FORM */}
      {/* ====================================================== */}

      <div className="score-form-card">

        <h2>

          {editingId
            ? "Update Score"
            : "Add Student Score"}

        </h2>

        <form
          className="score-form"
          onSubmit={handleSubmit}
        >

          <select
            name="course_id"
            value={selectedCourse}
            onChange={(e) =>
              setSelectedCourse(
                e.target.value
              )
            }
            required
          >

            <option value="">
              Select Course
            </option>

            {courses.map(
              (course) => (

                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.name}
                </option>

              )
            )}

          </select>

          <select
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            disabled={!selectedCourse}
            required
          >

            <option value="">
              Select Student
            </option>

            {students.map(
              (student) => (

                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.user?.full_name ||
                    student.full_name ||
                    `Student ${student.id}`}
                </option>

              )
            )}

          </select>

          <select
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            disabled={!selectedCourse}
            required
          >

            <option value="">
              Select Subject
            </option>

            {subjects.map(
              (subject) => (

                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                </option>

              )
            )}

          </select>

          <input
            type="number"
            name="term_id"
            value={form.term_id}
            readOnly
          />

          <input
            type="number"
            name="marks"
            placeholder="Marks (0-100)"
            value={form.marks}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />

          <div className="form-buttons">

            <button
              type="submit"
              className="save-btn"
              disabled={submitting}
            >

              <FaSave />

              {submitting
                ? "Saving..."
                : editingId
                ? "Update Score"
                : "Create Score"}

            </button>

            {editingId && (

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >

                <FaTimes />

                Cancel

              </button>

            )}

          </div>

        </form>

      </div>


      {/* ====================================================== */}
      {/* EMPTY STATE */}
      {/* ====================================================== */}

      {!loading &&
        scores.length === 0 && (

          <div className="empty-state">

            <FaClipboardList size={55} />

            <h3>
              No Scores Found
            </h3>

            <p>
              You haven't created any student
              scores yet.
            </p>

          </div>

        )}

      {/* ====================================================== */}
      {/* SCORES TABLE */}
      {/* ====================================================== */}

      {!loading &&
        scores.length > 0 && (

          <div className="table-wrapper">

            <table className="score-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Student</th>

                  <th>Subject</th>

                  <th>Term</th>

                  <th>Marks</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {scores.map((score) => (

                  <tr key={score.id}>

                    <td>
                      {score.id}
                    </td>

                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >

                        <FaUserGraduate
                          color="#2563eb"
                        />

                        {score.student?.user?.full_name ||
                          score.student?.full_name ||
                          score.student_id}

                      </div>

                    </td>

                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >

                        <FaBook
                          color="#059669"
                        />

                        {score.subject?.name ||
                          score.subject_id}

                      </div>

                    </td>

                    <td>
                      {score.term?.name ||
                        score.term_id}
                    </td>

                    <td>

                      <strong>
                        {score.marks}
                      </strong>

                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(score)
                          }
                        >

                          <FaEdit />

                          Edit

                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              score.id
                            )
                          }
                        >

                          <FaTrash />

                          Delete

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

    </div>

  );

};

export default TeacherScores;