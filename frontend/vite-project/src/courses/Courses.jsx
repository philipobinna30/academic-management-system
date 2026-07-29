import React, { useEffect, useState } from "react";

// ======================================================
// SERVICES
// ======================================================
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../../services/courseService";

const Courses = () => {
  // ======================================================
  // STATES
  // ======================================================
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // FETCH COURSES
  // ======================================================
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await getCourses();

      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load courses:", error);

      setErrorMsg(
        error?.message || "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // HANDLE INPUT
  // ======================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // HANDLE SUBMIT
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      // ==================================================
      // CREATE
      // ==================================================
      if (!editingId) {
        await createCourse(payload);

        alert("Course created successfully");
      }

      // ==================================================
      // UPDATE
      // ==================================================
      else {
        await updateCourse(editingId, payload);

        alert("Course updated successfully");
      }

      // ==================================================
      // RESET
      // ==================================================
      setForm({
        name: "",
        description: "",
      });

      setEditingId(null);

      fetchCourses();
    } catch (error) {
      console.error("Saving course failed:", error);

      setErrorMsg(
        error?.message || "Failed to save course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // HANDLE EDIT
  // ======================================================
  const handleEdit = (course) => {
    setForm({
      name: course?.name || "",
      description: course?.description || "",
    });

    setEditingId(course.id);
  };

  // ======================================================
  // HANDLE DELETE
  // ======================================================
  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Delete this course?"
    );

    if (!confirmed) return;

    try {
      await deleteCourse(courseId);

      alert("Course deleted successfully");

      fetchCourses();
    } catch (error) {
      console.error("Delete failed:", error);

      setErrorMsg(
        error?.message || "Failed to delete course"
      );
    }
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div>
      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: "20px" }}>
        <h1>Courses</h1>

        <p style={{ color: "#6b7280" }}>
          Manage school courses
        </p>
      </div>

      {/* ================= ERROR ================= */}
      {errorMsg && (
        <p
          style={{
            color: "red",
            marginBottom: "20px",
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >
        <input
          type="text"
          name="name"
          placeholder="Course Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="description"
          placeholder="Course Description"
          value={form.description}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Course"
            : "Create Course"}
        </button>
      </form>

      {/* ================= TABLE ================= */}
      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>

                <td>
                  {course.name || "N/A"}
                </td>

                <td>
                  {course.description || "-"}
                </td>

                <td>
                  <button
                    onClick={() =>
                      handleEdit(course)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(course.id)
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

export default Courses;