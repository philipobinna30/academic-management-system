import React, { useEffect, useState } from "react";

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

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({ name: "" });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      setErrorMsg("");
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createSession({ name: form.name.trim() });
      setForm({ name: "" });
      fetchSessions();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete session?")) return;
    try {
      await deleteSession(id);
      setSessions((p) => p.filter((s) => s.id !== id));
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateSession(id);
      fetchSessions();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Academic Sessions</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Session (e.g 2025/2026)"
          required
        />
        <button disabled={submitting}>
          {submitting ? "Saving..." : "Create"}
        </button>
      </form>

      {errorMsg && <ErrorMessage message={errorMsg} />}

      {loading ? (
        <Loader />
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.is_active ? "Active" : "Inactive"}</td>
                <td>
                  {!s.is_active && (
                    <button onClick={() => handleActivate(s.id)}>
                      Activate
                    </button>
                  )}
                  <button onClick={() => handleDelete(s.id)}>
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

export default Sessions;