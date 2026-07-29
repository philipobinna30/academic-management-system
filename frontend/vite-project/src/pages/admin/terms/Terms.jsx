import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import API from "../../../services/api";

// ======================================================
// COMPONENTS
// ======================================================
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * Terms Page (Admin)
 * Fully aligned with backend Term structure
 */

const Terms = () => {
  // ======================================================
  // STATE
  // ======================================================
  const [terms, setTerms] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    session_id: "",
  });

  // ======================================================
  // FETCH TERMS + SESSIONS
  // ======================================================
  const fetchData = async () => {
    setLoading(true);

    try {
      setErrorMsg("");

      const [termsRes, sessionsRes] = await Promise.all([
        API.get("/terms"),
        API.get("/sessions"),
      ]);

      setTerms(Array.isArray(termsRes.data) ? termsRes.data : []);
      setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
    } catch (error) {
      console.error("Failed to load terms:", error);

      setErrorMsg(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to load terms"
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
  // HANDLE CHANGE
  // ======================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

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
  };

  // ======================================================
  // CREATE TERM
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      setErrorMsg("");

      const payload = {
        name: form.name.trim(),
        session_id: Number(form.session_id),
      };

      await API.post("/terms", payload);

      alert("Term created successfully");

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save term:", error);

      setErrorMsg(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to save term"
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

      await API.patch(`/terms/${id}/activate`);

      alert("Term activated successfully");
      fetchData();
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.detail ||
          "Failed to activate term"
      );
    }
  };

  // ======================================================
  // CLOSE TERM
  // ======================================================
  const closeTerm = async (id) => {
    if (!window.confirm("Close this term and lock results?")) return;

    try {
      setErrorMsg("");

      await API.patch(`/terms/${id}/close`);

      alert("Term closed successfully");
      fetchData();
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.detail ||
          "Failed to close term"
      );
    }
  };

  // ======================================================
  // PUBLISH RESULTS
  // ======================================================
  const publishResults = async (id) => {
    if (!window.confirm("Publish results for this term?")) return;

    try {
      setErrorMsg("");

      await API.patch(`/terms/${id}/publish`);

      alert("Results published successfully");
      fetchData();
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.detail ||
          "Failed to publish results"
      );
    }
  };

  // ======================================================
  // DELETE TERM
  // ======================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this term?")) return;

    try {
      setErrorMsg("");

      await API.delete(`/terms/${id}`);

      alert("Term deleted successfully");

      setTerms((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.detail ||
          "Failed to delete term"
      );
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================
  const getSessionName = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    return session?.name || "N/A";
  };

  const getStatus = (term) => {
    if (term.is_closed) return "Closed";
    if (term.is_active) return "Active";
    return "Inactive";
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div>
      <div style={{ marginBottom: "25px" }}>
        <h2>Academic Terms</h2>
        <p style={{ color: "#6b7280" }}>
          Manage academic terms, activation, closing, and results.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          name="name"
          placeholder="Term Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select
          name="session_id"
          value={form.session_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Session</option>

          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? "Processing..." : "Create Term"}
        </button>
      </form>

      {/* ERROR */}
      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* TABLE */}
      {loading ? (
        <Loader />
      ) : terms.length === 0 ? (
        <p>No terms found</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Session</th>
              <th>Status</th>
              <th>Closed</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {terms.map((term) => (
              <tr key={term.id}>
                <td>{term.id}</td>
                <td>{term.name}</td>
                <td>{getSessionName(term.session_id)}</td>
                <td>{getStatus(term)}</td>
                <td>{term.is_closed ? "Yes" : "No"}</td>

                <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {!term.is_closed && (
                    <button onClick={() => activateTerm(term.id)}>
                      Activate
                    </button>
                  )}

                  {!term.is_closed && (
                    <button onClick={() => closeTerm(term.id)}>
                      Close
                    </button>
                  )}

                  {term.is_closed && (
                    <button onClick={() => publishResults(term.id)}>
                      Publish
                    </button>
                  )}

                  <button onClick={() => handleDelete(term.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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

export default Terms;