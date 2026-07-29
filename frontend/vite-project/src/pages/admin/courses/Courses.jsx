import React, { useEffect, useState } from "react";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../../services/courseService";

import { getTeachers } from "../../../services/teacherService";

import CoursesTable from "../../../components/tables/CoursesTable";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * ======================================================
 * COURSES PAGE
 * Fully aligned with backend services
 * ======================================================
 */

const Courses = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    teacher_id: "",
  });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [coursesData, teachersData] =
        await Promise.all([
          getCourses(),
          getTeachers(),
        ]);

      setCourses(
        Array.isArray(coursesData)
          ? coursesData
          : []
      );

      setTeachers(
        Array.isArray(teachersData)
          ? teachersData.filter(
              (user) =>
                user.role === "teacher"
            )
          : []
      );
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to load courses"
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
  // CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // RESET
  // ======================================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      teacher_id: "",
    });

    setEditingId(null);
    setErrorMsg("");
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        teacher_id: form.teacher_id
          ? Number(form.teacher_id)
          : null,
      };

      if (!payload.name) {
        throw new Error(
          "Course name is required"
        );
      }

      // ==========================
      // UPDATE
      // ==========================

      if (editingId) {
        await updateCourse(
          editingId,
          payload
        );

        alert(
          "Course updated successfully"
        );
      }

      // ==========================
      // CREATE
      // ==========================

      else {
        await createCourse(payload);

        alert(
          "Course created successfully"
        );
      }

      resetForm();

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to save course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (course) => {
    setForm({
      name: course?.name || "",
      description:
        course?.description || "",
      teacher_id: course?.teacher_id
        ? String(course.teacher_id)
        : "",
    });

    setEditingId(course.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this course?"
      );

    if (!confirmed) return;

    try {
      setErrorMsg("");

      await deleteCourse(id);

      alert(
        "Course deleted successfully"
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to delete course"
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2>Courses</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Manage academic courses
          and assign teachers.
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >
        <input
          name="name"
          placeholder="Course Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <select
          name="teacher_id"
          value={form.teacher_id}
          onChange={handleChange}
        >
          <option value="">
            Select Teacher
          </option>

          {teachers.map((teacher) => (
            <option
              key={teacher.id}
              value={teacher.id}
            >
              {teacher.full_name}
            </option>
          ))}
        </select>

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

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
      </form>

      {/* ERROR */}

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* CONTENT */}

      {loading ? (
        <Loader />
      ) : (
        <CoursesTable
          courses={courses}
          teachers={teachers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

export default Courses;