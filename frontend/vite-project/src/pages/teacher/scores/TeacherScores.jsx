import React, {
  useEffect,
  useState,
} from "react";

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

/**
 * ======================================================
 * Teacher Scores
 *
 * Backend
 * GET    /teachers/{teacher_id}/scores
 * POST   /teachers/{teacher_id}/scores
 * PATCH  /teachers/{teacher_id}/scores/{score_id}
 * DELETE /teachers/{teacher_id}/scores/{score_id}
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

  console.log("USER OBJECT:", user);
  console.log("TEACHER ID:", teacherId);

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

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

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

        setErrorMsg(
          error?.message ??
          "Failed to load scores."
        );

        setScores([]);

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
  // INIT
  // ======================================================

  useEffect(() => {

    fetchScores();

  }, [teacherId]);

  useEffect(() => {

    if (!teacherId) return;

    loadInitialData();

  }, [teacherId]);

  // ======================================================
  // LOAD COURSE DATA
  // ======================================================

  useEffect(() => {

    if (!selectedCourse || !teacherId) {

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
            Array.isArray(
              courseStudents
            )
              ? courseStudents
              : []
          );

          setSubjects(
            Array.isArray(
              courseSubjects
            )
              ? courseSubjects
              : []
          );

        } catch (error) {

          console.error(
            "Failed loading course data:",
            error
          );

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
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {

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
  // RESET
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

    };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setSubmitting(true);

      setErrorMsg("");
      setSuccessMsg("");

      try {

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
          Object.values(payload).some((v) =>
            Number.isNaN(v)
          )
        ) {

          throw new Error(
            "All fields must contain valid numbers."
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
  // EDIT
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

        student_id:
          String(
            score.student?.id ??
            score.student_id
          ),

        subject_id:
          String(
            score.subject?.id ??
            score.subject_id
          ),

        term_id:
          String(
            score.term?.id ??
            score.term_id
          ),

        marks:
          String(
            score.marks ?? ""
          ),

      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };

  // ======================================================
  // DELETE
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
    <div>

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h2>Teacher Scores</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Create, update and manage your students'
          scores.
        </p>
      </div>

      {/* ====================================================== */}
      {/* SUCCESS */}
      {/* ====================================================== */}

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

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >

        <select
          id="course_id"
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
          required
          disabled={!selectedCourse}
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
          required
          disabled={!selectedCourse}
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
          placeholder="Marks"
          value={form.marks}
          onChange={handleChange}
          min="0"
          max="100"
          required
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
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

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      {scores.length === 0 ? (

        <p>No scores found.</p>

      ) : (

        <table style={tableStyle}>

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

            {scores.map(
              (score) => (

                <tr
                  key={score.id}
                >

                  <td>
                    {score.id}
                  </td>

                  <td>
                    {score.student?.user?.full_name ||
                      score.student?.full_name ||
                      score.student_id}
                  </td>

                  <td>
                    {score.subject?.name ||
                      score.subject_id}
                  </td>

                  <td>
                    {score.term?.name ||
                      score.term_id}
                  </td>

                  <td>
                    {score.marks}
                  </td>

                  <td>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(score)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            score.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              )
            )}

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

export default TeacherScores;