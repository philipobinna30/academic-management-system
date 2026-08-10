import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Sessions.css";

// ======================================================
// SERVICES
// ======================================================

import {
  createSession,
  getSessions,
  deleteSession,
  activateSession,
} from "../../../services/sessionService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaSearch,
  FaPlusCircle,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * ======================================================
 * SESSIONS MANAGEMENT
 * Professional Dashboard Version
 * ======================================================
 */

const Sessions = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [sessions, setSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState({
      name: "",
    });

  // ======================================================
  // FETCH SESSIONS
  // ======================================================

  const fetchSessions = async () => {

    try {

      setLoading(true);
      setErrorMsg("");

      const data =
        await getSessions();

      setSessions(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(error);

      setSessions([]);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to load sessions."

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
  // SEARCH FILTER
  // ======================================================

  const filteredSessions =
    useMemo(() => {

      if (!search.trim()) {

        return sessions;

      }

      const keyword =
        search.toLowerCase();

      return sessions.filter(

        (session) =>

          session.name
            ?.toLowerCase()
            .includes(keyword)

      );

    }, [sessions, search]);

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const totalSessions =
    sessions.length;

  const activeSessions =
    sessions.filter(
      (s) => s.is_active
    ).length;

  const inactiveSessions =
    sessions.filter(
      (s) => !s.is_active
    ).length;

  // ======================================================
  // HANDLE INPUT
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

      name: "",

    });

    setErrorMsg("");

  };

  // ======================================================
  // CREATE SESSION
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitting) return;

    try {

      setSubmitting(true);

      setErrorMsg("");

      await createSession({

        name:
          form.name.trim(),

      });

      alert(
        "Session created successfully."
      );

      resetForm();

      await fetchSessions();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to create session."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // ACTIVATE SESSION
  // ======================================================

  const handleActivate = async (id) => {

    try {

      setErrorMsg("");

      await activateSession(id);

      alert(
        "Session activated successfully."
      );

      await fetchSessions();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to activate session."

      );

    }

  };

  // ======================================================
  // DELETE SESSION
  // ======================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Delete this session?"
      );

    if (!confirmed) return;

    try {

      await deleteSession(id);

      alert(
        "Session deleted successfully."
      );

      setSessions((prev) =>

        prev.filter(

          (session) =>

            session.id !== id

        )

      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to delete session."

      );

    }

  };

  // ======================================================
  // STATUS LABEL
  // ======================================================

  const getStatus = (session) => {

    return session.is_active
      ? "Active"
      : "Inactive";

  };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="sessions-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="sessions-header">

        <div>

          <h1>
            Academic Sessions
          </h1>

          <p>
            Create, activate and manage academic sessions.
          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <div className="session-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaCalendarAlt />

          </div>

          <div>

            <h2>{totalSessions}</h2>

            <span>Total Sessions</span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaCalendarCheck />

          </div>

          <div>

            <h2>{activeSessions}</h2>

            <span>Active Sessions</span>

          </div>

        </div>

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaCalendarAlt />

          </div>

          <div>

            <h2>{inactiveSessions}</h2>

            <span>Inactive Sessions</span>

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
            placeholder="Search sessions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <div className="session-form-card">

        <h2>

          <FaPlusCircle />

          Create New Session

        </h2>

        <form
          onSubmit={handleSubmit}
          className="session-form"
        >

          <div className="form-group">

            <FaCalendarAlt className="form-icon" />

            <input
              type="text"
              name="name"
              placeholder="Session (e.g. 2025/2026)"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="save-btn"
            disabled={submitting}
          >

            {submitting
              ? "Saving..."
              : "Create Session"}

          </button>

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

      ) : filteredSessions.length === 0 ? (

        <div className="empty-state">

          <FaCalendarAlt />

          <h3>
            No Sessions Found
          </h3>

          <p>

            No academic sessions match
            your current search.

          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="sessions-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Session</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredSessions.map((session) => (

                <tr key={session.id}>

                  {/* ==========================
                      ID
                  ========================== */}

                  <td>

                    {session.id}

                  </td>

                  {/* ==========================
                      SESSION
                  ========================== */}

                  <td>

                    <div className="session-name">

                      <div className="session-avatar">

                        {session.name
                          ?.charAt(0)
                          ?.toUpperCase() || "S"}

                      </div>

                      <strong>

                        {session.name}

                      </strong>

                    </div>

                  </td>

                  {/* ==========================
                      STATUS
                  ========================== */}

                  <td>

                    <span
                      className={`status-badge ${
                        session.is_active
                          ? "active"
                          : "inactive"
                      }`}
                    >

                      {getStatus(session)}

                    </span>

                  </td>

                  {/* ==========================
                      ACTIONS
                  ========================== */}

                  <td>

                    <div className="action-buttons">

                      {!session.is_active && (

                        <button
                          type="button"
                          className="activate-btn"
                          onClick={() =>
                            handleActivate(session.id)
                          }
                        >

                          <FaCheckCircle />

                          Activate

                        </button>

                      )}

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(session.id)
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

export default Sessions;