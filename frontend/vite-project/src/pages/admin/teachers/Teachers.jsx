import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Teachers.css";

import { useNavigate } from "react-router-dom";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../../services/teacherService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaChalkboardTeacher,
  FaSearch,
  FaUserTie,
  FaEnvelope,
  FaLock,
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaBookOpen,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

/**
 * ======================================================
 * TEACHERS PAGE
 * Backend Schema Compatible
 *
 * UserCreateBase
 * UserUpdate
 * UserResponse
 * ======================================================
 */

const Teachers = () => {

  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [teachers, setTeachers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  // Search

  const [search, setSearch] =
    useState("");

  // Form

  const [form, setForm] = useState({

    full_name: "",

    email: "",

    password: "",

  });

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const totalTeachers =
    teachers.length;

  const activeTeachers =
    teachers.filter(
      (teacher) => teacher.is_active
    ).length;

  const verifiedTeachers =
    teachers.filter(
      (teacher) => teacher.is_verified
    ).length;

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const filteredTeachers =
    useMemo(() => {

      if (!search.trim()) {
        return teachers;
      }

      const keyword =
        search.toLowerCase();

      return teachers.filter(
        (teacher) =>

          teacher.full_name
            ?.toLowerCase()
            .includes(keyword) ||

          teacher.email
            ?.toLowerCase()
            .includes(keyword)

      );

    }, [teachers, search]);

  // ======================================================
  // FETCH TEACHERS
  // ======================================================

  const fetchTeachers = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const data =
        await getTeachers();

      const teacherList =
        Array.isArray(data)

          ? data.filter(
              (user) =>
                user.role ===
                "teacher"
            )

          : [];

      setTeachers(
        teacherList
      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error.message ||

          "Failed to load teachers"

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INIT
  // ======================================================

  useEffect(() => {

    fetchTeachers();

  }, []);
  // ======================================================
  // CHANGE
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
  // RESET
  // ======================================================

  const resetForm = () => {

    setForm({

      full_name: "",

      email: "",

      password: "",

    });

    setEditingId(null);

  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSubmitting(true);

      setErrorMsg("");

      // -------------------------
      // Basic Validation
      // -------------------------

      if (!form.full_name.trim()) {

        throw new Error(
          "Teacher name is required."
        );

      }

      if (!form.email.trim()) {

        throw new Error(
          "Email address is required."
        );

      }

      // ==========================================
      // UPDATE
      // ==========================================

      if (editingId) {

        const payload = {

          full_name:
            form.full_name.trim(),

          email:
            form.email.trim(),

        };

        if (
          form.password.trim()
        ) {

          payload.password =
            form.password.trim();

        }

        await updateTeacher(

          editingId,

          payload

        );

        alert(
          "Teacher updated successfully."
        );

      }

      // ==========================================
      // CREATE
      // ==========================================

      else {

        if (!form.password.trim()) {

          throw new Error(
            "Password is required."
          );

        }

        await createTeacher({

          full_name:
            form.full_name.trim(),

          email:
            form.email.trim(),

          password:
            form.password.trim(),

          role: "teacher",

        });

        alert(
          "Teacher created successfully."
        );

      }

      resetForm();

      await fetchTeachers();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error.message ||

          "Failed to save teacher."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (teacher) => {

    setEditingId(

      teacher.id

    );

    setForm({

      full_name:
        teacher.full_name || "",

      email:
        teacher.email || "",

      password: "",

    });

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (
    teacherId
  ) => {

    const confirmed =
      window.confirm(
        "Delete this teacher?"
      );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await deleteTeacher(
        teacherId
      );

      setTeachers((prev) =>

        prev.filter(

          (teacher) =>

            teacher.id !==
            teacherId

        )

      );

      alert(
        "Teacher deleted successfully."
      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error.message ||

          "Failed to delete teacher."

      );

    }

  };

  // ======================================================
  // VIEW COURSES
  // ======================================================

  const handleViewCourses = (
    teacherId
  ) => {

    navigate(

      `/admin/teachers/${teacherId}/courses`

    );

  };

  // ======================================================
  // STATUS
  // ======================================================

  const getStatus = (
    teacher
  ) => {

    if (!teacher.is_verified) {

      return "Unverified";

    }

    if (!teacher.is_active) {

      return "Inactive";

    }

    return "Active";

  };

  // ======================================================
  // BADGE COLOR
  // ======================================================

  const getStatusClass = (
    teacher
  ) => {

    if (!teacher.is_verified) {

      return "status-unverified";

    }

    if (!teacher.is_active) {

      return "status-inactive";

    }

    return "status-active";

  };

  // ======================================================
  // AVATAR INITIALS
  // ======================================================

  const getInitials = (
    fullName
  ) => {

    if (!fullName) return "T";

    return fullName

      .split(" ")

      .map((word) => word[0])

      .join("")

      .substring(0, 2)

      .toUpperCase();

  };

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="teachers-page">      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="teachers-header">

        <div>

          <h1>
            Teacher Management
          </h1>

          <p>
            Manage teacher accounts,
            permissions and assigned
            courses.
          </p>

        </div>

      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="teacher-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaChalkboardTeacher />

          </div>

          <div>

            <h2>{totalTeachers}</h2>

            <span>Total Teachers</span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaUserCheck />

          </div>

          <div>

            <h2>{activeTeachers}</h2>

            <span>Active Teachers</span>

          </div>

        </div>

        <div className="stat-card purple">

          <div className="stat-icon">

            <FaUserTie />

          </div>

          <div>

            <h2>{verifiedTeachers}</h2>

            <span>Verified Teachers</span>

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

            placeholder="Search teacher by name or email..."

            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }

          />

        </div>

      </div>

      {/* ======================================================
          FORM CARD
      ====================================================== */}

      <div className="teacher-form-card">

        <h2>

          {editingId

            ? "Update Teacher"

            : "Create New Teacher"}

        </h2>

        <form

          onSubmit={handleSubmit}

          className="teacher-form"

        >

          <div className="form-group">

            <FaUserTie className="form-icon" />

            <input

              name="full_name"

              placeholder="Teacher Full Name"

              value={form.full_name}

              onChange={handleChange}

              required

            />

          </div>

          <div className="form-group">

            <FaEnvelope className="form-icon" />

            <input

              type="email"

              name="email"

              placeholder="Teacher Email"

              value={form.email}

              onChange={handleChange}

              required

            />

          </div>

          <div className="form-group">

            <FaLock className="form-icon" />

            <input

              type="password"

              name="password"

              placeholder={
                editingId
                  ? "New Password (Optional)"
                  : "Password"
              }

              value={form.password}

              onChange={handleChange}

              required={!editingId}

            />

          </div>

          <div className="teacher-buttons">

            <button

              type="submit"

              className="save-btn"

              disabled={submitting}

            >

              {submitting ? (

                "Processing..."

              ) : editingId ? (

                <>
                  <FaEdit />
                  Update Teacher
                </>

              ) : (

                <>
                  <FaPlus />
                  Create Teacher
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

                Cancel

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
          LOADER
      ====================================================== */}

      {loading ? (

        <Loader />

      ) : filteredTeachers.length === 0 ? (

        <div className="empty-state">

          <FaChalkboardTeacher />

          <h3>No Teachers Found</h3>

          <p>

            No teacher matches your search.

          </p>

        </div>

      ) : (
        <div className="table-wrapper">

          <table className="teacher-table">

            <thead>

              <tr>

                <th>Teacher</th>

                <th>Email</th>

                <th>Status</th>

                <th>Verified</th>

                <th>Permissions</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredTeachers.map((teacher) => (

                <tr key={teacher.id}>

                  {/* =======================================
                      TEACHER
                  ======================================= */}

                  <td>

                    <div className="teacher-info">

                      <div className="teacher-avatar">

                        {getInitials(
                          teacher.full_name
                        )}

                      </div>

                      <div>

                        <strong>

                          {teacher.full_name}

                        </strong>

                        <small>

                          ID #{teacher.id}

                        </small>

                      </div>

                    </div>

                  </td>

                  {/* =======================================
                      EMAIL
                  ======================================= */}

                  <td>

                    {teacher.email}

                  </td>

                  {/* =======================================
                      STATUS
                  ======================================= */}

                  <td>

                    <span
                      className={`status-badge ${getStatusClass(
                        teacher
                      )}`}
                    >

                      {getStatus(
                        teacher
                      )}

                    </span>

                  </td>

                  {/* =======================================
                      VERIFIED
                  ======================================= */}

                  <td>

                    {teacher.is_verified ? (

                      <span className="verified">

                        ✔ Verified

                      </span>

                    ) : (

                      <span className="not-verified">

                        ✖ No

                      </span>

                    )}

                  </td>

                  {/* =======================================
                      PERMISSIONS
                  ======================================= */}

                  <td>

                    {Array.isArray(
                      teacher.permissions
                    ) &&
                    teacher.permissions.length > 0 ? (

                      <div className="permission-list">

                        {teacher.permissions.map(
                          (permission, index) => (

                            <span
                              key={index}
                              className="permission-badge"
                            >

                              {permission}

                            </span>

                          )
                        )}

                      </div>

                    ) : (

                      <span className="no-permission">

                        N/A

                      </span>

                    )}

                  </td>

                  {/* =======================================
                      ACTIONS
                  ======================================= */}

                  <td>

                    <div className="action-buttons">

                      <button

                        className="edit-btn"

                        onClick={() =>
                          handleEdit(
                            teacher
                          )
                        }

                      >

                        <FaEdit />

                        Edit

                      </button>

                      <button

                        className="delete-btn"

                        onClick={() =>
                          handleDelete(
                            teacher.id
                          )
                        }

                      >

                        <FaTrash />

                        Delete

                      </button>

                      <button

                        className="course-btn"

                        onClick={() =>
                          handleViewCourses(
                            teacher.id
                          )
                        }

                      >

                        <FaBookOpen />

                        Courses

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

export default Teachers;