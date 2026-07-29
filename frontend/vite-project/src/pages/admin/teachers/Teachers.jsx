import React, {
  useEffect,
  useState,
} from "react";

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

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

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
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setSubmitting(true);
        setErrorMsg("");

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
            "Teacher updated successfully"
          );
        }

        // ==========================================
        // CREATE
        // ==========================================
        else {
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
            "Teacher created successfully"
          );
        }

        resetForm();

        await fetchTeachers();
      } catch (error) {
        console.error(error);

        setErrorMsg(
          error.message ||
            "Failed to save teacher"
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit = (
    teacher
  ) => {
    setEditingId(
      teacher.id
    );

    setForm({
      full_name:
        teacher.full_name ||
        "",

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
  const handleDelete =
    async (teacherId) => {
      if (
        !window.confirm(
          "Delete this teacher?"
        )
      ) {
        return;
      }

      try {
        setErrorMsg("");

        await deleteTeacher(
          teacherId
        );

        setTeachers(
          (prev) =>
            prev.filter(
              (teacher) =>
                teacher.id !==
                teacherId
            )
        );

        alert(
          "Teacher deleted successfully"
        );
      } catch (error) {
        console.error(error);

        setErrorMsg(
          error.message ||
            "Failed to delete teacher"
        );
      }
    };

  // ======================================================
  // COURSES
  // ======================================================
  const handleViewCourses =
    (teacherId) => {
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
    if (
      !teacher.is_verified
    ) {
      return "Unverified";
    }

    if (
      !teacher.is_active
    ) {
      return "Inactive";
    }

    return "Active";
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          marginBottom:
            "25px",
        }}
      >
        <h2>Teachers</h2>

        <p
          style={{
            color:
              "#6b7280",
          }}
        >
          Manage teacher
          accounts and
          assigned courses.
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={
          handleSubmit
        }
        style={formStyle}
      >
        <input
          name="full_name"
          placeholder="Full Name"
          value={
            form.full_name
          }
          onChange={
            handleChange
          }
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={
            handleChange
          }
          required
        />

        <input
          name="password"
          type="password"
          placeholder={
            editingId
              ? "New Password (optional)"
              : "Password"
          }
          value={
            form.password
          }
          onChange={
            handleChange
          }
          required={
            !editingId
          }
        />

        <button
          type="submit"
          disabled={
            submitting
          }
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Teacher"
            : "Create Teacher"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={
              resetForm
            }
          >
            Cancel
          </button>
        )}
      </form>

      {/* ERROR */}
      {errorMsg && (
        <ErrorMessage
          message={
            errorMsg
          }
        />
      )}

      {/* TABLE */}
      {loading ? (
        <Loader />
      ) : teachers.length ===
        0 ? (
        <p>
          No teachers found
        </p>
      ) : (
        <table
          style={tableStyle}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>
                Permissions
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {teachers.map(
              (teacher) => (
                <tr
                  key={
                    teacher.id
                  }
                >
                  <td>
                    {teacher.id}
                  </td>

                  <td>
                    {
                      teacher.full_name
                    }
                  </td>

                  <td>
                    {
                      teacher.email
                    }
                  </td>

                  <td>
                    {
                      teacher.role
                    }
                  </td>

                  <td>
                    {getStatus(
                      teacher
                    )}
                  </td>

                  <td>
                    {teacher.is_verified
                      ? "Yes"
                      : "No"}
                  </td>

                  <td>
                    {Array.isArray(
                      teacher.permissions
                    ) &&
                    teacher
                      .permissions
                      .length >
                      0
                      ? teacher.permissions.join(
                          ", "
                        )
                      : "N/A"}
                  </td>

                  <td
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          teacher
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          teacher.id
                        )
                      }
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewCourses(
                          teacher.id
                        )
                      }
                    >
                      Courses
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const formStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
};

export default Teachers;