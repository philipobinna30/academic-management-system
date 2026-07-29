import React, { useState } from "react";

const CourseForm = ({
  initialData = {},
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    code: initialData.code || "",
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
        width: "100%",
      }}
    >
      {/* ====================================================== */}
      {/* COURSE NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="course-name">
          Course Name
        </label>

        <input
          id="course-name"
          type="text"
          name="name"
          autoComplete="organization-title"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter course name"
          required
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* COURSE CODE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="course-code">
          Course Code
        </label>

        <input
          id="course-code"
          type="text"
          name="code"
          autoComplete="off"
          value={formData.code}
          onChange={handleChange}
          placeholder="Enter course code"
          required
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* DESCRIPTION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="course-description">
          Description
        </label>

        <textarea
          id="course-description"
          name="description"
          autoComplete="off"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter course description"
          rows="4"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
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
          background: "#2563eb",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        {loading ? "Saving..." : "Save Course"}
      </button>
    </form>
  );
};

export default CourseForm;