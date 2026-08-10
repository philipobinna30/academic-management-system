import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Terms.css";

// ======================================================
// SERVICES
// ======================================================

import API from "../../../services/api";

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
  FaPlusCircle,
  FaSearch,
  FaPlay,
  FaLock,
  FaBullhorn,
  FaTrash,
  FaLayerGroup,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * ======================================================
 * TERMS MANAGEMENT
 * Professional Dashboard Version
 * ======================================================
 */

const Terms = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [terms, setTerms] =
    useState([]);

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

      session_id: "",

    });

  // ======================================================
  // FETCH TERMS + SESSIONS
  // ======================================================

  const fetchData = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const [

        termsRes,

        sessionsRes,

      ] = await Promise.all([

        API.get("/terms"),

        API.get("/sessions"),

      ]);

      setTerms(

        Array.isArray(termsRes.data)

          ? termsRes.data

          : []

      );

      setSessions(

        Array.isArray(sessionsRes.data)

          ? sessionsRes.data

          : []

      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to load terms."

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    fetchData();

  }, []);

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const filteredTerms =
    useMemo(() => {

      if (!search.trim()) {

        return terms;

      }

      const keyword =
        search.toLowerCase();

      return terms.filter(

        (term) =>

          term.name
            ?.toLowerCase()
            .includes(keyword)

          ||

          getSessionName(term.session_id)
            .toLowerCase()
            .includes(keyword)

      );

    }, [terms, search]);

  // ======================================================
  // DASHBOARD STATS
  // ======================================================

  const totalTerms =
    terms.length;

  const activeTerms =
    terms.filter(
      (term) => term.is_active
    ).length;

  const closedTerms =
    terms.filter(
      (term) => term.is_closed
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

      session_id: "",

    });

    setErrorMsg("");

  };

  // ======================================================
  // CREATE TERM
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitting) return;

    try {

      setSubmitting(true);

      setErrorMsg("");

      const payload = {

        name:
          form.name.trim(),

        session_id:
          Number(form.session_id),

      };

      await API.post(
        "/terms",
        payload
      );

      alert(
        "Term created successfully."
      );

      resetForm();

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to save term."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // ACTIVATE TERM
  // ======================================================

  const activateTerm = async (id) => {

    try {

      setErrorMsg("");

      await API.patch(
        `/terms/${id}/activate`
      );

      alert(
        "Term activated successfully."
      );

      await fetchData();

    } catch (error) {

      setErrorMsg(

        error?.response?.data?.detail ||

        "Failed to activate term."

      );

    }

  };

  // ======================================================
  // CLOSE TERM
  // ======================================================

  const closeTerm = async (id) => {

    const confirmed =
      window.confirm(
        "Close this term and lock results?"
      );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await API.patch(
        `/terms/${id}/close`
      );

      alert(
        "Term closed successfully."
      );

      await fetchData();

    } catch (error) {

      setErrorMsg(

        error?.response?.data?.detail ||

        "Failed to close term."

      );

    }

  };

  // ======================================================
  // PUBLISH RESULTS
  // ======================================================

  const publishResults = async (id) => {

    const confirmed =
      window.confirm(
        "Publish results for this term?"
      );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await API.patch(
        `/terms/${id}/publish`
      );

      alert(
        "Results published successfully."
      );

      await fetchData();

    } catch (error) {

      setErrorMsg(

        error?.response?.data?.detail ||

        "Failed to publish results."

      );

    }

  };

  // ======================================================
  // DELETE TERM
  // ======================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Delete this term?"
      );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await API.delete(
        `/terms/${id}`
      );

      alert(
        "Term deleted successfully."
      );

      await fetchData();

    } catch (error) {

      setErrorMsg(

        error?.response?.data?.detail ||

        "Failed to delete term."

      );

    }

  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getSessionName = (sessionId) => {

    const session =
      sessions.find(
        (s) => s.id === sessionId
      );

    return session?.name || "N/A";

  };

  const getStatus = (term) => {

    if (term.is_closed)
      return "Closed";

    if (term.is_active)
      return "Active";

    return "Inactive";

  };

  // ======================================================
  // PART 2 STARTS HERE
  // ======================================================

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="terms-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="terms-header">

        <div>

          <h1>

            Academic Terms

          </h1>

          <p>

            Manage academic terms, activate sessions,
            close terms and publish results.

          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD CARDS
      ====================================================== */}

      <div className="term-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaLayerGroup />

          </div>

          <div>

            <h2>{totalTerms}</h2>

            <span>Total Terms</span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaCheckCircle />

          </div>

          <div>

            <h2>{activeTerms}</h2>

            <span>Active Terms</span>

          </div>

        </div>

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaLock />

          </div>

          <div>

            <h2>{closedTerms}</h2>

            <span>Closed Terms</span>

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
            placeholder="Search terms or sessions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>

      {/* ======================================================
          CREATE TERM
      ====================================================== */}

      <div className="term-form-card">

        <h2>

          <FaPlusCircle />

          Create Academic Term

        </h2>

        <form
          onSubmit={handleSubmit}
          className="term-form"
        >

          <div className="form-group">

            <FaCalendarAlt className="form-icon" />

            <input
              type="text"
              name="name"
              placeholder="Term Name"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <FaLayerGroup className="form-icon" />

            <select
              name="session_id"
              value={form.session_id}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Academic Session
              </option>

              {sessions.map((session) => (

                <option
                  key={session.id}
                  value={session.id}
                >

                  {session.name}

                </option>

              ))}

            </select>

          </div>

          <button
            type="submit"
            className="save-btn"
            disabled={submitting}
          >

            <FaPlusCircle />

            {submitting
              ? "Processing..."
              : "Create Term"}

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

      ) : filteredTerms.length === 0 ? (

        <div className="empty-state">

          <FaCalendarAlt />

          <h3>

            No Terms Found

          </h3>

          <p>

            There are currently no academic
            terms matching your search.

          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="terms-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Term</th>

                <th>Session</th>

                <th>Status</th>

                <th>Closed</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredTerms.map((term) => (

                <tr key={term.id}>

                  <td>

                    {term.id}

                  </td>

                  <td>

                    <div className="term-name">

                      <div className="term-avatar">

                        {term.name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>

                      <strong>

                        {term.name}

                      </strong>

                    </div>

                  </td>

                  <td>

                    {getSessionName(term.session_id)}

                  </td>

                  <td>

                    <span
                      className={`status-badge ${getStatus(term).toLowerCase()}`}
                    >

                      {getStatus(term)}

                    </span>

                  </td>

                  <td>

                    {term.is_closed
                      ? "Yes"
                      : "No"}

                  </td>

                  <td>

                    <div className="action-buttons">

                      {!term.is_closed && (

                        <button
                          type="button"
                          className="activate-btn"
                          onClick={() =>
                            activateTerm(term.id)
                          }
                        >

                          <FaPlay />

                          Activate

                        </button>

                      )}

                      {!term.is_closed && (

                        <button
                          type="button"
                          className="close-btn"
                          onClick={() =>
                            closeTerm(term.id)
                          }
                        >

                          <FaLock />

                          Close

                        </button>

                      )}

                      {term.is_closed && (

                        <button
                          type="button"
                          className="publish-btn"
                          onClick={() =>
                            publishResults(term.id)
                          }
                        >

                          <FaBullhorn />

                          Publish

                        </button>

                      )}

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(term.id)
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

export default Terms;