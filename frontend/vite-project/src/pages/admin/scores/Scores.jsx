import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Scores.css";

// ======================================================
// SERVICES
// ======================================================

import {
  createScore,
  getAllScores,
  updateScore,
  deleteScore,
} from "../../../services/scoreService";

import {
  getAllStudents,
} from "../../../services/studentService";

import {
  getSubjects,
} from "../../../services/subjectService";

import {
  getTerms,
} from "../../../services/termService";

import {
  getCourses,
} from "../../../services/courseService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaClipboardCheck,
  FaSearch,
  FaUserGraduate,
  FaBook,
  FaSchool,
  FaCalendarAlt,
  FaPercentage,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";

/**
 * ======================================================
 * SCORES PAGE
 * Backend Compatible
 * Professional UI
 * ======================================================
 */

const Scores = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [scores, setScores] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [terms, setTerms] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  // ======================================================
  // SEARCH
  // ======================================================

  const [search, setSearch] =
    useState("");

  // ======================================================
  // FORM
  // ======================================================

  const [form, setForm] =
    useState({

      student_id: "",

      subject_id: "",

      course_id: "",

      term_id: "",

      marks: "",

    });

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const totalScores =
    scores.length;

  const averageScore =
    totalScores > 0
      ? (
          scores.reduce(
            (sum, item) =>
              sum +
              Number(
                item.marks || 0
              ),
            0
          ) / totalScores
        ).toFixed(1)
      : "0.0";

  const passedScores =
    scores.filter(
      (item) =>
        Number(item.marks) >= 40
    ).length;

  const failedScores =
    scores.filter(
      (item) =>
        Number(item.marks) < 40
    ).length;

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const filteredScores =
    useMemo(() => {

      if (!search.trim()) {

        return scores;

      }

      const keyword =
        search.toLowerCase();

      return scores.filter(
        (score) =>

          score.student_name
            ?.toLowerCase()
            .includes(keyword)

          ||

          score.subject_name
            ?.toLowerCase()
            .includes(keyword)

          ||

          score.course_name
            ?.toLowerCase()
            .includes(keyword)

      );

    }, [scores, search]);

  // ======================================================
  // GRADE HELPER
  // ======================================================

  const getGrade = (
    marks
  ) => {

    const score =
      Number(marks);

    if (score >= 70)
      return "A";

    if (score >= 60)
      return "B";

    if (score >= 50)
      return "C";

    if (score >= 45)
      return "D";

    if (score >= 40)
      return "E";

    return "F";

  };

  // ======================================================
  // GRADE BADGE
  // ======================================================

  const getGradeClass = (
    marks
  ) => {

    const grade =
      getGrade(marks);

    switch (grade) {

      case "A":
        return "grade-a";

      case "B":
        return "grade-b";

      case "C":
        return "grade-c";

      case "D":
        return "grade-d";

      case "E":
        return "grade-e";

      default:
        return "grade-f";

    }

  };

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

      setScores(
        Array.isArray(scoresData)
          ? scoresData
          : []
      );

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

      setCourses(
        Array.isArray(coursesData)
          ? coursesData
          : []
      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        "Failed to load scores."

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INIT
  // ======================================================

  useEffect(() => {

    fetchData();

  }, []);

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
  // RESET FORM
  // ======================================================

  const resetForm = () => {

    setForm({

      student_id: "",

      subject_id: "",

      course_id: "",

      term_id: "",

      marks: "",

    });

    setEditingId(null);

    setErrorMsg("");

  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitting) return;

    try {

      setSubmitting(true);

      setErrorMsg("");

      const payload = {

        student_id: Number(
          form.student_id
        ),

        subject_id: Number(
          form.subject_id
        ),

        course_id: Number(
          form.course_id
        ),

        term_id: Number(
          form.term_id
        ),

        marks: Number(
          form.marks
        ),

      };

      // ------------------------------------
      // VALIDATION
      // ------------------------------------

      if (!payload.student_id) {

        throw new Error(
          "Please select a student."
        );

      }

      if (!payload.subject_id) {

        throw new Error(
          "Please select a subject."
        );

      }

      if (!payload.course_id) {

        throw new Error(
          "Please select a course."
        );

      }

      if (!payload.term_id) {

        throw new Error(
          "Please select a term."
        );

      }

      if (

        isNaN(payload.marks) ||

        payload.marks < 0 ||

        payload.marks > 100

      ) {

        throw new Error(
          "Marks must be between 0 and 100."
        );

      }

      // ------------------------------------
      // UPDATE
      // ------------------------------------

      if (editingId) {

        await updateScore(

          editingId,

          payload

        );

        alert(
          "Score updated successfully."
        );

      }

      // ------------------------------------
      // CREATE
      // ------------------------------------

      else {

        await createScore(
          payload
        );

        alert(
          "Score added successfully."
        );

      }

      resetForm();

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        "Failed to save score."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (score) => {

    setEditingId(score.id);

    setForm({

      student_id: String(
        score.student_id || ""
      ),

      subject_id: String(
        score.subject_id || ""
      ),

      course_id: String(
        score.course_id || ""
      ),

      term_id: String(
        score.term_id || ""
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
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Delete this score?"
    );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await deleteScore(id);

      alert(
        "Score deleted successfully."
      );

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        "Failed to delete score."

      );

    }

  };

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="scores-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="scores-header">

        <div>

          <h1>
            Score Management
          </h1>

          <p>
            Record, edit and manage student scores for all
            academic courses and terms.
          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD STATISTICS
      ====================================================== */}

      <div className="score-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaClipboardCheck />

          </div>

          <div>

            <h2>{totalScores}</h2>

            <span>Total Scores</span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaChartLine />

          </div>

          <div>

            <h2>{averageScore}</h2>

            <span>Average Score</span>

          </div>

        </div>

        <div className="stat-card emerald">

          <div className="stat-icon">

            <FaPercentage />

          </div>

          <div>

            <h2>{passedScores}</h2>

            <span>Passed</span>

          </div>

        </div>

        <div className="stat-card red">

          <div className="stat-icon">

            <FaTimes />

          </div>

          <div>

            <h2>{failedScores}</h2>

            <span>Failed</span>

          </div>

        </div>

      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="search-card">

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input

            type="text"

            placeholder="Search by student, subject or course..."

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

          />

        </div>

      </div>

      {/* ======================================================
          FORM CARD
      ====================================================== */}

      <div className="score-form-card">

        <h2>

          {editingId

            ? "Update Score"

            : "Add New Score"}

        </h2>

        <form

          onSubmit={handleSubmit}

          className="score-form"

        >

          {/* Student */}

          <div className="form-group">

            <FaUserGraduate className="form-icon" />

            <select

              name="student_id"

              value={form.student_id}

              onChange={handleChange}

              required

            >

              <option value="">

                Select Student

              </option>

              {students.map((student) => (

                <option

                  key={student.id}

                  value={student.id}

                >

                  {student.full_name}

                </option>

              ))}

            </select>

          </div>

          {/* Subject */}

          <div className="form-group">

            <FaBook className="form-icon" />

            <select

              name="subject_id"

              value={form.subject_id}

              onChange={handleChange}

              required

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

          {/* Course */}

          <div className="form-group">

            <FaSchool className="form-icon" />

            <select

              name="course_id"

              value={form.course_id}

              onChange={handleChange}

              required

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

          {/* Term */}

          <div className="form-group">

            <FaCalendarAlt className="form-icon" />

            <select

              name="term_id"

              value={form.term_id}

              onChange={handleChange}

              required

            >

              <option value="">

                Select Term

              </option>

              {terms.map((term) => (

                <option

                  key={term.id}

                  value={term.id}

                >

                  {term.name}

                </option>

              ))}

            </select>

          </div>

          {/* Marks */}

          <div className="form-group">

            <FaPercentage className="form-icon" />

            <input

              type="number"

              name="marks"

              placeholder="Score"

              min="0"

              max="100"

              value={form.marks}

              onChange={handleChange}

              required

            />

          </div>

          <div className="score-buttons">

            <button

              type="submit"

              className="save-btn"

              disabled={submitting}

            >

              {submitting

                ? "Processing..."

                : editingId ? (

                    <>

                      <FaEdit />

                      Update Score

                    </>

                  ) : (

                    <>

                      <FaPlus />

                      Save Score

                    </>

                  )}

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

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMsg && (

        <ErrorMessage

          message={errorMsg}

        />

      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {loading ? (

        <Loader />

      ) : filteredScores.length === 0 ? (

        <div className="empty-state">

          <FaClipboardCheck />

          <h3>No Scores Found</h3>

          <p>

            No score records match your current search.

          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="scores-table">

            <thead>

              <tr>

                <th>Student</th>

                <th>Subject</th>

                <th>Course</th>

                <th>Term</th>

                <th>Marks</th>

                <th>Grade</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredScores.map((score) => (

                <tr key={score.id}>

                  {/* ==========================================
                      STUDENT
                  ========================================== */}

                  <td>

                    <div className="student-cell">

                      <div className="student-avatar">

                        {score.student_name
                          ?.charAt(0)
                          ?.toUpperCase() || "S"}

                      </div>

                      <div>

                        <strong>

                          {score.student_name ||
                            "Unknown"}

                        </strong>

                      </div>

                    </div>

                  </td>

                  {/* ==========================================
                      SUBJECT
                  ========================================== */}

                  <td>

                    {score.subject_name ||
                      "N/A"}

                  </td>

                  {/* ==========================================
                      COURSE
                  ========================================== */}

                  <td>

                    {score.course_name ||
                      "N/A"}

                  </td>

                  {/* ==========================================
                      TERM
                  ========================================== */}

                  <td>

                    {score.term_name ||
                      "N/A"}

                  </td>

                  {/* ==========================================
                      MARKS
                  ========================================== */}

                  <td>

                    <span className="marks-badge">

                      {score.marks}

                    </span>

                  </td>

                  {/* ==========================================
                      GRADE
                  ========================================== */}

                  <td>

                    <span
                      className={`grade-badge ${getGradeClass(
                        score.marks
                      )}`}
                    >

                      {getGrade(score.marks)}

                    </span>

                  </td>

                  {/* ==========================================
                      ACTIONS
                  ========================================== */}

                  <td>

                    <div className="action-buttons">

                      <button

                        className="edit-btn"

                        onClick={() =>
                          handleEdit(score)
                        }

                      >

                        <FaEdit />

                        Edit

                      </button>

                      <button

                        className="delete-btn"

                        onClick={() =>
                          handleDelete(score.id)
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

export default Scores;