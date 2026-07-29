import React, { useEffect, useState } from "react";

import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../../services/studentService";

import { getCourses } from "../../../services/courseService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

const Students = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    course_id: "",
  });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [studentsData, coursesData] =
        await Promise.all([
          getAllStudents(),
          getCourses(),
        ]);

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : []
      );

      setCourses(
        Array.isArray(coursesData)
          ? coursesData
          : []
      );
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error.message ||
          "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      password: "",
      course_id: "",
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

      if (!form.full_name.trim()) {
        throw new Error(
          "Full name is required"
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "Email is required"
        );
      }

      if (!form.course_id) {
        throw new Error(
          "Please select a course"
        );
      }

      // ==========================================
      // CREATE
      // ==========================================

      if (!editingId) {
        await createStudent({
          full_name:
            form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
          course_id: Number(
            form.course_id
          ),
        });

        alert(
          "Student created successfully"
        );
      }

      // ==========================================
      // UPDATE
      // Backend expects:
      // {
      //   user: {...},
      //   profile: {...}
      // }
      // ==========================================

      else {
        await updateStudent(
          editingId,
          {
            user: {
              full_name:
                form.full_name.trim(),

              email:
                form.email.trim(),

              ...(form.password && {
                password:
                  form.password,
              }),
            },

            profile: {
              course_id: Number(
                form.course_id
              ),
            },
          }
        );

        alert(
          "Student updated successfully"
        );
      }

      resetForm();

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error.message ||
          "Failed to save student"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (student) => {
    setEditingId(student.id);

    setForm({
      full_name:
        student.full_name || "",
      email: student.email || "",
      password: "",
      course_id: String(
        student.course_id || ""
      ),
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
    studentId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this student?"
      );

    if (!confirmed) return;

    try {
      await deleteStudent(studentId);

      setStudents((prev) =>
        prev.filter(
          (student) =>
            student.id !== studentId
        )
      );

      alert(
        "Student deleted successfully"
      );
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error.message ||
          "Failed to delete student"
      );
    }
  };

  // ======================================================
  // CANCEL EDIT
  // ======================================================

  const handleCancelEdit = () => {
    resetForm();
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <h2>Students</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Manage student profiles
          and academic records.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

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

        <select
          name="course_id"
          value={form.course_id}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Course
          </option>

          {courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
            >
              {course.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Student"
            : "Create Student"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={
              handleCancelEdit
            }
          >
            Cancel
          </button>
        )}
      </form>

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Total Score</th>
              <th>Average</th>
              <th>GPA</th>
              <th>Position</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map(
              (student) => (
                <tr
                  key={student.id}
                >
                  <td>
                    {student.id}
                  </td>

                  <td>
                    {
                      student.full_name
                    }
                  </td>

                  <td>
                    {student.email}
                  </td>

                  <td>
                    {student.course_name ||
                      "N/A"}
                  </td>

                  <td>
                    {student.total_score ??
                      0}
                  </td>

                  <td>
                    {student.average_score ??
                      0}
                  </td>

                  <td>
                    {student.gpa ??
                      0}
                  </td>

                  <td>
                    {student.position ??
                      "-"}
                  </td>

                  <td>
                    {student.remarks ||
                      "-"}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleEdit(
                          student
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          student.id
                        )
                      }
                    >
                      Delete
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

const formStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default Students;