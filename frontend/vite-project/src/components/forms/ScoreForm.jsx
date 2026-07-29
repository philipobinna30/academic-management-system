import React, { useState } from "react";

const ScoreForm = ({
  initialData = {},
  students = [],
  subjects = [],
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    student_id: initialData.student_id || "",
    subject_id: initialData.subject_id || "",
    term: initialData.term || "",
    session: initialData.session || "",
    ca_score: initialData.ca_score || "",
    exam_score: initialData.exam_score || "",
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

    const payload = {
      ...formData,
      ca_score: Number(formData.ca_score),
      exam_score: Number(formData.exam_score),
    };

    if (onSubmit) {
      onSubmit(payload);
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
      {/* STUDENT */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="score-student">
          Student
        </label>

        <select
          id="score-student"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          autoComplete="off"
          required
        >
          <option value="">
            Select student
          </option>

          {students.map((s) => (
            <option
              key={s.id}
              value={s.id}
            >
              {s.full_name || s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ====================================================== */}
      {/* SUBJECT */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="score-subject">
          Subject
        </label>

        <select
          id="score-subject"
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          autoComplete="off"
          required
        >
          <option value="">
            Select subject
          </option>

          {subjects.map((sub) => (
            <option
              key={sub.id}
              value={sub.id}
            >
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* ====================================================== */}
      {/* TERM */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="score-term">
          Term
        </label>

        <input
          id="score-term"
          name="term"
          type="text"
          autoComplete="off"
          value={formData.term}
          onChange={handleChange}
          placeholder="e.g. First Term"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* SESSION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="score-session">
          Session
        </label>

        <input
          id="score-session"
          name="session"
          type="text"
          autoComplete="off"
          value={formData.session}
          onChange={handleChange}
          placeholder="e.g. 2025/2026"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* CA SCORE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="score-ca">
          CA Score
        </label>

        <input
          id="score-ca"
          name="ca_score"
          type="number"
          autoComplete="off"
          value={formData.ca_score}
          onChange={handleChange}
          min="0"
          max="40"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* EXAM SCORE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="score-exam">
          Exam Score
        </label>

        <input
          id="score-exam"
          name="exam_score"
          type="number"
          autoComplete="off"
          value={formData.exam_score}
          onChange={handleChange}
          min="0"
          max="60"
          required
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
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Saving..."
          : "Save Score"}
      </button>
    </form>
  );
};

export default ScoreForm;