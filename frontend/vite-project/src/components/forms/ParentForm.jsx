import React, { useState } from "react";

const ParentForm = ({
  initialData = {},
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
    address: initialData.address || "",
    occupation: initialData.occupation || "",
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
      {/* FULL NAME */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="parent-full-name">
          Full Name
        </label>

        <input
          id="parent-full-name"
          name="full_name"
          type="text"
          autoComplete="name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Enter parent full name"
          required
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* EMAIL */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="parent-email">
          Email
        </label>

        <input
          id="parent-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* PHONE */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="parent-phone">
          Phone Number
        </label>

        <input
          id="parent-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          required
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* ADDRESS */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="parent-address">
          Address
        </label>

        <textarea
          id="parent-address"
          name="address"
          autoComplete="street-address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter address"
          rows="3"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* OCCUPATION */}
      {/* ====================================================== */}
      <div>
        <label htmlFor="parent-occupation">
          Occupation
        </label>

        <input
          id="parent-occupation"
          name="occupation"
          type="text"
          autoComplete="organization"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="Enter occupation"
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
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Saving..." : "Save Parent"}
      </button>
    </form>
  );
};

export default ParentForm;