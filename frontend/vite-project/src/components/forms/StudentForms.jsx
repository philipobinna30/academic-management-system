import React, { useState } from "react";

const StudentForm = ({
  initialData = {},
  courses = [],
  sessions = [],
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    email: initialData.email || "",
    gender: initialData.gender || "",
    date_of_birth: initialData.date_of_birth || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    course_id: initialData.course_id || "",
    session_id: initialData.session_id || "",
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
      {/* FULL NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-full-name">
          Full Name
        </label>

        <input
          id="student-full-name"
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
        <label htmlFor="student-email">
          Email
        </label>

        <input
          id="student-email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* ====================================================== */}
      {/* GENDER */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-gender">
          Gender
        </label>

        <select
          id="student-gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          autoComplete="sex"
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
      {/* DATE OF BIRTH */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-dob">
          Date of Birth
        </label>

        <input
          id="student-dob"
          type="date"
          name="date_of_birth"
          autoComplete="bday"
          value={formData.date_of_birth}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* PHONE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-phone">
          Phone
        </label>

        <input
          id="student-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* ADDRESS */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-address">
          Address
        </label>

        <input
          id="student-address"
          type="text"
          name="address"
          autoComplete="street-address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* COURSE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-course">
          Course
        </label>

        <select
          id="student-course"
          name="course_id"
          value={formData.course_id}
          onChange={handleChange}
          autoComplete="off"
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
      {/* SESSION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="student-session">
          Session
        </label>

        <select
          id="student-session"
          name="session_id"
          value={formData.session_id}
          onChange={handleChange}
          autoComplete="off"
          required
        >
          <option value="">
            Select session
          </option>

          {sessions.map((s) => (
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
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Saving..."
          : "Save Student"}
      </button>
    </form>
  );
};

export default StudentForm;