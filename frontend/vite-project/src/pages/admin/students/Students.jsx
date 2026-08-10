import React, { useEffect, useMemo, useState } from "react";
import "./Students.css";

import {
  FaUserGraduate,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUsers,
  FaBookOpen,
  FaEnvelope,
  FaLock,
  FaGraduationCap,
} from "react-icons/fa";

// ======================================================
// SERVICES
// ======================================================

import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../../services/studentService";

import {
  getCourses,
} from "../../../services/courseService";

// ======================================================
// COMMON COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// COMPONENT
// ======================================================

const Students = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [students, setStudents] = useState([]);

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  // Professional Search Box

  const [search, setSearch] =
    useState("");

  // ======================================================
  // FORM
  // ======================================================

  const [form, setForm] = useState({

    full_name: "",

    email: "",

    password: "",

    course_id: "",

  });

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const statistics = useMemo(() => {

    return {

      totalStudents:
        students.length,

      totalCourses:
        courses.length,

      activeStudents:
        students.filter(
          (student) =>
            student.is_active !== false
        ).length,

    };

  }, [students, courses]);

  // ======================================================
  // FILTERED STUDENTS
  // ======================================================

  const filteredStudents =
    useMemo(() => {

      return students.filter(
        (student) => {

          const keyword =
            search.toLowerCase();

          return (

            student.full_name
              ?.toLowerCase()
              .includes(keyword)

            ||

            student.email
              ?.toLowerCase()
              .includes(keyword)

            ||

            student.course_name
              ?.toLowerCase()
              .includes(keyword)

          );

        }

      );

    }, [students, search]);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const [

        studentsData,

        coursesData,

      ] = await Promise.all([

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

    }

    catch (error) {

      console.error(error);

      setErrorMsg(

        error.message ||

        "Failed to load students."

      );

    }

    finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

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

      // ==========================================
      // VALIDATION
      // ==========================================

      if (!form.full_name.trim()) {

        throw new Error(
          "Full name is required."
        );

      }

      if (!form.email.trim()) {

        throw new Error(
          "Email is required."
        );

      }

      if (!form.course_id) {

        throw new Error(
          "Please select a course."
        );

      }

      // ==========================================
      // CREATE
      // ==========================================

      if (!editingId) {

        await createStudent({

          full_name:
            form.full_name.trim(),

          email:
            form.email.trim(),

          password:
            form.password,

          course_id:
            Number(form.course_id),

        });

        alert(
          "Student created successfully."
        );

      }

      // ==========================================
      // UPDATE
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

              course_id:
                Number(form.course_id),

            },

          }

        );

        alert(
          "Student updated successfully."
        );

      }

      // ==========================================
      // REFRESH
      // ==========================================

      resetForm();

      await fetchData();

    }

    catch (error) {

      console.error(error);

      setErrorMsg(

        error.message ||

        "Failed to save student."

      );

    }

    finally {

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

      email:
        student.email || "",

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

    const confirmed = window.confirm(
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
        "Student deleted successfully."
      );

    }

    catch (error) {

      console.error(error);

      setErrorMsg(

        error.message ||

        "Failed to delete student."

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

    <div className="students-page">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="students-header">

        <div>

          <h1>

            <FaUserGraduate />

            Student Management

          </h1>

          <p>

            Create, edit, update and manage
            all student academic records.

          </p>

        </div>

      </div>

      {/* ==========================================
          STATISTICS
      ========================================== */}

      <div className="student-statistics">

        <div className="stat-card">

          <FaUsers className="stat-icon" />

          <div>

            <h3>
              Total Students
            </h3>

            <h2>
              {statistics.totalStudents}
            </h2>

          </div>

        </div>

        <div className="stat-card">

          <FaGraduationCap className="stat-icon" />

          <div>

            <h3>
              Active Students
            </h3>

            <h2>
              {statistics.activeStudents}
            </h2>

          </div>

        </div>

        <div className="stat-card">

          <FaBookOpen className="stat-icon" />

          <div>

            <h3>
              Courses
            </h3>

            <h2>
              {statistics.totalCourses}
            </h2>

          </div>

        </div>

      </div>

      {/* ==========================================
          SEARCH BAR
      ========================================== */}

      <div className="students-toolbar">

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input

            type="text"

            placeholder="Search student by name, email or course..."

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

          />

        </div>

      </div>

      {errorMsg && (

        <ErrorMessage
          message={errorMsg}
        />

      )}

      {/* ==========================================
          STUDENT FORM
      ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="student-form"
      >

        <div className="form-group">

          <FaUserGraduate className="form-icon" />

          <input

            type="text"

            name="full_name"

            placeholder="Full Name"

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

            placeholder="Email Address"

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

        <div className="form-buttons">

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
                Update Student
              </>

            ) : (

              <>
                <FaPlus />
                Create Student
              </>

            )}

          </button>

          {editingId && (

            <button

              type="button"

              className="cancel-btn"

              onClick={
                handleCancelEdit
              }

            >

              <FaTimes />

              Cancel

            </button>

          )}

        </div>

      </form>

      {/* ======================================================
          STUDENTS TABLE
      ====================================================== */}

      {loading ? (

        <Loader />

      ) : filteredStudents.length === 0 ? (

        <div className="empty-state">

          <FaUserGraduate className="empty-icon" />

          <h2>No Students Found</h2>

          <p>

            No student matches your search,
            or no students have been created yet.

          </p>

        </div>

      ) : (

        <div className="table-container">

          <table className="students-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Student</th>

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

              {filteredStudents.map((student) => (

                <tr key={student.id}>

                  <td>{student.id}</td>

                  <td>

                    <div className="student-info">

                      <div className="student-avatar">

                        {student.full_name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>

                      <span>

                        {student.full_name}

                      </span>

                    </div>

                  </td>

                  <td>

                    {student.email}

                  </td>

                  <td>

                    {student.course_name || "N/A"}

                  </td>

                  <td>

                    {student.total_score ?? 0}

                  </td>

                  <td>

                    {student.average_score ?? 0}

                  </td>

                  <td>

                    <span className="gpa-badge">

                      {student.gpa ?? 0}

                    </span>

                  </td>

                  <td>

                    {student.position ?? "-"}

                  </td>

                  <td>

                    <span className="remark-badge">

                      {student.remarks || "-"}

                    </span>

                  </td>

                  <td>

                    <div className="action-buttons">

                      <button

                        className="edit-btn"

                        onClick={() =>
                          handleEdit(student)
                        }

                      >

                        <FaEdit />

                        Edit

                      </button>

                      <button

                        className="delete-btn"

                        onClick={() =>
                          handleDelete(student.id)
                        }

                      >

                        <FaTrash />

                        Delete

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* ======================================================
          PAGE FOOTER
      ====================================================== */}

      <div className="students-footer">

        <p>

          Showing

          <strong>

            {" "}
            {filteredStudents.length}
            {" "}

          </strong>

          student(s).

        </p>

      </div>

    </div>

  );

};

export default Students;