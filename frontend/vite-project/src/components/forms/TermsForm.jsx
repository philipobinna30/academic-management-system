import React, { useState } from "react";

const TermForm = ({
  initialData = {},
  sessions = [],
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    session_id: initialData.session_id || "",
    start_date: initialData.start_date || "",
    end_date: initialData.end_date || "",
    is_active: initialData.is_active || false,
  });

  // ======================================================
  // HANDLE CHANGE
  // ======================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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
      {/* TERM NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="term-name">
          Term Name
        </label>

        <input
          id="term-name"
          type="text"
          name="name"
          autoComplete="off"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. First Term"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* SESSION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="term-session">
          Session
        </label>

        <select
          id="term-session"
          name="session_id"
          autoComplete="off"
          value={formData.session_id}
          onChange={handleChange}
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
      {/* START DATE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="term-start-date">
          Start Date
        </label>

        <input
          id="term-start-date"
          type="date"
          name="start_date"
          autoComplete="off"
          value={formData.start_date}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* END DATE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="term-end-date">
          End Date
        </label>

        <input
          id="term-end-date"
          type="date"
          name="end_date"
          autoComplete="off"
          value={formData.end_date}
          onChange={handleChange}
        />
      </div>

      {/* ====================================================== */}
      {/* ACTIVE TERM */}
      {/* ====================================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          id="term-active"
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
        />

        <label htmlFor="term-active">
          Set as Active Term
        </label>
      </div>

      {/* ====================================================== */}
      {/* BUTTON */}
      {/* ====================================================== */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          background: "#f97316",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Saving..."
          : "Save Term"}
      </button>
    </form>
  );
};

export default TermForm;