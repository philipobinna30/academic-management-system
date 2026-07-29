import React, { useEffect, useState } from "react";

import {
  getAllParents,
  createParent,
  updateParent,
  deleteParent,
} from "../../../services/parentService";

import ParentsTable from "../../../components/tables/ParentsTable";
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * Parents Page (Admin)
 * Fully aligned with backend structure
 */

const Parents = () => {

  // ======================================================
  // STATE
  // ======================================================
  const [parents, setParents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState(null);

  // ======================================================
  // FETCH PARENTS
  // ======================================================
  const fetchParents = async () => {

    setLoading(true);

    try {

      setErrorMsg("");

      const data = await getAllParents();

      setParents(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load parents:",
        error
      );

      setErrorMsg(
        error?.response?.data?.detail ||
        "Failed to load parents"
      );

      setParents([]);

    } finally {

      setLoading(false);
    }
  };

  // ======================================================
  // INIT
  // ======================================================
  useEffect(() => {
    fetchParents();
  }, []);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      setErrorMsg("");

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      // ==================================================
      // UPDATE
      // ==================================================
      if (editingId) {

        await updateParent(
          editingId,
          payload
        );

        alert(
          "Parent updated successfully"
        );

      } else {

        // ==================================================
        // CREATE
        // ==================================================
        await createParent(payload);

        alert(
          "Parent created successfully"
        );
      }

      // ==================================================
      // RESET
      // ==================================================
      setForm({
        full_name: "",
        email: "",
        phone: "",
      });

      setEditingId(null);

      // ==================================================
      // REFRESH
      // ==================================================
      fetchParents();

    } catch (error) {

      console.error(
        "Save parent failed:",
        error
      );

      setErrorMsg(
        error?.response?.data?.detail ||
        "Failed to save parent"
      );

    } finally {

      setSubmitting(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit = (parent) => {

    setForm({
      full_name:
        parent?.full_name || "",

      email:
        parent?.email || "",

      phone:
        parent?.phone || "",
    });

    setEditingId(parent.id);
  };

  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Delete this parent?"
      )
    ) {
      return;
    }

    try {

      await deleteParent(id);

      alert(
        "Parent deleted successfully"
      );

      setParents((prev) =>
        prev.filter(
          (parent) =>
            parent.id !== id
        )
      );

    } catch (error) {

      console.error(
        "Delete parent failed:",
        error
      );

      setErrorMsg(
        error?.response?.data?.detail ||
        "Failed to delete parent"
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div>

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div style={{ marginBottom: "20px" }}>

        <h2>Parents</h2>

        <p style={{ color: "#6b7280" }}>
          Manage parent accounts and linked students.
        </p>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}
      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >

        {/* FULL NAME */}
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        {/* PHONE */}
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Parent"
            : "Create Parent"}
        </button>

      </form>

      {/* ======================================================
          ERROR
      ====================================================== */}
      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {/* ======================================================
          LOADING / TABLE
      ====================================================== */}
      {loading ? (

        <Loader />

      ) : (

        <ParentsTable
          parents={parents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      )}

    </div>
  );
};

/* ======================================================
   STYLES
====================================================== */

const formStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

export default Parents;