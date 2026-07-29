import React, {
  useEffect,
  useState,
} from "react";

// ======================================================
// SERVICES
// ======================================================
import {
  getAllScores,
  getScore,
  deleteScore,
} from "../../services/scoreService";

const Scores = () => {

  // ======================================================
  // STATES
  // ======================================================
  const [scores, setScores] =
    useState([]);

  const [selectedScore, setSelectedScore] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // LOAD SCORES
  // ======================================================
  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const data =
        await getScores();

      setScores(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load scores:",
        error
      );

      setErrorMsg(
        typeof error === "string"
          ? error
          : error?.message ||
              "Failed to load scores"
      );

    } finally {

      setLoading(false);
    }
  };

  // ======================================================
  // GET SINGLE SCORE
  // ======================================================
  const handleViewScore =
    async (scoreId) => {

      try {

        setDetailsLoading(true);

        const data =
          await getScore(
            scoreId
          );

        setSelectedScore(
          data || null
        );

      } catch (error) {

        console.error(
          "Failed to fetch score:",
          error
        );

        alert(
          typeof error ===
            "string"
            ? error
            : error?.message ||
                "Failed to fetch score"
        );

      } finally {

        setDetailsLoading(false);
      }
    };

  // ======================================================
  // DELETE SCORE
  // ======================================================
  const handleDelete =
    async (scoreId) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this score?"
        );

      if (!confirmDelete) {
        return;
      }

      try {

        await deleteScore(
          scoreId
        );

        setScores((prev) =>
          prev.filter(
            (score) =>
              score.id !==
              scoreId
          )
        );

        if (
          selectedScore?.id ===
          scoreId
        ) {
          setSelectedScore(
            null
          );
        }

      } catch (error) {

        console.error(
          "Delete failed:",
          error
        );

        alert(
          typeof error ===
            "string"
            ? error
            : error?.message ||
                "Failed to delete score"
        );
      }
    };

  // ======================================================
  // HELPERS
  // ======================================================
  const getGrade = (
    score
  ) => {

    if (score >= 75)
      return "A";

    if (score >= 65)
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
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <h2>
        Loading scores...
      </h2>
    );
  }

  // ======================================================
  // UI
  // ======================================================
  return (
    <div>

      {/* ================= HEADER ================= */}
      <div
        style={{
          marginBottom:
            "30px",
        }}
      >
        <h1
          style={{
            fontSize:
              "32px",
            marginBottom:
              "10px",
          }}
        >
          Scores
        </h1>

        <p
          style={{
            color:
              "#6b7280",
          }}
        >
          Manage student
          scores
        </p>
      </div>

      {/* ================= ERROR ================= */}
      {errorMsg && (
        <p
          style={{
            color: "red",
            marginBottom:
              "20px",
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading &&
        scores.length ===
          0 && (
          <div
            style={{
              background:
                "#fff",
              padding:
                "20px",
              borderRadius:
                "10px",
            }}
          >
            <p>
              No scores
              available.
            </p>
          </div>
        )}

      {/* ================= TABLE ================= */}
      {scores.length >
        0 && (
        <div
          style={{
            background:
              "#fff",
            borderRadius:
              "10px",
            overflowX:
              "auto",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <table
            style={{
              width:
                "100%",
              borderCollapse:
                "collapse",
            }}
          >

            {/* ================= HEAD ================= */}
            <thead
              style={{
                background:
                  "#f3f4f6",
              }}
            >
              <tr>

                <TableHead title="S/N" />

                <TableHead title="Student" />

                <TableHead title="Subject" />

                <TableHead title="Marks" />

                <TableHead title="Grade" />

                <TableHead title="Term" />

                <TableHead title="Actions" />

              </tr>
            </thead>

            {/* ================= BODY ================= */}
            <tbody>
              {scores.map(
                (
                  score,
                  index
                ) => {

                  const marks =
                    Number(
                      score.marks
                    ) || 0;

                  return (
                    <tr
                      key={
                        score.id
                      }
                      style={{
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >

                      <TableCell
                        value={
                          index + 1
                        }
                      />

                      <TableCell
                        value={
                          score
                            ?.student
                            ?.user
                            ?.full_name ||
                          score
                            ?.student
                            ?.full_name ||
                          `Student ${score.student_id}`
                        }
                      />

                      <TableCell
                        value={
                          score
                            ?.subject
                            ?.name ||
                          `Subject ${score.subject_id}`
                        }
                      />

                      <TableCell
                        value={
                          marks
                        }
                      />

                      <TableCell
                        value={getGrade(
                          marks
                        )}
                      />

                      <TableCell
                        value={
                          score.term_id ||
                          "N/A"
                        }
                      />

                      <td
                        style={{
                          padding:
                            "14px",
                          display:
                            "flex",
                          gap:
                            "10px",
                        }}
                      >

                        <button
                          onClick={() =>
                            handleViewScore(
                              score.id
                            )
                          }
                          style={{
                            padding:
                              "8px 12px",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            background:
                              "#2563eb",
                            color:
                              "#fff",
                            cursor:
                              "pointer",
                          }}
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              score.id
                            )
                          }
                          style={{
                            padding:
                              "8px 12px",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            background:
                              "#dc2626",
                            color:
                              "#fff",
                            cursor:
                              "pointer",
                          }}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}
            </tbody>

          </table>
        </div>
      )}

      {/* ================= SCORE DETAILS ================= */}
      {selectedScore && (
        <div
          style={{
            marginTop:
              "30px",
            background:
              "#fff",
            padding:
              "25px",
            borderRadius:
              "10px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >

          <h2
            style={{
              marginBottom:
                "20px",
            }}
          >
            Score Details
          </h2>

          {detailsLoading ? (
            <p>
              Loading score
              details...
            </p>
          ) : (
            <>

              <ProfileRow
                label="Student"
                value={
                  selectedScore
                    ?.student
                    ?.user
                    ?.full_name ||
                  selectedScore
                    ?.student
                    ?.full_name ||
                  "N/A"
                }
              />

              <ProfileRow
                label="Subject"
                value={
                  selectedScore
                    ?.subject
                    ?.name ||
                  "N/A"
                }
              />

              <ProfileRow
                label="Marks"
                value={
                  selectedScore?.marks ||
                  0
                }
              />

              <ProfileRow
                label="Grade"
                value={getGrade(
                  Number(
                    selectedScore?.marks
                  ) || 0
                )}
              />

              <ProfileRow
                label="Term ID"
                value={
                  selectedScore?.term_id ||
                  "N/A"
                }
              />

              <ProfileRow
                label="Score ID"
                value={
                  selectedScore?.id ||
                  "N/A"
                }
              />

            </>
          )}
        </div>
      )}

    </div>
  );
};

// ======================================================
// TABLE HEAD
// ======================================================
const TableHead = ({
  title,
}) => {

  return (
    <th
      style={{
        textAlign:
          "left",
        padding:
          "14px",
        color:
          "#374151",
      }}
    >
      {title}
    </th>
  );
};

// ======================================================
// TABLE CELL
// ======================================================
const TableCell = ({
  value,
}) => {

  return (
    <td
      style={{
        padding:
          "14px",
        color:
          "#111827",
      }}
    >
      {value}
    </td>
  );
};

// ======================================================
// PROFILE ROW
// ======================================================
const ProfileRow = ({
  label,
  value,
}) => {

  return (
    <div
      style={{
        marginBottom:
          "16px",
        paddingBottom:
          "10px",
        borderBottom:
          "1px solid #e5e7eb",
      }}
    >

      <h4
        style={{
          marginBottom:
            "5px",
          color:
            "#374151",
        }}
      >
        {label}
      </h4>

      <p
        style={{
          color:
            "#111827",
        }}
      >
        {value}
      </p>

    </div>
  );
};

export default Scores;