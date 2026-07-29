import React, { useEffect, useState } from "react";

import {
  getOnlineClasses,
  createOnlineClass,
  updateOnlineClass,
  deleteOnlineClass,
} from "../../../services/onlineClassService";

import {
  getSubjects,
} from "../../../services/subjectService";

import {
  getTerms,
} from "../../../services/termService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * Online Classes Page (Admin)
 * Fully aligned with backend structure
 */

const OnlineClasses = () => {

  // ======================================================
  // STATE
  // ======================================================
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    meeting_link: "",
    subject_id: "",
    term_id: "",
    start_time: "",
    end_time: "",
  });

  const [editingId, setEditingId] = useState(null);

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchData = async () => {

    setLoading(true);

    try {

      setErrorMsg("");

      const [
        classesData,
        subjectsData,
        termsData,
      ] = await Promise.all([
        getOnlineClasses(),
        getSubjects(),
        getTerms(),
      ]);

      setClasses(
        Array.isArray(classesData)
          ? classesData
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

      console.error(
        "Failed to load online classes:",
        error
      );

      setErrorMsg(
        error?.response?.data?.detail ||
        "Failed to load online classes"
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
  // SUBMIT
  // ======================================================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      setErrorMsg("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        meeting_link: form.meeting_link.trim(),
        subject_id: Number(form.subject_id),
        term_id: Number(form.term_id),
        start_time: form.start_time,
        end_time: form.end_time,
      };

      // ==================================================
      // UPDATE
      // ==================================================
      if (editingId) {

        await updateOnlineClass(
          editingId,
          payload
        );

        alert(
          "Online class updated successfully"
        );

      } else {

        // ==================================================
        // CREATE
        // ==================================================
        await createOnlineClass(payload);

        alert(
          "Online class created successfully"
        );
      }

      // ==================================================
      // RESET
      // ==================================================
      setForm({
        title: "",
        description: "",
        meeting_link: "",
        subject_id: "",
        term_id: "",
        start_time: "",
        end_time: "",
      });

      setEditingId(null);

      // ==================================================
      // REFRESH
      // ==================================================
      fetchData();

    } catch (error) {

      console.error(
        "Failed to save online class:",
        error
      );

      setErrorMsg(
        error?.response?.data?.detail ||
        "Failed to save online class"
      );

    } finally {

      setSubmitting(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit = (item) => {

    setForm({
      title: item?.title || "",
      description:
        item?.description || "",
      meeting_link:
        item?.meeting_link || "",
      subject_id:
        item?.subject_id || "",
      term_id:
        item?.term_id || "",
      start_time:
        item?.start_time
          ?.slice(0, 16) || "",
      end_time:
        item?.end_time
          ?.slice(0, 16) || "",
    });

    setEditingId(item.id);
  };

  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Delete this online class?"
      )
    ) {
      return;
    }

    try {

      await deleteOnlineClass(id);

      alert(
        "Online class deleted successfully"
      );

      setClasses((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

    } catch (error) {

      console.error(
        "Delete failed:",
        error
      );

      setErrorMsg(
        error?.response?.data?.detail ||
        "Failed to delete online class"
      );
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================
  const getSubjectName = (id) => {

    const subject = subjects.find(
      (item) => item.id === id
    );

    return subject?.name || "N/A";
  };

  const getTermName = (id) => {

    const term = terms.find(
      (item) => item.id === id
    );

    return term?.name || "N/A";
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div>

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div style={{ marginBottom: "20px" }}>

        <h2>Online Classes</h2>

        <p style={{ color: "#6b7280" }}>
          Manage virtual classes,
          schedules, and meeting links.
        </p>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}
      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >

        <input
          name="title"
          placeholder="Class Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          name="meeting_link"
          placeholder="Meeting Link"
          value={form.meeting_link}
          onChange={handleChange}
          required
        />

        {/* SUBJECT */}
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

        {/* TERM */}
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

        <input
          type="datetime-local"
          name="start_time"
          value={form.start_time}
          onChange={handleChange}
          required
        />

        <input
          type="datetime-local"
          name="end_time"
          value={form.end_time}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Class"
            : "Create Class"}
        </button>

      </form>

      {/* ======================================================
          ERROR
      ====================================================== */}
      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}
      {loading ? (

        <Loader />

      ) : classes.length === 0 ? (

        <p>No online classes found</p>

      ) : (

        <table style={tableStyle}>

          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Term</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Meeting</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {classes.map((item) => (

              <tr key={item.id}>

                <td>{item.title}</td>

                <td>
                  {getSubjectName(
                    item.subject_id
                  )}
                </td>

                <td>
                  {getTermName(
                    item.term_id
                  )}
                </td>

                <td>
                  {new Date(
                    item.start_time
                  ).toLocaleString()}
                </td>

                <td>
                  {new Date(
                    item.end_time
                  ).toLocaleString()}
                </td>

                <td>

                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join
                  </a>

                </td>

                <td>

                  <button
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(item.id)
                    }
                  >
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

/* ======================================================
   STYLES
====================================================== */

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

export default OnlineClasses;