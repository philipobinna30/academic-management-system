import React, {
  useEffect,
  useState,
} from "react";

import "./OnlineClasses.css";

// ======================================================
// SERVICES
// ======================================================

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

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaVideo,
  FaBook,
  FaClock,
  FaLink,
  FaPlusCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

/**
 * ======================================================
 * ONLINE CLASSES MANAGEMENT
 * Professional Dashboard Version
 * ======================================================
 */

const OnlineClasses = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [classes, setClasses] =
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

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({

      title: "",

      description: "",

      meeting_link: "",

      subject_id: "",

      term_id: "",

      start_time: "",

      end_time: "",

    });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {

    try {

      setLoading(true);

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

        error?.message ||

        "Failed to load online classes."

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

      title: "",

      description: "",

      meeting_link: "",

      subject_id: "",

      term_id: "",

      start_time: "",

      end_time: "",

    });

    setEditingId(null);

  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitting) return;

    try {

      setSubmitting(true);

      setErrorMsg("");

      const payload = {

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        meeting_link:
          form.meeting_link.trim(),

        subject_id:
          Number(form.subject_id),

        term_id:
          Number(form.term_id),

        start_time:
          form.start_time,

        end_time:
          form.end_time,

      };

      // ================================================
      // UPDATE
      // ================================================

      if (editingId) {

        await updateOnlineClass(

          editingId,

          payload

        );

        alert(
          "Online class updated successfully."
        );

      }

      // ================================================
      // CREATE
      // ================================================

      else {

        await createOnlineClass(

          payload

        );

        alert(
          "Online class created successfully."
        );

      }

      resetForm();

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to save online class."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (item) => {

    setEditingId(item.id);

    setForm({

      title:
        item.title || "",

      description:
        item.description || "",

      meeting_link:
        item.meeting_link || "",

      subject_id:
        item.subject_id || "",

      term_id:
        item.term_id || "",

      start_time:
        item.start_time?.slice(0, 16) || "",

      end_time:
        item.end_time?.slice(0, 16) || "",

    });

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(

      "Delete this online class?"

    );

    if (!confirmed) return;

    try {

      await deleteOnlineClass(id);

      alert(
        "Online class deleted successfully."
      );

      setClasses((prev) =>

        prev.filter(

          (item) =>

            item.id !== id

        )

      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to delete online class."

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
  // RENDER
  // ======================================================

  return (    <div className="online-classes-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="online-header">

        <h1>
          Online Classes
        </h1>

        <p>
          Manage virtual classes, schedules and meeting links.
        </p>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <div className="online-form-card">

        <h2>

          <FaPlusCircle />

          {editingId
            ? "Update Online Class"
            : "Create Online Class"}

        </h2>

        <form
          className="online-form"
          onSubmit={handleSubmit}
        >

          {/* TITLE */}

          <input
            type="text"
            name="title"
            placeholder="Class Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />

          {/* MEETING LINK */}

          <input
            type="url"
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

          {/* START */}

          <input
            type="datetime-local"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />

          {/* END */}

          <input
            type="datetime-local"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="online-submit-btn"
            disabled={submitting}
          >

            {submitting

              ? "Processing..."

              : editingId

              ? "Update Class"

              : "Create Class"}

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

      ) : classes.length === 0 ? (

        <div className="online-empty">

          <FaVideo />

          <h3>
            No Online Classes Found
          </h3>

          <p>
            Create your first online class to begin scheduling virtual lessons.
          </p>

        </div>

      ) : (

        <div className="online-table-wrapper">

          <table className="online-table">

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

                  {/* TITLE */}

                  <td>

                    <strong>

                      {item.title}

                    </strong>

                    <br />

                    <small>

                      {item.description}

                    </small>

                  </td>

                  {/* SUBJECT */}

                  <td>

                    <FaBook />

                    {" "}

                    {getSubjectName(item.subject_id)}

                  </td>

                  {/* TERM */}

                  <td>

                    {getTermName(item.term_id)}

                  </td>

                  {/* START */}

                  <td>

                    <FaClock />

                    {" "}

                    {new Date(
                      item.start_time
                    ).toLocaleString()}

                  </td>

                  {/* END */}

                  <td>

                    <FaClock />

                    {" "}

                    {new Date(
                      item.end_time
                    ).toLocaleString()}

                  </td>

                  {/* LINK */}

                  <td>

                    <a
                      href={item.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="join-link"
                    >

                      <FaLink />

                      {" "}

                      Join

                    </a>

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="online-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(item)
                        }
                      >

                        <FaEdit />

                        Edit

                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(item.id)
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

export default OnlineClasses;