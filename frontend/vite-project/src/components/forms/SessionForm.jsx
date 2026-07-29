import React, { useState } from "react";

const SessionForm = ({
  initialData = {},
  onSubmit,
  loading = false,
}) => {
  // ======================================================
  // STATES
  // ======================================================
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    start_year: initialData.start_year || "",
    end_year: initialData.end_year || "",
    is_active: initialData.is_active || false,
  });

  // ======================================================
  // HANDLE CHANGE
  // ======================================================
  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

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

    const payload = {
      ...formData,
      start_year: Number(
        formData.start_year
      ),
      end_year: Number(
        formData.end_year
      ),
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
      {/* SESSION NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="session-name">
          Session Name
        </label>

        <input
          id="session-name"
          type="text"
          name="name"
          autoComplete="off"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. 2025/2026 Academic Session"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* START YEAR */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="session-start-year">
          Start Year
        </label>

        <input
          id="session-start-year"
          type="number"
          name="start_year"
          autoComplete="off"
          value={formData.start_year}
          onChange={handleChange}
          placeholder="e.g. 2025"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* END YEAR */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="session-end-year">
          End Year
        </label>

        <input
          id="session-end-year"
          type="number"
          name="end_year"
          autoComplete="off"
          value={formData.end_year}
          onChange={handleChange}
          placeholder="e.g. 2026"
          required
        />
      </div>

      {/* ====================================================== */}
      {/* ACTIVE SESSION */}
      {/* ====================================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          id="session-active"
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
        />

        <label htmlFor="session-active">
          Set as Active Session
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
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading
          ? "Saving..."
          : "Save Session"}
      </button>
    </form>
  );
};

export default SessionForm;