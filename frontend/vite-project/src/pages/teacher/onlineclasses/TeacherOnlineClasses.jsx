import React, { useEffect, useState } from "react";

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

/**
 * Teacher Online Classes
 *
 * Backend:
 * GET    /teachers/{teacher_id}/online-classes
 * POST   /teachers/{teacher_id}/online-classes
 * PATCH  /teachers/{teacher_id}/online-classes/{class_id}
 * DELETE /teachers/{teacher_id}/online-classes/{class_id}
 */

const TeacherOnlineClasses = () => {
  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================
  const [classes, setClasses] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [termId, setTermId] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  const [form, setForm] =
    useState({
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
          "Failed to load online classes"
      );

      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD INITIAL DATA
  // ======================================================
  const loadInitialData =
    async () => {
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
          setTermId(
            activeTerm.id
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

  // ======================================================
  // LOAD DATA
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

    const loadSubjects =
      async () => {
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
  // INPUT CHANGE
  // ======================================================
  const handleChange = (
    e
  ) => {
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
  // RESET
  // ======================================================
  const resetForm =
    () => {
      setEditingId(null);

      setSelectedCourse("");

      setSubjects([]);

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
  // CREATE / UPDATE
  // ======================================================
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const payload = {
          title: form.title,
          description:
            form.description,
          meeting_link:
            form.meeting_link,
          subject_id: Number(
            form.subject_id
          ),
          term_id: Number(
            termId
          ),
          start_time:
            form.start_time,
          end_time:
            form.end_time,
        };

        if (editingId) {
          await updateTeacherOnlineClass(
            teacherId,
            editingId,
            payload
          );

          setSuccessMsg(
            "Class updated successfully."
          );
        } else {
          await createTeacherOnlineClass(
            teacherId,
            payload
          );

          setSuccessMsg(
            "Class created successfully."
          );
        }

        resetForm();

        await fetchClasses();
      } catch (error) {
        console.error(error);

        setErrorMsg(
          error?.message ||
            "Failed to save class."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit =
    (item) => {
      setEditingId(item.id);

      setForm({
        title:
          item.title || "",
        description:
          item.description || "",
        meeting_link:
          item.meeting_link || "",
        subject_id: String(
          item.subject_id || ""
        ),
        start_time:
          item.start_time
            ?.slice(0, 16) || "",
        end_time:
          item.end_time
            ?.slice(0, 16) || "",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete =
    async (classId) => {
      if (
        !window.confirm(
          "Delete this class?"
        )
      ) {
        return;
      }

      try {
        await deleteTeacherOnlineClass(
          teacherId,
          classId
        );

        setClasses((prev) =>
          prev.filter(
            (item) =>
              item.id !== classId
          )
        );

        setSuccessMsg(
          "Class deleted successfully."
        );
      } catch (error) {
        console.error(error);

        setErrorMsg(
          error?.message ||
            "Failed to delete class."
        );
      }
    };

// ======================================================
// FORMAT DATE
// ======================================================
const formatDateTime = (
  value
) => {
  if (!value) return "N/A";

  try {
    return new Date(
      value
    ).toLocaleString();
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
  <div>
    {/* HEADER */}
    <div
      style={{
        marginBottom: "25px",
      }}
    >
      <h2>Online Classes</h2>

      <p
        style={{
          color: "#6b7280",
        }}
      >
        Create, schedule and manage
        your online classes.
      </p>

      {termId && (
        <p
          style={{
            color: "#16a34a",
            marginTop: "8px",
          }}
        >
          Active Term ID: {termId}
        </p>
      )}
    </div>

    {/* SUCCESS */}
    {successMsg && (
      <p
        style={{
          color: "green",
          marginBottom: "15px",
        }}
      >
        {successMsg}
      </p>
    )}

    {/* ERROR */}
    {errorMsg && (
      <ErrorMessage
        message={errorMsg}
      />
    )}

    {/* ======================================================
        CREATE / EDIT FORM
    ====================================================== */}
    <form
      onSubmit={handleSubmit}
      style={formStyle}
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

      {/* COURSE */}
      <select
        value={selectedCourse}
        onChange={(e) =>
          setSelectedCourse(
            e.target.value
          )
        }
        required
      >
        <option value="">
          Select Course
        </option>

        {courses.map(
          (course) => (
            <option
              key={course.id}
              value={course.id}
            >
              {course.name}
            </option>
          )
        )}
      </select>

      {/* SUBJECT */}
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

        {subjects.map(
          (subject) => (
            <option
              key={subject.id}
              value={subject.id}
            >
              {subject.name}
            </option>
          )
        )}
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
      >
        {editingId
          ? "Update Class"
          : "Schedule Class"}
      </button>

      {editingId && (
        <button
          type="button"
          onClick={resetForm}
        >
          Cancel
        </button>
      )}
    </form>

    {/* ======================================================
        EMPTY
    ====================================================== */}
    {!loading &&
      classes.length === 0 && (
        <p>
          No online classes found.
        </p>
      )}

    {/* ======================================================
        TABLE
    ====================================================== */}
    {classes.length > 0 && (
      <table style={tableStyle}>
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
          {classes.map(
            (item) => (
              <tr
                key={item.id}
              >
                <td>
                  {item.id}
                </td>

                <td>
                  {item.title}
                </td>

                <td>
                  {item.description}
                </td>

                <td>
                  {item.subject_id}
                </td>

                <td>
                  {item.term_id}
                </td>

                <td>
                  {formatDateTime(
                    item.start_time
                  )}
                </td>

                <td>
                  {formatDateTime(
                    item.end_time
                  )}
                </td>

                <td>
                  {item.meeting_link ? (
                    <a
                      href={
                        item.meeting_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Class
                    </a>
                  ) : (
                    "No Link"
                  )}
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
                      type="button"
                      onClick={() =>
                        handleEdit(
                          item
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          item.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
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
  borderCollapse:
    "collapse",
};

export default TeacherOnlineClasses;