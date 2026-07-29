import React, { useState } from "react";

const SubjectForm = ({
  initialData = {},
  courses = [],
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    code: initialData.code || "",
    course_id: initialData.course_id || "",
    description: initialData.description || "",
  });

  // ======================================================
  // HANDLE CHANGE
  // ======================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // HANDLE SUBMIT
  // ======================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="on"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {/* ====================================================== */}
      {/* SUBJECT NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="subject-name">
          Subject Name
        </label>

        <input
          id="subject-name"
          type="text"
          name="name"
          autoComplete="off"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Mathematics"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* SUBJECT CODE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="subject-code">
          Subject Code
        </label>

        <input
          id="subject-code"
          type="text"
          name="code"
          autoComplete="off"
          value={formData.code}
          onChange={handleChange}
          placeholder="e.g. MTH101"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* COURSE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="subject-course">
          Course
        </label>

        <select
          id="subject-course"
          name="course_id"
          autoComplete="off"
          value={formData.course_id}
          onChange={handleChange}
          required
        >
          <option value="">
            Select course
          </option>

          {courses.map((c) => (
            <option
              key={c.id}
              value={c.id}
            >
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ====================================================== */}
      {/* DESCRIPTION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="subject-description">
          Description
        </label>

        <textarea
          id="subject-description"
          name="description"
          autoComplete="off"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional subject description"
          rows="4"
        />
      </div>

      {/* ====================================================== */}
      {/* BUTTON */}
      {/* ====================================================== */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          background: "#0ea5e9",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Saving..."
          : "Save Subject"}
      </button>
    </form>
  );
};

export default SubjectForm;