import React, {
  useEffect,
  useMemo,
  useState,
} from "react";


import "./Courses.css";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../../services/courseService";

import { getTeachers } from "../../../services/teacherService";

import CoursesTable from "../../../components/tables/CoursesTable";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaBook,
  FaSearch,
  FaPlus,
  FaTimes,
  FaEdit,
  FaClipboardList,
  FaUserTie,
  FaLayerGroup,
} from "react-icons/fa";

/**
 * ======================================================
 * COURSES PAGE
 * Backend Compatible
 * UI Upgraded
 * ======================================================
 */

const Courses = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [courses, setCourses] =
    useState([]);

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
    name: "",
    description: "",
    teacher_id: "",
  });

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const totalCourses =
    courses.length;

  const assignedCourses =
    courses.filter(
      (course) => course.teacher_id
    ).length;

  const unassignedCourses =
    totalCourses -
    assignedCourses;

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  // ======================================================
// SEARCH FILTER
// ======================================================

const filteredCourses =
  useMemo(() => {

    if (!search.trim()) {
      return courses;
    }

    const keyword =
      search.toLowerCase();

    return courses.filter((course) => {

      const teacherName =
        getTeacherName(course.teacher_id)
          .toLowerCase();

      return (

        course.name
          ?.toLowerCase()
          .includes(keyword)

        ||

        course.description
          ?.toLowerCase()
          .includes(keyword)

        ||

        teacherName.includes(keyword)

      );

    });

  }, [courses, search, teachers]);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const [

        coursesData,

        teachersData,

      ] = await Promise.all([

        getCourses(),

        getTeachers(),

      ]);

      setCourses(

        Array.isArray(coursesData)

          ? coursesData

          : []

      );

      setTeachers(

        Array.isArray(teachersData)

          ? teachersData.filter(

              (user) =>

                user.role ===
                "teacher"

            )

          : []

      );

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        "Failed to load courses"

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INIT
  // ======================================================

  useEffect(() => {

    fetchData();

  }, []);

  // ======================================================
  // CHANGE
  // ======================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

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

      name: "",

      description: "",

      teacher_id: "",

    });

    setEditingId(null);

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

      // ----------------------------
      // VALIDATION
      // ----------------------------

      if (!form.name.trim()) {

        throw new Error(
          "Course name is required."
        );

      }

      const payload = {

        name: form.name.trim(),

        description:
          form.description.trim() || null,

        teacher_id: form.teacher_id

          ? Number(form.teacher_id)

          : null,

      };

      // ==========================
      // UPDATE
      // ==========================

      if (editingId) {

        await updateCourse(

          editingId,

          payload

        );

        alert(
          "Course updated successfully."
        );

      }

      // ==========================
      // CREATE
      // ==========================

      else {

        await createCourse(
          payload
        );

        alert(
          "Course created successfully."
        );

      }

      resetForm();

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        "Failed to save course."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (course) => {

    setForm({

      name:
        course?.name || "",

      description:
        course?.description || "",

      teacher_id:
        course?.teacher_id

          ? String(course.teacher_id)

          : "",

    });

    setEditingId(course.id);

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Delete this course?"
      );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await deleteCourse(id);

      alert(
        "Course deleted successfully."
      );

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

        "Failed to delete course."

      );

    }

  };

  // ======================================================
  // ASSIGNED TEACHER NAME
  // ======================================================

  const getTeacherName = (teacherId) => {

    const teacher = teachers.find(

      (item) =>
        item.id === teacherId

    );

    return teacher

      ? teacher.full_name

      : "Not Assigned";

  };

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="courses-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="courses-header">

        <div>

          <h1>

            Course Management

          </h1>

          <p>

            Create, organize and assign
            academic courses to teachers.

          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD STATISTICS
      ====================================================== */}

      <div className="course-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaBook />

          </div>

          <div>

            <h2>

              {totalCourses}

            </h2>

            <span>

              Total Courses

            </span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaUserTie />

          </div>

          <div>

            <h2>

              {assignedCourses}

            </h2>

            <span>

              Assigned

            </span>

          </div>

        </div>

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaLayerGroup />

          </div>

          <div>

            <h2>

              {unassignedCourses}

            </h2>

            <span>

              Unassigned

            </span>

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

            placeholder="Search courses..."

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

      <div className="course-form-card">

        <h2>

          {editingId

            ? "Update Course"

            : "Create New Course"}

        </h2>

        <form

          onSubmit={handleSubmit}

          className="course-form"

        >

          <div className="form-group">

            <FaBook className="form-icon" />

            <input

              name="name"

              placeholder="Course Name"

              value={form.name}

              onChange={handleChange}

              required

            />

          </div>

          <div className="form-group">

            <FaClipboardList className="form-icon" />

            <input

              name="description"

              placeholder="Course Description"

              value={form.description}

              onChange={handleChange}

            />

          </div>

          <div className="form-group">

            <FaUserTie className="form-icon" />

            <select

              name="teacher_id"

              value={form.teacher_id}

              onChange={handleChange}

            >

              <option value="">

                Select Teacher

              </option>

              {teachers.map((teacher) => (

                <option

                  key={teacher.id}

                  value={teacher.id}

                >

                  {teacher.full_name}

                </option>

              ))}

            </select>

          </div>

          <div className="course-buttons">

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

                  Update Course

                </>

              ) : (

                <>

                  <FaPlus />

                  Create Course

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
          CONTENT
      ====================================================== */}

      {loading ? (

        <Loader />

      ) : filteredCourses.length === 0 ? (

        <div className="empty-state">

          <FaBook />

          <h3>

            No Courses Found

          </h3>

          <p>

            There are no courses available,
            or your search returned no results.

          </p>

        </div>

      ) : (

        <div className="course-table-card">

          <CoursesTable

            courses={filteredCourses}

            teachers={teachers}

            onEdit={handleEdit}

            onDelete={handleDelete}

            getTeacherName={getTeacherName}

          />

        </div>

      )}

    </div>

  );

};

export default Courses;