import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./Results.css";

// ======================================================
// SERVICES
// ======================================================

import {
  getAllStudents,
} from "../../../services/studentService";

import {
  getStudentResult,
  printStudentResult,
  printStudentTranscript,
} from "../../../services/resultService";

import {
  getSessions,
} from "../../../services/sessionService";

import {
  getTerms,
} from "../../../services/termService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaChartLine,
  FaUsers,
  FaSearch,
  FaPrint,
  FaFilePdf,
  FaGraduationCap,
  FaBookOpen,
  FaFilter,
} from "react-icons/fa";

// ======================================================
// RESULTS PAGE
// Professional Dashboard
// ======================================================

const Results = () => {

  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [students, setStudents] = useState([]);

  const [resultsMap, setResultsMap] = useState({});

  const [sessions, setSessions] = useState([]);

  const [terms, setTerms] = useState([]);

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedTerm, setSelectedTerm] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // LOAD SESSIONS
  // ======================================================

  const fetchSessions = async () => {

    try {

      const data =
        await getSessions();

      const sessionList =
        Array.isArray(data)
          ? data
          : [];

      setSessions(sessionList);

      if (sessionList.length > 0) {

        const latest =
          sessionList[
            sessionList.length - 1
          ];

        setSelectedSession(latest.id);

      }

    } catch (error) {

      console.error(
        "Loading sessions failed",
        error
      );

    }

  };

  // ======================================================
  // LOAD TERMS
  // ======================================================

  const fetchTerms = async (
    sessionId
  ) => {

    if (!sessionId) {

      setTerms([]);

      setSelectedTerm("");

      return;

    }

    try {

      const data =
        await getTerms();

      const termList =
        Array.isArray(data)
          ? data
          : [];

      setTerms(termList);

      if (termList.length > 0) {

        const latest =
          termList[
            termList.length - 1
          ];

        setSelectedTerm(latest.id);

      } else {

        setSelectedTerm("");

      }

    } catch (error) {

      console.error(
        "Loading terms failed",
        error
      );

    }

  };

  // ======================================================
  // FETCH RESULTS
  // ======================================================

  const fetchResults = async () => {

    setLoading(true);

    try {

      setErrorMsg("");

      const studentsData =
        await getAllStudents();

      const studentList =
        Array.isArray(studentsData)
          ? studentsData
          : [];

      setStudents(studentList);

      const generatedResults = {};

      await Promise.all(

        studentList.map(
          async (student) => {

            try {

              const result =
                await getStudentResult(

                  student.id,

                  selectedSession || null,

                  selectedTerm || null

                );

              generatedResults[
                student.id
              ] = result;

            } catch {

              generatedResults[
                student.id
              ] = null;

            }

          }

        )

      );

      setResultsMap(
        generatedResults
      );

    } catch (error) {

      console.error(
        "Fetching results failed:",
        error
      );

      setErrorMsg(

        error.message ||

        "Failed to load results"

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    fetchSessions();

  }, []);

  // ======================================================
  // SESSION CHANGED
  // ======================================================

  useEffect(() => {

    if (selectedSession) {

      fetchTerms(selectedSession);

    }

  }, [selectedSession]);

  // ======================================================
  // TERM CHANGED
  // ======================================================

  useEffect(() => {

    if (
      selectedSession &&
      selectedTerm
    ) {

      fetchResults();

    }

  }, [

    selectedSession,

    selectedTerm,

  ]);

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const filteredStudents =
    useMemo(() => {

      if (!search.trim()) {

        return students;

      }

      const keyword =
        search.toLowerCase();

      return students.filter(

        (student) => {

          const result =
            resultsMap[
              student.id
            ];

          return (

            getStudentName(
              student,
              result
            )

              ?.toLowerCase()

              .includes(keyword)

            ||

            getCourseName(student)

              ?.toLowerCase()

              .includes(keyword)

          );

        }

      );

    }, [

      students,

      resultsMap,

      search,

    ]);

  // ======================================================
  // DASHBOARD STATS
  // ======================================================

  const totalStudents =
    students.length;

  const publishedCount =
    Object.values(resultsMap).filter(

      (result) =>
        result?.published

    ).length;

  const lockedCount =
    Object.values(resultsMap).filter(

      (result) =>
        result?.is_locked

    ).length;

  // ======================================================
  // PRINT RESULT
  // ======================================================

  const handlePrintResult =
    async (studentId) => {

      try {

        const pdfBlob =
          await printStudentResult(

            studentId,

            selectedSession || null,

            selectedTerm || null

          );

        const url =
          window.URL.createObjectURL(
            pdfBlob
          );

        const printWindow =
          window.open(
            "",
            "_blank"
          );

        if (!printWindow) {

          throw new Error(
            "Popup blocked."
          );

        }

        printWindow.location.href =
          url;

        printWindow.onload = () => {

          printWindow.focus();

          printWindow.print();

          setTimeout(() => {

            window.URL.revokeObjectURL(
              url
            );

          }, 1000);

        };

      } catch (error) {

        console.error(error);

        setErrorMsg(

          error.message ||

          "Unable to print result."

        );

      }

    };

  // ======================================================
  // PRINT TRANSCRIPT
  // ======================================================

  const handlePrintTranscript =
    async (studentId) => {

      try {

        const pdfBlob =
          await printStudentTranscript(
            studentId
          );

        const url =
          window.URL.createObjectURL(
            pdfBlob
          );

        const printWindow =
          window.open(
            "",
            "_blank"
          );

        if (!printWindow) {

          throw new Error(
            "Popup blocked."
          );

        }

        printWindow.location.href =
          url;

        printWindow.onload = () => {

          printWindow.focus();

          printWindow.print();

          setTimeout(() => {

            window.URL.revokeObjectURL(
              url
            );

          }, 1000);

        };

      } catch (error) {

        console.error(error);

        setErrorMsg(

          error.message ||

          "Unable to print transcript."

        );

      }

    };

  // ======================================================
  // HELPERS
  // ======================================================

  const getStudentName = (
    student,
    result
  ) => {

    return (

      result?.student_name ||

      student?.full_name ||

      "N/A"

    );

  };

  const getCourseName = (
    student
  ) => {

    return (

      student?.course_name ||

      student?.course?.name ||

      student?.course_id ||

      "N/A"

    );

  };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="results-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="results-header">

        <div>

          <h1>

            Academic Results

          </h1>

          <p>

            Generate, view and print student
            results and transcripts.

          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <div className="results-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaUsers />

          </div>

          <div>

            <h2>

              {totalStudents}

            </h2>

            <span>

              Students

            </span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaChartLine />

          </div>

          <div>

            <h2>

              {publishedCount}

            </h2>

            <span>

              Published

            </span>

          </div>

        </div>

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaBookOpen />

          </div>

          <div>

            <h2>

              {lockedCount}

            </h2>

            <span>

              Locked Results

            </span>

          </div>

        </div>

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="results-toolbar">

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input

            type="text"

            placeholder="Search student or course..."

            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }

          />

        </div>

        <div className="filter-group">

          <FaFilter className="filter-icon" />

          <select

            value={selectedSession}

            onChange={(e) =>
              setSelectedSession(
                e.target.value
              )
            }

          >

            <option value="">

              Academic Session

            </option>

            {sessions.map((session) => (

              <option

                key={session.id}

                value={session.id}

              >

                {session.name ||

                  session.session_year}

              </option>

            ))}

          </select>

          <select

            value={selectedTerm}

            onChange={(e) =>
              setSelectedTerm(
                e.target.value
              )
            }

          >

            <option value="">

              Academic Term

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

      ) : filteredStudents.length === 0 ? (

        <div className="empty-state">

          <FaGraduationCap />

          <h3>

            No Results Found

          </h3>

          <p>

            No student matches the
            selected filters.

          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="results-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Student</th>

                <th>Course</th>

                <th>Total</th>

                <th>Average</th>

                <th>GPA</th>

                <th>Position</th>

                <th>Published</th>

                <th>Locked</th>

                <th>Promotion</th>

                <th>Remarks</th>

                <th>Subjects</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.map(

                (student) => {

                  const result =
                    resultsMap[
                      student.id
                    ];

                  return (

                    <tr
                      key={student.id}
                    >

                      <td>

                        {student.id}

                      </td>

                      <td>

                        <div className="student-cell">

                          <div className="student-avatar">

                            {getStudentName(
                              student,
                              result
                            )

                              ?.charAt(0)

                              ?.toUpperCase()}

                          </div>

                          <div>

                            <strong>

                              {getStudentName(
                                student,
                                result
                              )}

                            </strong>

                          </div>

                        </div>

                      </td>

                      <td>

                        {getCourseName(
                          student
                        )}

                      </td>

                      <td>

                        {result?.total_score ??
                          "-"}

                      </td>

                      <td>

                        {result?.average_score ??
                          "-"}

                      </td>

                      <td>

                        {result?.gpa ??
                          "-"}

                      </td>

                      <td>

                        {result?.position ??
                          "-"}

                      </td>

                      <td>

                        <span
                          className={
                            result?.published
                              ? "badge green"
                              : "badge red"
                          }
                        >

                          {result?.published
                            ? "Yes"
                            : "No"}

                        </span>

                      </td>

                      <td>

                        <span
                          className={
                            result?.is_locked
                              ? "badge orange"
                              : "badge blue"
                          }
                        >

                          {result?.is_locked
                            ? "Locked"
                            : "Open"}

                        </span>

                      </td>

                      <td>

                        {result?.promotion_status ||
                          "-"}

                      </td>

                      <td>

                        {result?.remarks ||
                          "-"}

                      </td>

                      <td>

                        {result?.subjects
                          ?.length || 0}

                      </td>

                      <td>

                        <div className="action-buttons">

                          <button

                            type="button"

                            className="print-btn"

                            onClick={() =>
                              handlePrintResult(
                                student.id
                              )
                            }

                          >

                            <FaPrint />

                            <span>

                              Result

                            </span>

                          </button>

                          <button

                            type="button"

                            className="transcript-btn"

                            onClick={() =>
                              handlePrintTranscript(
                                student.id
                              )
                            }

                          >

                            <FaFilePdf />

                            <span>

                              Transcript

                            </span>

                          </button>

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

  );

};

export default Results;