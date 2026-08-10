import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Parents.css";

// ======================================================
// SERVICES
// ======================================================

import {
  getAllParents,
  createParent,
  updateParent,
  deleteParent,
} from "../../../services/parentService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaUserEdit,
  FaTimes,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

/**
 * ======================================================
 * PARENTS MANAGEMENT
 * Professional Dashboard Version
 * ======================================================
 */

const Parents = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [parents, setParents] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // ======================================================
  // FETCH PARENTS
  // ======================================================

  const fetchParents = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const data = await getAllParents();

      setParents(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(error);

      setParents([]);

      setErrorMsg(

        error?.message ||

        error?.response?.data?.detail ||

        "Failed to load parents."

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    fetchParents();

  }, []);

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const filteredParents = useMemo(() => {

    if (!search.trim()) {

      return parents;

    }

    const keyword = search.toLowerCase();

    return parents.filter(

      (parent) =>

        parent.full_name
          ?.toLowerCase()
          .includes(keyword)

        ||

        parent.email
          ?.toLowerCase()
          .includes(keyword)

        ||

        parent.phone
          ?.toLowerCase()
          .includes(keyword)

    );

  }, [parents, search]);

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const totalParents = parents.length;

  const parentsWithEmail =
    parents.filter(
      (parent) => parent.email
    ).length;

  const parentsWithPhone =
    parents.filter(
      (parent) => parent.phone
    ).length;

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({

      ...prev,

      [name]: value,

    }));

  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {

    setEditingId(null);

    setForm({

      full_name: "",

      email: "",

      phone: "",

    });

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

        full_name:
          form.full_name.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

      };

      if (editingId) {

        await updateParent(

          editingId,

          payload

        );

        alert(
          "Parent updated successfully."
        );

      } else {

        await createParent(
          payload
        );

        alert(
          "Parent created successfully."
        );

      }

      resetForm();

      await fetchParents();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        error?.response?.data?.detail ||

        "Failed to save parent."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (parent) => {

    setEditingId(parent.id);

    setForm({

      full_name:
        parent.full_name || "",

      email:
        parent.email || "",

      phone:
        parent.phone || "",

    });

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Delete this parent?"
    );

    if (!confirmed) return;

    try {

      await deleteParent(id);

      alert(
        "Parent deleted successfully."
      );

      await fetchParents();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        error?.response?.data?.detail ||

        "Failed to delete parent."

      );

    }

  };


// ======================================================
// RENDER
// ======================================================

return (

  <div className="parents-page">

    {/* ======================================================
        HEADER
    ====================================================== */}

    <div className="parents-header">

      <div>

        <h1>
          Parent Management
        </h1>

        <p>
          Create, edit and manage parent accounts linked to students.
        </p>

      </div>

    </div>

    {/* ======================================================
        DASHBOARD
    ====================================================== */}

    <div className="parent-stats">

      <div className="stat-card blue">

        <div className="stat-icon">
          <FaUsers />
        </div>

        <div>
          <h2>{totalParents}</h2>
          <span>Total Parents</span>
        </div>

      </div>

      <div className="stat-card green">

        <div className="stat-icon">
          <FaEnvelope />
        </div>

        <div>
          <h2>{parentsWithEmail}</h2>
          <span>Email Records</span>
        </div>

      </div>

      <div className="stat-card orange">

        <div className="stat-icon">
          <FaPhone />
        </div>

        <div>
          <h2>{parentsWithPhone}</h2>
          <span>Phone Records</span>
        </div>

      </div>

    </div>

    {/* ======================================================
        SEARCH
    ====================================================== */}

    <div className="search-card">

      <div className="search-box">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search parents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

    </div>

    {/* ======================================================
        FORM
    ====================================================== */}

    <div className="parent-form-card">

      <h2>

        {editingId
          ? "Update Parent"
          : "Add New Parent"}

      </h2>

      <form
        onSubmit={handleSubmit}
        className="parent-form"
      >

        {/* FULL NAME */}

        <div className="form-group">

          <FaUsers className="form-icon" />

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

        </div>

        {/* EMAIL */}

        <div className="form-group">

          <FaEnvelope className="form-icon" />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

        </div>

        {/* PHONE */}

        <div className="form-group">

          <FaPhone className="form-icon" />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

        </div>

        {/* BUTTONS */}

        <div className="parent-buttons">

          <button
            type="submit"
            className="save-btn"
            disabled={submitting}
          >

            {submitting ? (
              "Processing..."
            ) : editingId ? (
              <>
                <FaUserEdit />
                <span>Update Parent</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Save Parent</span>
              </>
            )}

          </button>

          {editingId && (

            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >

              <FaTimes />

              <span>Cancel</span>

            </button>

          )}

        </div>

      </form>

    </div>

    {/* ======================================================
        ERROR
    ====================================================== */}

    {errorMsg && (

      <ErrorMessage
        message={errorMsg}
      />

    )}

    {/* ======================================================
        CONTENT
    ====================================================== */}

    {loading ? (

      <Loader />

    ) : filteredParents.length === 0 ? (

      <div className="empty-state">

        <FaUsers />

        <h3>
          No Parents Found
        </h3>

        <p>
          No parent records match your current search.
        </p>

      </div>

    ) : (

      <div className="table-wrapper">

        <table className="parents-table">

          <thead>

            <tr>

              <th>S/N</th>

              <th>Parent</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Student</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredParents.map((parent, index) => (

              <tr key={parent.id}>

                {/* SERIAL NUMBER */}

                <td>

                  {index + 1}

                </td>

                {/* PARENT */}

                <td>

                  <div className="parent-cell">

                    <div className="parent-avatar">

                      {parent.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}

                    </div>

                    <div className="parent-info">

                      <strong>

                        {parent.full_name}

                      </strong>

                    </div>

                  </div>

                </td>

                {/* EMAIL */}

                <td>

                  {parent.email || "N/A"}

                </td>

                {/* PHONE */}

                <td>

                  {parent.phone || "N/A"}

                </td>

                {/* STUDENT */}

                <td>

                  {parent.student_name || "N/A"}

                </td>

                {/* ACTIONS */}

                <td>

                  <div className="action-buttons">

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEdit(parent)}
                    >

                      <FaEdit />

                      <span>Edit</span>

                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(parent.id)}
                    >

                      <FaTrash />

                      <span>Delete</span>

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    )}

  </div>

);

};

export default Parents;