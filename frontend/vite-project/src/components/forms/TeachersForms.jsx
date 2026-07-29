import React, { useState } from "react";

const TeacherForm = ({
  initialData = {},
  courses = [],
  subjects = [],
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    gender: initialData.gender || "",
    address: initialData.address || "",
    qualification: initialData.qualification || "",
    courses: initialData.courses || [],
    subjects: initialData.subjects || [],
  });

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // HANDLE MULTI-SELECT
  // ======================================================
  const handleMultiSelect = (e, field) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  // ======================================================
  // SUBMIT
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
      {/* FULL NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-full-name">
          Full Name
        </label>

        <input
          id="teacher-full-name"
          type="text"
          name="full_name"
          autoComplete="name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
      </div>

      {/* ====================================================== */}
      {/* EMAIL */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-email">
          Email
        </label>

        <input
          id="teacher-email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* ====================================================== */}
      {/* PHONE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-phone">
          Phone
        </label>

        <input
          id="teacher-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* GENDER */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-gender">
          Gender
        </label>

        <select
          id="teacher-gender"
          name="gender"
          autoComplete="sex"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">
            Select gender
          </option>

          <option value="male">
            Male
          </option>

          <option value="female">
            Female
          </option>
        </select>
      </div>

      {/* ====================================================== */}
      {/* ADDRESS */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-address">
          Address
        </label>

        <input
          id="teacher-address"
          type="text"
          name="address"
          autoComplete="street-address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* QUALIFICATION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-qualification">
          Qualification
        </label>

        <input
          id="teacher-qualification"
          type="text"
          name="qualification"
          autoComplete="organization-title"
          value={formData.qualification}
          onChange={handleChange}
          placeholder="e.g. BSc, MSc, PhD"
        />
      </div>

      {/* ====================================================== */}
      {/* COURSES */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-courses">
          Assign Courses
        </label>

        <select
          id="teacher-courses"
          name="courses"
          multiple
          autoComplete="off"
          value={formData.courses}
          onChange={(e) =>
            handleMultiSelect(e, "courses")
          }
        >
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
      {/* SUBJECTS */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="teacher-subjects">
          Assign Subjects
        </label>

        <select
          id="teacher-subjects"
          name="subjects"
          multiple
          autoComplete="off"
          value={formData.subjects}
          onChange={(e) =>
            handleMultiSelect(e, "subjects")
          }
        >
          {subjects.map((s) => (
            <option
              key={s.id}
              value={s.id}
            >
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ====================================================== */}
      {/* BUTTON */}
      {/* ====================================================== */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          background: "#7c3aed",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Saving..."
          : "Save Teacher"}
      </button>
    </form>
  );
};

export default TeacherForm;