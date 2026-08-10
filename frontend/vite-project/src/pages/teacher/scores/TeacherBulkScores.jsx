
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./TeacherBulkScores.css";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherCourses,
  getTeacherStudents,
  teacherBulkCreateScores,
  getTeacherScores,
  updateTeacherScore,
  deleteTeacherScore,
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

// ======================================================
// ICONS
// ======================================================

import {
  FaSave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

/**
 * ======================================================
 * TEACHER SCORES
 * ======================================================
 *
 * FEATURES
 *
 * 1. Select Course
 * 2. Select Subject
 * 3. Select multiple students
 * 4. Enter marks for selected students
 * 5. Submit scores in bulk
 * 6. View existing scores
 * 7. Edit existing score
 * 8. Delete existing score
 *
 * BULK CREATE PAYLOAD
 *
 * [
 *   {
 *     student_id: 1,
 *     subject_id: 2,
 *     term_id: 3,
 *     marks: 75
 *   }
 * ]
 *
 * ======================================================
 */

const TeacherBulkScores = () => {

  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================

  const teacherId =
    user?.user_id ??
    user?.id;

  // ======================================================
  // BASIC DATA
  // ======================================================

  const [courses, setCourses] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [term, setTerm] =
    useState(null);

  // ======================================================
  // BULK SCORE ROWS
  // ======================================================

  const [rows, setRows] =
    useState([]);

  // ======================================================
  // SELECTION
  // ======================================================

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  // ======================================================
  // EXISTING SCORES
  // ======================================================

  const [scores, setScores] =
    useState([]);

  const [scoresLoading, setScoresLoading] =
    useState(false);

  // ======================================================
  // EDIT STATE
  // ======================================================

  const [editingScoreId, setEditingScoreId] =
    useState(null);

  const [editMarks, setEditMarks] =
    useState("");

  // ======================================================
  // LOADING
  // ======================================================

  const [pageLoading, setPageLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ======================================================
  // MESSAGES
  // ======================================================

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  // ======================================================
  // INITIAL PAGE LOAD
  // ======================================================

  useEffect(() => {

    if (!teacherId) {
      return;
    }

    initializePage();

  }, [teacherId]);

  // ======================================================
  // INITIALIZE PAGE
  // ======================================================

  const initializePage = async () => {

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

      if (activeTerm?.id) {

        setTerm(
          activeTerm
        );

      } else {

        setTerm(null);

        setErrorMsg(
          "No active term is currently available."
        );

      }

    } catch (error) {

      console.error(
        "Teacher scores initialization failed:",
        error
      );

      setErrorMsg(
        getErrorMessage(error)
      );

    } finally {

      setPageLoading(false);

    }

  };

  // ======================================================
  // LOAD COURSE DATA
  // ======================================================

  useEffect(() => {

    if (
      !selectedCourse ||
      !teacherId
    ) {

      setSubjects([]);
      setStudents([]);
      setRows([]);
      setSelectedSubject("");

      return;

    }

    setSelectedSubject("");

    loadCourseData();

  }, [
    selectedCourse,
    teacherId,
  ]);

  // ======================================================
  // LOAD SUBJECTS + STUDENTS
  // ======================================================

  const loadCourseData = async () => {

    try {

      setLoading(true);

      setErrorMsg("");
      setSuccessMsg("");

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
        Array.isArray(courseSubjects)
          ? courseSubjects
          : [];

      const studentsList =
        Array.isArray(courseStudents)
          ? courseStudents
          : [];

      setSubjects(
        subjectsList
      );

      setStudents(
        studentsList
      );

      // --------------------------------------------------
      // CREATE BULK SCORE ROWS
      // --------------------------------------------------

      setRows(

        studentsList.map(
          (student) => ({

            student_id:
              student.id,

            selected:
              false,

            marks:
              "",

          })
        )

      );

    } catch (error) {

      console.error(
        "Loading teacher course data failed:",
        error
      );

      setErrorMsg(
        getErrorMessage(error)
      );

      setSubjects([]);
      setStudents([]);
      setRows([]);

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // LOAD EXISTING SCORES
  // ======================================================

  const loadExistingScores = async () => {

    if (!teacherId) {
      return;
    }

    try {

      setScoresLoading(true);

      const result =
        await getTeacherScores(
          teacherId
        );

      setScores(

        Array.isArray(result)
          ? result
          : []

      );

    } catch (error) {

      console.error(
        "Loading teacher scores failed:",
        error
      );

      setErrorMsg(
        getErrorMessage(error)
      );

      setScores([]);

    } finally {

      setScoresLoading(false);

    }

  };

  // ======================================================
  // LOAD EXISTING SCORES AFTER PAGE LOAD
  // ======================================================

  useEffect(() => {

    if (!teacherId) {
      return;
    }

    loadExistingScores();

  }, [teacherId]);

  // ======================================================
  // SELECT / UNSELECT STUDENT
  // ======================================================

  const handleStudentSelection = (
    index
  ) => {

    setRows((prev) =>

      prev.map(
        (row, rowIndex) =>

          rowIndex === index

            ? {
                ...row,
                selected:
                  !row.selected,
              }

            : row

      )

    );

  };

  // ======================================================
  // SELECT ALL STUDENTS
  // ======================================================

  const handleSelectAll = (
    checked
  ) => {

    setRows((prev) =>

      prev.map(
        (row) => ({

          ...row,

          selected:
            checked,

        })
      )

    );

  };

  // ======================================================
  // ALL STUDENTS SELECTED
  // ======================================================

  const allStudentsSelected =
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.selected
    );

  // ======================================================
  // SELECTED COUNT
  // ======================================================

  const selectedCount =
    rows.filter(
      (row) =>
        row.selected
    ).length;

  // ======================================================
  // HANDLE SCORE CHANGE
  // ======================================================

  const handleScoreChange = (
    index,
    value
  ) => {

    if (value === "") {

      setRows((prev) =>

        prev.map(
          (row, rowIndex) =>

            rowIndex === index

              ? {
                  ...row,
                  marks: "",
                }

              : row

        )

      );

      return;

    }

    const numericValue =
      Number(value);

    if (
      numericValue < 0 ||
      numericValue > 100
    ) {

      return;

    }

    setRows((prev) =>

      prev.map(
        (row, rowIndex) =>

          rowIndex === index

            ? {
                ...row,
                marks: value,
              }

            : row

      )

    );

  };

  // ======================================================
  // SUBMIT BULK SCORES
  // ======================================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    // --------------------------------------------------
    // COURSE
    // --------------------------------------------------

    if (!selectedCourse) {

      setErrorMsg(
        "Please select a course."
      );

      return;

    }

    // --------------------------------------------------
    // SUBJECT
    // --------------------------------------------------

    if (!selectedSubject) {

      setErrorMsg(
        "Please select a subject."
      );

      return;

    }

    // --------------------------------------------------
    // TERM
    // --------------------------------------------------

    if (!term?.id) {

      setErrorMsg(
        "No active term found."
      );

      return;

    }

    // --------------------------------------------------
    // SELECTED STUDENTS
    // --------------------------------------------------

    const selectedRows =
      rows.filter(
        (row) =>
          row.selected
      );

    if (
      selectedRows.length === 0
    ) {

      setErrorMsg(
        "Please select at least one student."
      );

      return;

    }

    // --------------------------------------------------
    // CHECK MISSING MARKS
    // --------------------------------------------------

    const missingMarks =
      selectedRows.some(
        (row) =>
          row.marks === "" ||
          row.marks === null ||
          row.marks === undefined
      );

    if (missingMarks) {

      setErrorMsg(
        "Please enter a score for every selected student."
      );

      return;

    }

    // --------------------------------------------------
    // BUILD PAYLOAD
    // --------------------------------------------------

    const payload =
      selectedRows.map(
        (row) => ({

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
              term.id
            ),

          marks:
            toNumber(
              row.marks
            ),

        })
      );

    // --------------------------------------------------
    // SCORE VALIDATION
    // --------------------------------------------------

    const invalidScore =
      payload.some(
        (item) =>
          item.marks < 0 ||
          item.marks > 100
      );

    if (invalidScore) {

      setErrorMsg(
        "Scores must be between 0 and 100."
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

        `${payload.length} student score(s) submitted successfully.`

      );

      // ------------------------------------------------
      // CLEAR BULK FORM
      // ------------------------------------------------

      setRows((prev) =>

        prev.map(
          (row) => ({

            ...row,

            selected:
              false,

            marks:
              "",

          })
        )

      );

      // ------------------------------------------------
      // REFRESH EXISTING SCORES
      // ------------------------------------------------

      await loadExistingScores();

    } catch (error) {

      console.error(
        "Bulk score submission failed:",
        error
      );

      setErrorMsg(
        getErrorMessage(error)
      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // START EDITING SCORE
  // ======================================================

  const handleEditScore = (
    score
  ) => {

    setEditingScoreId(
      score.id
    );

    setEditMarks(
      score.marks ?? ""
    );

    setErrorMsg("");
    setSuccessMsg("");

  };

  // ======================================================
  // CANCEL EDIT
  // ======================================================

  const handleCancelEdit = () => {

    setEditingScoreId(null);

    setEditMarks("");

  };

  // ======================================================
  // SAVE EDITED SCORE
  // ======================================================

  const handleUpdateScore = async (
    scoreId
  ) => {

    if (
      editMarks === "" ||
      editMarks === null
    ) {

      setErrorMsg(
        "Please enter a score."
      );

      return;

    }

    const numericScore =
      Number(editMarks);

    if (
      numericScore < 0 ||
      numericScore > 100
    ) {

      setErrorMsg(
        "Score must be between 0 and 100."
      );

      return;

    }

    try {

      setLoading(true);

      setErrorMsg("");
      setSuccessMsg("");

      await updateTeacherScore(
        teacherId,
        scoreId,
        {
          marks: numericScore,
        }
      );

      setSuccessMsg(
        "Score updated successfully."
      );

      setEditingScoreId(null);
      setEditMarks("");

      await loadExistingScores();

    } catch (error) {

      console.error(
        "Updating score failed:",
        error
      );

      setErrorMsg(
        getErrorMessage(error)
      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // DELETE SCORE
  // ======================================================

  const handleDeleteScore = async (
    scoreId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this score?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setLoading(true);

      setErrorMsg("");
      setSuccessMsg("");

      await deleteTeacherScore(
        teacherId,
        scoreId
      );

      setSuccessMsg(
        "Score deleted successfully."
      );

      await loadExistingScores();

    } catch (error) {

      console.error(
        "Deleting score failed:",
        error
      );

      setErrorMsg(
        getErrorMessage(error)
      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // FIND COURSE NAME
  // ======================================================

  const getCourseName = (
    courseId
  ) => {

    const course =
      courses.find(
        (item) =>
          Number(item.id) ===
          Number(courseId)
      );

    return (
      course?.name ||
      "—"
    );

  };

  // ======================================================
  // FIND SUBJECT NAME
  // ======================================================

  const getSubjectName = (
    subjectId
  ) => {

    const subject =
      subjects.find(
        (item) =>
          Number(item.id) ===
          Number(subjectId)
      );

    return (
      subject?.name ||
      "—"
    );

  };

  // ======================================================
  // FIND STUDENT NAME
  // ======================================================

  const getStudentName = (
    score
  ) => {

    if (
      score.student?.user?.full_name
    ) {

      return score.student.user.full_name;

    }

    if (
      score.student?.full_name
    ) {

      return score.student.full_name;

    }

    if (
      score.student_name
    ) {

      return score.student_name;

    }

    const student =
      students.find(
        (item) =>
          Number(item.id) ===
          Number(score.student_id)
      );

    return (
      student?.user?.full_name ||
      student?.full_name ||
      "—"
    );

  };

  // ======================================================
  // FILTER EXISTING SCORES
  // ======================================================

  const displayedScores =
    useMemo(() => {

      if (!selectedCourse) {

        return scores;

      }

      return scores.filter(
        (score) => {

          if (
            score.course_id ===
            undefined
          ) {

            return true;

          }

          return (
            Number(score.course_id) ===
            Number(selectedCourse)
          );

        }
      );

    }, [
      scores,
      selectedCourse,
    ]);

  // ======================================================
  // PAGE LOADING
  // ======================================================

  if (pageLoading) {

    return <Loader />;

  }

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="teacher-bulk-scores">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="bulk-header">

        <div>

          <h1>
            Teacher Scores
          </h1>

          <p>
            Create, update and manage your students' scores.
          </p>

          {term?.name && (

            <div className="active-term">

              Active Term

              <strong>
                {term.name}
              </strong>

            </div>

          )}

        </div>

      </div>

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {successMsg && (

        <div className="success-message">

          <FaCheck />

          <span>
            {successMsg}
          </span>

        </div>

      )}

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {errorMsg && (

        <ErrorMessage
          message={errorMsg}
        />

      )}

      {/* ==================================================
          BULK ENTRY FORM
      ================================================== */}

      <form
        className="bulk-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            SCORE INFORMATION
        ================================================= */}

        <div className="bulk-form-card">

          <div className="form-card-header">

            <div>

              <h2>
                Bulk Score Entry
              </h2>

              <p>
                Select a course and subject, then select
                multiple students and enter their scores.
              </p>

            </div>

          </div>

          {/* ===============================================
              COURSE + SUBJECT
          =============================================== */}

          <div className="form-grid">

            {/* COURSE */}

            <div className="form-group">

              <label htmlFor="course">
                Course
              </label>

              <select
                id="course"
                value={selectedCourse}
                onChange={(e) =>
                  setSelectedCourse(
                    e.target.value
                  )
                }
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

            </div>

            {/* SUBJECT */}

            <div className="form-group">

              <label htmlFor="subject">
                Subject
              </label>

              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) =>
                  setSelectedSubject(
                    e.target.value
                  )
                }
                disabled={
                  !selectedCourse ||
                  subjects.length === 0
                }
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

            </div>

          </div>

        </div>

        {/* =================================================
            COURSE LOADING
        ================================================= */}

        {loading && (

          <Loader />

        )}

        {/* =================================================
            EMPTY STUDENTS
        ================================================= */}

        {!loading &&
          selectedCourse &&
          students.length === 0 && (

            <div className="empty-state">

              <h3>
                No Students Found
              </h3>

              <p>
                No students are currently assigned to
                this course.
              </p>

            </div>

          )}

        {/* =================================================
            BULK STUDENT SCORE TABLE
        ================================================= */}

        {!loading &&
          students.length > 0 && (

            <div className="table-card">

              {/* TABLE HEADER */}

              <div className="table-header">

                <div>

                  <h2>
                    Student Score Entry
                  </h2>

                  <p>
                    Select students and enter their marks
                    from 0 to 100.
                  </p>

                </div>

                <div className="selected-counter">

                  <strong>
                    {selectedCount}
                  </strong>

                  <span>
                    selected
                  </span>

                </div>

              </div>

              {/* TABLE */}

              <div className="table-wrapper">

                <table className="bulk-table">

                  <thead>

                    <tr>

                      <th>
                        <input
                          type="checkbox"
                          checked={
                            allStudentsSelected
                          }
                          onChange={(e) =>
                            handleSelectAll(
                              e.target.checked
                            )
                          }
                          aria-label="Select all students"
                        />
                      </th>

                      <th>
                        #
                      </th>

                      <th>
                        Student Name
                      </th>

                      <th>
                        Admission No.
                      </th>

                      <th>
                        Score (0 - 100)
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {students.map(
                      (
                        student,
                        index
                      ) => {

                        const row =
                          rows[index];

                        return (

                          <tr
                            key={
                              student.id
                            }
                            className={
                              row?.selected
                                ? "selected-row"
                                : ""
                            }
                          >

                            <td>

                              <input
                                type="checkbox"
                                checked={
                                  row?.selected ??
                                  false
                                }
                                onChange={() =>
                                  handleStudentSelection(
                                    index
                                  )
                                }
                                aria-label={`Select ${
                                  student.user?.full_name ||
                                  student.full_name ||
                                  "student"
                                }`}
                              />

                            </td>

                            <td>
                              {index + 1}
                            </td>

                            <td className="student-name">

                              {student.user?.full_name ||

                                student.full_name ||

                                "N/A"}

                            </td>

                            <td>

                              {student.admission_number ||

                                student.admission_no ||

                                student.id}

                            </td>

                            <td>

                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                className="score-input"
                                placeholder="Enter score"
                                value={
                                  row?.marks ??
                                  ""
                                }
                                onChange={(e) =>
                                  handleScoreChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                disabled={
                                  !row?.selected
                                }
                              />

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* SUBMIT */}

              <div className="submit-section">

                <div className="submit-info">

                  <strong>
                    {selectedCount}
                  </strong>

                  <span>
                    student(s) selected
                  </span>

                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={
                    loading ||
                    !selectedCourse ||
                    !selectedSubject ||
                    !term?.id ||
                    selectedCount === 0
                  }
                >

                  <FaSave />

                  {loading
                    ? "Submitting Scores..."
                    : "Submit Bulk Scores"}

                </button>

              </div>

            </div>

          )}

      </form>

      {/* ==================================================
          EXISTING SCORES
      ================================================== */}

      <div className="table-card existing-scores-card">

        <div className="table-header">

          <div>

            <h2>
              Existing Scores
            </h2>

            <p>
              Review, edit or delete scores already
              submitted by you.
            </p>

          </div>

        </div>

        {scoresLoading ? (

          <Loader />

        ) : displayedScores.length === 0 ? (

          <div className="empty-state">

            <h3>
              No Scores Found
            </h3>

            <p>
              Scores you submit will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="bulk-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Term
                  </th>

                  <th>
                    Marks
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {displayedScores.map(
                  (score) => {

                    const isEditing =
                      editingScoreId ===
                      score.id;

                    return (

                      <tr
                        key={
                          score.id
                        }
                      >

                        <td>
                          {score.id}
                        </td>

                        <td className="student-name">

                          {getStudentName(
                            score
                          )}

                        </td>

                        <td>

                          {score.subject?.name ||

                            score.subject_name ||

                            getSubjectName(
                              score.subject_id
                            )}

                        </td>

                        <td>

                          {score.term?.name ||

                            score.term_name ||

                            term?.name ||

                            "—"}

                        </td>

                        <td>

                          {isEditing ? (

                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              className="score-input"
                              value={
                                editMarks
                              }
                              onChange={(e) =>
                                setEditMarks(
                                  e.target.value
                                )
                              }
                            />

                          ) : (

                            <strong>
                              {score.marks}
                            </strong>

                          )}

                        </td>

                        <td>

                          <div className="action-buttons">

                            {isEditing ? (

                              <>

                                <button
                                  type="button"
                                  className="save-edit-btn"
                                  onClick={() =>
                                    handleUpdateScore(
                                      score.id
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                  title="Save changes"
                                >

                                  <FaCheck />

                                  Save

                                </button>

                                <button
                                  type="button"
                                  className="cancel-edit-btn"
                                  onClick={
                                    handleCancelEdit
                                  }
                                  disabled={
                                    loading
                                  }
                                  title="Cancel editing"
                                >

                                  <FaTimes />

                                  Cancel

                                </button>

                              </>

                            ) : (

                              <>

                                <button
                                  type="button"
                                  className="edit-btn"
                                  onClick={() =>
                                    handleEditScore(
                                      score
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                  title="Edit score"
                                >

                                  <FaEdit />

                                  Edit

                                </button>

                                <button
                                  type="button"
                                  className="delete-btn"
                                  onClick={() =>
                                    handleDeleteScore(
                                      score.id
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                  title="Delete score"
                                >

                                  <FaTrash />

                                  Delete

                                </button>

                              </>

                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};

export default TeacherBulkScores;
