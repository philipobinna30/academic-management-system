import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./BulkScores.css";

// ======================================================
// SERVICES
// ======================================================

import { createBulkScores } from "../../../services/scoreService";

import { getAllStudents } from "../../../services/studentService";

import { getSubjects } from "../../../services/subjectService";

import { getTerms } from "../../../services/termService";

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
  FaUsers,
  FaBook,
  FaCalendarAlt,
  FaSearch,
  FaPlus,
  FaTrash,
  FaSave,
} from "react-icons/fa";

/**
 * ======================================================
 * BULK SCORES PAGE
 * Admin / Teacher
 * Backend Compatible
 * ======================================================
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
      marks: "",
    },
  ]);

  const [students, setStudents] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [terms, setTerms] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // SEARCH
  // ======================================================

  const [search, setSearch] =
    useState("");

  // ======================================================
  // DASHBOARD STATS
  // ======================================================

  const totalRows =
    rows.length;

  const totalStudents =
    students.length;

  const totalSubjects =
    subjects.length;

  const totalTerms =
    terms.length;

  // ======================================================
  // FILTERED ROWS
  // ======================================================

  const filteredRows =
    useMemo(() => {

      if (!search.trim()) {

        return rows;

      }

      const keyword =
        search.toLowerCase();

      return rows.filter((row) => {

        const student =
          students.find(
            (s) =>
              Number(s.id) ===
              Number(row.student_id)
          );

        const subject =
          subjects.find(
            (s) =>
              Number(s.id) ===
              Number(row.subject_id)
          );

        return (

          student?.full_name
            ?.toLowerCase()
            .includes(keyword) ||

          subject?.name
            ?.toLowerCase()
            .includes(keyword)

        );

      });

    }, [
      rows,
      students,
      subjects,
      search,
    ]);

  // ======================================================
  // FETCH INITIAL DATA
  // ======================================================

  const fetchData = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const [

        studentsData,

        subjectsData,

        termsData,

      ] = await Promise.all([

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

      console.error(error);

      setErrorMsg(

        error?.message ||

          "Failed to load required data."

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
  // ROW CHANGE
  // ======================================================

  const handleRowChange = (

    index,

    field,

    value

  ) => {

    setRows((prev) =>

      prev.map((row, i) =>

        i === index

          ? {

              ...row,

              [field]: value,

            }

          : row

      )

    );

  };

  // ======================================================
  // ADD ROW
  // ======================================================

  const handleAddRow = () => {

    setRows((prev) => [

      ...prev,

      {

        student_id: "",

        subject_id: "",

        term_id: "",

        marks: "",

      },

    ]);

  };

  // ======================================================
  // REMOVE ROW
  // ======================================================

  const handleRemoveRow = (

    index

  ) => {

    if (rows.length === 1) {

      return;

    }

    setRows((prev) =>

      prev.filter(

        (_, i) => i !== index

      )

    );

  };

  // ======================================================
  // RESET
  // ======================================================

  const resetRows = () => {

    setRows([

      {

        student_id: "",

        subject_id: "",

        term_id: "",

        marks: "",

      },

    ]);

  };

  // ======================================================
  // SAVE BULK SCORES
  // ======================================================

  const handleSubmit = async (

    e

  ) => {

    e.preventDefault();

    if (submitting) return;

    try {

      setSubmitting(true);

      setErrorMsg("");

      const payload = rows.map(

        (row) => ({

          student_id: Number(

            row.student_id

          ),

          subject_id: Number(

            row.subject_id

          ),

          term_id: Number(

            row.term_id

          ),

          marks: Number(

            row.marks

          ),

        })

      );

      await createBulkScores(

        payload

      );

      alert(

        "Bulk scores uploaded successfully."

      );

      resetRows();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

          "Failed to upload scores."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="bulk-scores-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="bulk-header">

        <div>

          <h1>Bulk Score Entry</h1>

          <p>

            Upload multiple student scores at once for a selected
            subject and academic term.

          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <div className="bulk-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaClipboardCheck />

          </div>

          <div>

            <h2>{totalRows}</h2>

            <span>Score Entries</span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaUsers />

          </div>

          <div>

            <h2>{totalStudents}</h2>

            <span>Students</span>

          </div>

        </div>

        <div className="stat-card purple">

          <div className="stat-icon">

            <FaBook />

          </div>

          <div>

            <h2>{totalSubjects}</h2>

            <span>Subjects</span>

          </div>

        </div>

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaCalendarAlt />

          </div>

          <div>

            <h2>{totalTerms}</h2>

            <span>Terms</span>

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

            placeholder="Search student or subject..."

            value={search}

            onChange={(e) =>

              setSearch(e.target.value)

            }

          />

        </div>

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
          LOADER
      ====================================================== */}

      {loading ? (

        <Loader />

      ) : (

        <div className="bulk-form-card">

          <div className="bulk-form-header">

            <h2>Bulk Score Sheet</h2>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="table-wrapper">

              <table className="bulk-table">

                <thead>

                  <tr>

                    <th>Student</th>

                    <th>Subject</th>

                    <th>Term</th>

                    <th>marks</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRows.map((row, index) => (

                    <tr key={index}>

                      {/* ==========================================
                          STUDENT
                      ========================================== */}

                      <td>

                        <select
                          value={row.student_id}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "student_id",
                              e.target.value
                            )
                          }
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

                      </td>

                      {/* ==========================================
                          SUBJECT
                      ========================================== */}

                      <td>

                        <select
                          value={row.subject_id}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "subject_id",
                              e.target.value
                            )
                          }
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

                      </td>

                      {/* ==========================================
                          TERM
                      ========================================== */}

                      <td>

                        <select
  value={row.term_id}
  onChange={(e) =>
    handleRowChange(
      index,
      "term_id",
      e.target.value
    )
  }
  required
>
  <option value="">
    Select Term
  </option>

  {terms
    .filter(
      (term) =>
        Boolean(term.is_active) &&
        !Boolean(term.is_closed)
    )
    .map((term) => (
      <option
        key={term.id}
        value={term.id}
      >
        {term.name}
      </option>
    ))}
</select>

                      </td>

                      {/* ==========================================
                          marks
                      ========================================== */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Score"
                          value={row.score}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "marks",
                              e.target.value
                            )
                          }
                          required
                        />

                      </td>

                      {/* ==========================================
                          REMOVE ROW
                      ========================================== */}

                      <td>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            handleRemoveRow(index)
                          }
                        >

                          <FaTrash />

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* ==========================================
                BUTTONS
            ========================================== */}

            <div className="bulk-buttons">

              <button
                type="button"
                className="add-btn"
                onClick={handleAddRow}
              >

                <FaPlus />

                Add Row

              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={submitting}
              >

                <FaSave />

                {submitting
                  ? "Uploading..."
                  : "Upload Scores"}

              </button>

            </div>

          </form>

        </div>

      )}

    </div>

  );

};

export default BulkScores;