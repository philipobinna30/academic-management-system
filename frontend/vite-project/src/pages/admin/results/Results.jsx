import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ======================================================
// SERVICES
// ======================================================
import { getAllStudents } from "../../../services/studentService";
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

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// RESULTS PAGE (ADMIN)
// Aligned with current backend
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // LOAD SESSIONS
  // ======================================================
  const fetchSessions = async () => {
    try {
      const data =
        await getSessions();

      const sessionList = Array.isArray(data)
        ? data
        : [];

      setSessions(sessionList);

      if (sessionList.length > 0) {
        const latest =
          sessionList[sessionList.length - 1];

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
      const data = await getTerms();

      const termList = Array.isArray(data)
  ? data
  : [];

setTerms(termList);

if (termList.length > 0) {
  const latest =
    termList[termList.length - 1];

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

      const studentList = Array.isArray(
        studentsData
      )
        ? studentsData
        : [];

      setStudents(studentList);

      const generatedResults = {};

      await Promise.all(
        studentList.map(async (student) => {
          try {
            const result =
              await getStudentResult(
                student.id,
                selectedSession || null,
                selectedTerm || null
              );

            generatedResults[student.id] =
              result;
          } catch {
            generatedResults[student.id] =
              null;
          }
        })
      );

      setResultsMap(generatedResults);
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
  // LOAD TERMS WHEN SESSION CHANGES
  // ======================================================
  useEffect(() => {
    if (selectedSession) {
      fetchTerms(selectedSession);
    }
  }, [selectedSession]);

  // ======================================================
  // LOAD RESULTS WHEN TERM CHANGES
  // ======================================================
  useEffect(() => {
    if (selectedSession && selectedTerm) {
      fetchResults();
    }
  }, [
    selectedSession,
    selectedTerm,
  ]);

  // ======================================================
  // TRANSCRIPT PAGE
  // ======================================================
  const handleTranscript = (
    studentId
  ) => {
    navigate(
      `/admin/results/transcript/${studentId}`
    );
  };

  
  // ======================================================
// PRINT RESULT
// ======================================================
const handlePrintResult = async (
  studentId
) => {
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
      window.open("", "_blank");

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
const handlePrintTranscript = async (
  studentId
) => {
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
      window.open("", "_blank");

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
  // UI
  // ======================================================
  return (
    <div>
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h2>Generated Results</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Results generated from
          submitted student scores.
        </p>
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label>
            Academic Session
          </label>

          <br />

          <select
            value={selectedSession}
            onChange={(e) =>
              setSelectedSession(
                e.target.value
              )
            }
          >
            <option value="">
              Select Session
            </option>

            {sessions.map(
              (session) => (
                <option
                  key={session.id}
                  value={session.id}
                >
                  {session.name ||
                    session.session_year}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label>
            Term
          </label>

          <br />

          <select
            value={selectedTerm}
            onChange={(e) =>
              setSelectedTerm(
                e.target.value
              )
            }
          >
            <option value="">
              Select Term
            </option>

            {terms.map(
              (term) => (
                <option
                  key={term.id}
                  value={term.id}
                >
                  {term.name}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table style={tableStyle}>
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
            {students.map(
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
                      {getStudentName(
                        student,
                        result
                      )}
                    </td>

                    <td>
                      {getCourseName(
                        student
                      )}
                    </td>

                    <td>
                      {result?.total_score ??
                        0}
                    </td>

                    <td>
                      {result?.average_score ??
                        0}
                    </td>

                    <td>
                      {result?.gpa ??
                        0}
                    </td>

                    <td>
                      {result?.position ??
                        "-"}
                    </td>

                    <td>
                      {result?.published
                        ? "Yes"
                        : "No"}
                    </td>

                    <td>
                      {result?.is_locked
                        ? "Yes"
                        : "No"}
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
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                  
                        
                          
                          
                            
                        
                      
                
                

                        <button
                          onClick={() =>
                            handlePrintResult(
                              student.id
                            )
                          }
                        >
                          Print Result
                        </button>

                        <button
                          onClick={() =>
                            handlePrintTranscript(
                              student.id
                            )
                          }
                        >
                          Print Transcript
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
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
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default Results;