import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import "./Subjects.css";

// ======================================================
// SERVICES
// ======================================================

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../services/subjectService";

import {
  getCourses,
} from "../../../services/courseService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

// ======================================================
// ICONS
// ======================================================

import {
  FaBook,
  FaSearch,
  FaLayerGroup,
  FaGraduationCap,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

const Subjects = () => {

  // ======================================================
  // STATE
  // ======================================================

  const [subjects, setSubjects] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState({

      name: "",

      course_id: "",

    });

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const totalSubjects =
    subjects.length;

  const totalCourses =
    courses.length;

  const assignedSubjects =
    subjects.filter(
      (subject) => subject.course_id
    ).length;

  // ======================================================
  // SEARCH FILTER
  // ======================================================

  const filteredSubjects =
    useMemo(() => {

      if (!search.trim()) {

        return subjects;

      }

      const keyword =
        search.toLowerCase();

      return subjects.filter(
        (subject) =>

          subject.name
            ?.toLowerCase()
            .includes(keyword) ||

          getCourseName(
            subject.course_id
          )
            .toLowerCase()
            .includes(keyword)

      );

    }, [subjects, search]);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {

    try {

      setLoading(true);

      setErrorMsg("");

      const [

        subjectsData,

        coursesData,

      ] = await Promise.all([

        getSubjects(),

        getCourses(),

      ]);

      setSubjects(

        Array.isArray(subjectsData)

          ? subjectsData

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

        error?.message ||

          "Failed to load subjects"

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, []);

  // ======================================================
  // COURSE LOOKUP
  // ======================================================

  const courseMap =
    useMemo(

      () =>

        Object.fromEntries(

          courses.map(

            (course) => [

              course.id,

              course.name,

            ]

          )

        ),

      [courses]

    );

  const getCourseName = (
    courseId
  ) =>

    courseMap[courseId] ||

    "N/A";

  // ======================================================
  // INPUT CHANGE
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

    setForm({

      name: "",

      course_id: "",

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

      if (!form.name.trim()) {

        throw new Error(
          "Subject name is required."
        );

      }

      if (!form.course_id) {

        throw new Error(
          "Please select a course."
        );

      }

      const payload = {

        name:
          form.name.trim(),

        course_id:
          Number(form.course_id),

      };

      // ==========================================
      // UPDATE
      // ==========================================

      if (editingId) {

        await updateSubject(

          editingId,

          payload

        );

        alert(
          "Subject updated successfully."
        );

      }

      // ==========================================
      // CREATE
      // ==========================================

      else {

        await createSubject(
          payload
        );

        alert(
          "Subject created successfully."
        );

      }

      resetForm();

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

          "Failed to save subject."

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (
    subject
  ) => {

    setForm({

      name:
        subject?.name || "",

      course_id: String(

        subject?.course_id ||

        ""

      ),

    });

    setEditingId(subject.id);

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Delete this subject?"
      );

    if (!confirmed) return;

    try {

      setErrorMsg("");

      await deleteSubject(id);

      alert(
        "Subject deleted successfully."
      );

      await fetchData();

    } catch (error) {

      console.error(error);

      setErrorMsg(

        error?.message ||

          "Failed to delete subject."

      );

    }

  };

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="subjects-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="subjects-header">

        <div>

          <h1>
            Subject Management
          </h1>

          <p>

            Manage academic subjects and assign them
            to their respective courses.

          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD STATISTICS
      ====================================================== */}

      <div className="subject-stats">

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaBook />

          </div>

          <div>

            <h2>{totalSubjects}</h2>

            <span>Total Subjects</span>

          </div>

        </div>

        <div className="stat-card green">

          <div className="stat-icon">

            <FaLayerGroup />

          </div>

          <div>

            <h2>{assignedSubjects}</h2>

            <span>Assigned Subjects</span>

          </div>

        </div>

        <div className="stat-card purple">

          <div className="stat-icon">

            <FaGraduationCap />

          </div>

          <div>

            <h2>{totalCourses}</h2>

            <span>Total Courses</span>

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

            placeholder="Search subject or course..."

            value={search}

            onChange={(e)=>
              setSearch(e.target.value)
            }

          />

        </div>

      </div>

      {/* ======================================================
          FORM CARD
      ====================================================== */}

      <div className="subject-form-card">

        <h2>

          {editingId

            ? "Update Subject"

            : "Create New Subject"}

        </h2>

        <form

          onSubmit={handleSubmit}

          className="subject-form"

        >

          <div className="form-group">

            <FaBook className="form-icon" />

            <input

              type="text"

              name="name"

              placeholder="Subject Name"

              value={form.name}

              onChange={handleChange}

              required

            />

          </div>

          <div className="form-group">

            <FaGraduationCap className="form-icon" />

            <select

              name="course_id"

              value={form.course_id}

              onChange={handleChange}

              required

            >

              <option value="">

                Select Course

              </option>

              {courses.map((course)=>(

                <option

                  key={course.id}

                  value={course.id}

                >

                  {course.name}

                </option>

              ))}

            </select>

          </div>

          <div className="subject-buttons">

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

                  Update Subject

                </>

              ) : (

                <>

                  <FaPlus />

                  Create Subject

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

      ) : filteredSubjects.length === 0 ? (

        <div className="empty-state">

          <FaBook />

          <h3>No Subjects Found</h3>

          <p>
            No subject matches your search.
          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="subject-table">

            <thead>

              <tr>

                <th>Subject</th>

                <th>Course</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredSubjects.map((subject) => (

                <tr key={subject.id}>

                  {/* SUBJECT */}

                  <td>

                    <div className="subject-info">

                      <div className="subject-avatar">

                        <FaBook />

                      </div>

                      <div>

                        <strong>
                          {subject.name}
                        </strong>

                        <small>
                          ID #{subject.id}
                        </small>

                      </div>

                    </div>

                  </td>

                  {/* COURSE */}

                  <td>

                    <span className="course-badge">

                      {getCourseName(subject.course_id)}

                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="action-buttons">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(subject)}
                      >

                        <FaEdit />

                        Edit

                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(subject.id)}
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

    </div>

  );

};

export default Subjects;