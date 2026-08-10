import React, { useEffect, useState } from "react";
import "./TeacherOnlineClasses.css";

// ======================================================
// SERVICES
// ======================================================
import {
  getTeacherOnlineClasses,
  createTeacherOnlineClass,
  updateTeacherOnlineClass,
  deleteTeacherOnlineClass,
  getTeacherCourses,
} from "../../../services/teacherService";

import {
  getSubjectsByCourse,
} from "../../../services/subjectService";

import {
  getActiveTerm,
} from "../../../services/termService";

// ======================================================
// CONTEXT
// ======================================================
import { useAuth } from "../../../context/AuthContext";

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
  FaCalendarAlt,
  FaClock,
  FaLink,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * ======================================================
 * TEACHER ONLINE CLASSES
 * ======================================================
 */

const TeacherOnlineClasses = () => {
  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");

  const [termId, setTermId] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    meeting_link: "",
    subject_id: "",
    start_time: "",
    end_time: "",
  });

  // ======================================================
  // CURRENT TEACHER
  // ======================================================

  const teacherId =
    user?.user_id ||
    user?.id;

  // ======================================================
  // FETCH ONLINE CLASSES
  // ======================================================

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      if (!teacherId) {
        throw new Error(
          "Unable to determine teacher account."
        );
      }

      const data =
        await getTeacherOnlineClasses(
          teacherId
        );

      setClasses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load online classes:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load online classes."
      );

      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD INITIAL DATA
  // ======================================================

  const loadInitialData = async () => {
    try {
      const [
        teacherCourses,
        activeTerm,
      ] = await Promise.all([
        getTeacherCourses(
          teacherId
        ),
        getActiveTerm(),
      ]);

      setCourses(
        Array.isArray(
          teacherCourses
        )
          ? teacherCourses
          : []
      );

      if (activeTerm) {
        setTermId(activeTerm.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    if (!teacherId) return;

    fetchClasses();
    loadInitialData();
  }, [teacherId]);

  // ======================================================
  // LOAD SUBJECTS
  // ======================================================

  useEffect(() => {
    if (!selectedCourse) {
      setSubjects([]);
      return;
    }

    const loadSubjects = async () => {
      try {
        const data =
          await getSubjectsByCourse(
            selectedCourse
          );

        setSubjects(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadSubjects();
  }, [selectedCourse]);

  // ======================================================
  // HANDLE INPUT CHANGE
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
    setEditingId(null);

    setSelectedCourse("");

    setSubjects([]);

    setSuccessMsg("");

    setForm({
      title: "",
      description: "",
      meeting_link: "",
      subject_id: "",
      start_time: "",
      end_time: "",
    });
  };

  // ======================================================
  // CREATE / UPDATE CLASS
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const payload = {
        title: form.title,
        description: form.description,
        meeting_link: form.meeting_link,
        subject_id: Number(
          form.subject_id
        ),
        term_id: Number(termId),
        start_time: form.start_time,
        end_time: form.end_time,
      };

      if (editingId) {
        await updateTeacherOnlineClass(
          teacherId,
          editingId,
          payload
        );

        setSuccessMsg(
          "Online class updated successfully."
        );
      } else {
        await createTeacherOnlineClass(
          teacherId,
          payload
        );

        setSuccessMsg(
          "Online class scheduled successfully."
        );
      }

      resetForm();

      await fetchClasses();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to save online class."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setSelectedCourse(item.course_id || "");

    setForm({
      title: item.title || "",
      description: item.description || "",
      meeting_link: item.meeting_link || "",
      subject_id: String(item.subject_id || ""),
      start_time: item.start_time?.slice(0, 16) || "",
      end_time: item.end_time?.slice(0, 16) || "",
    });

    if (item.course_id) {
      getSubjectsByCourse(item.course_id)
        .then((data) =>
          setSubjects(Array.isArray(data) ? data : [])
        )
        .catch(console.error);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete = async (classId) => {
    if (!window.confirm("Delete this online class?")) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");

      await deleteTeacherOnlineClass(
        teacherId,
        classId
      );

      setClasses((prev) =>
        prev.filter((item) => item.id !== classId)
      );

      setSuccessMsg(
        "Online class deleted successfully."
      );
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to delete online class."
      );
    }
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================
  const formatDateTime = (value) => {
    if (!value) return "N/A";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  // ======================================================
// LOADING
// ======================================================

if (loading && classes.length === 0) {
  return <Loader />;
}

// ======================================================
// RENDER
// ======================================================

return (

  <div className="teacher-online-page">

    {/* ======================================================
        HEADER
    ====================================================== */}

    <div className="teacher-online-header">

      <div>

        <h1>My Online Classes</h1>

        <p>
          Create, schedule and manage your online classes.
        </p>

        {termId && (
          <span className="active-term">
            Active Term ID: {termId}
          </span>
        )}

      </div>

    </div>

    {/* ======================================================
        SUCCESS
    ====================================================== */}

    {successMsg && (
      <div className="success-message">
        {successMsg}
      </div>
    )}

    {/* ======================================================
        ERROR
    ====================================================== */}

    {errorMsg && (
      <ErrorMessage message={errorMsg} />
    )}

    {/* ======================================================
        FORM
    ====================================================== */}

    <div className="online-form-card">

      <h2>
        {editingId
          ? "Update Online Class"
          : "Schedule Online Class"}
      </h2>

      <form
        className="online-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="title"
          placeholder="Class Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="url"
          name="meeting_link"
          placeholder="Meeting Link"
          value={form.meeting_link}
          onChange={handleChange}
          required
        />

        <select
          value={selectedCourse}
          onChange={(e) =>
            setSelectedCourse(e.target.value)
          }
          required
        >
          <option value="">
            Select Course
          </option>

          {courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
            >
              {course.name}
            </option>
          ))}

        </select>

        <select
          name="subject_id"
          value={form.subject_id}
          onChange={handleChange}
          disabled={!selectedCourse}
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

        <div className="form-buttons">

          <button
            type="submit"
            className="save-btn"
          >
            {editingId
              ? "Update Class"
              : "Schedule Class"}
          </button>

          {editingId && (

            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          )}

        </div>

      </form>

    </div>

    {/* ======================================================
        EMPTY STATE
    ====================================================== */}

    {!loading &&
      classes.length === 0 && (

        <div className="empty-state">

          <h3>No Online Classes</h3>

          <p>
            You have not scheduled any online classes yet.
          </p>

        </div>

      )}

    {/* ======================================================
        TABLE
    ====================================================== */}

    {!loading &&
      classes.length > 0 && (

        <div className="table-wrapper">

          <table className="online-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Title</th>

                <th>Description</th>

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

                  <td>{item.id}</td>

                  <td>{item.title}</td>

                  <td>{item.description}</td>

                  <td>{item.subject_id}</td>

                  <td>{item.term_id}</td>

                  <td>
                    {formatDateTime(item.start_time)}
                  </td>

                  <td>
                    {formatDateTime(item.end_time)}
                  </td>

                  <td>

                    {item.meeting_link ? (

                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-link"
                      >
                        Join Class
                      </a>

                    ) : (

                      "No Link"

                    )}

                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
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

export default TeacherOnlineClasses;