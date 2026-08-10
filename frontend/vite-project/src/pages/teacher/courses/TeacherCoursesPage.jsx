import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./TeacherCourses.css";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherCourses,
} from "../../../services/teacherService";

// ======================================================
// CONTEXT
// ======================================================

import {
  useAuth,
} from "../../../context/AuthContext";

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
  FaBookOpen,
  FaSearch,
  FaClipboardList,
  FaLayerGroup,
} from "react-icons/fa";

/**
 * ======================================================
 * TEACHER COURSES
 * Professional Dashboard Version
 * ======================================================
 */

const TeacherCoursesPage = () => {

  const { user } = useAuth();

  // ======================================================
  // STATE
  // ======================================================

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ======================================================
  // FETCH COURSES
  // ======================================================

  const fetchCourses = async () => {

    if (!user?.user_id) return;

    try {

      setLoading(true);

      setErrorMsg("");

      console.log(
        "Loading teacher courses:",
        user.user_id
      );

      const data =
        await getTeacherCourses(
          user.user_id
        );

      console.log(
        "Teacher Courses:",
        data
      );

      setCourses(

        Array.isArray(data)
          ? data
          : []

      );

    } catch (error) {

      console.error(error);

      setCourses([]);

      setErrorMsg(

        error?.response?.data?.detail ||

        error?.message ||

        "Failed to load assigned courses."

      );

    } finally {

      setLoading(false);

    }

  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    fetchCourses();

  }, [user?.user_id]);

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

      return courses.filter(

        (course) =>

          course.name
            ?.toLowerCase()
            .includes(keyword)

          ||

          course.description
            ?.toLowerCase()
            .includes(keyword)

      );

    }, [courses, search]);

  // ======================================================
  // DASHBOARD STATS
  // ======================================================

  const totalCourses =
    courses.length;

  const totalSubjects =
    courses.reduce(

      (total, course) =>

        total +

        (
          Array.isArray(course.subjects)
            ? course.subjects.length
            : 0
        ),

      0

    );

  const coursesWithDescription =
    courses.filter(

      (course) =>

        course.description &&
        course.description.trim() !== ""

    ).length;


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return <Loader />;

  }

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="teacher-courses-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="teacher-courses-header">

        <div>

          <h1>

            My Courses

          </h1>

          <p>

            View all courses currently assigned to you.

          </p>

        </div>

      </div>

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <div className="teacher-course-stats">

        {/* TOTAL COURSES */}

        <div className="stat-card blue">

          <div className="stat-icon">

            <FaBookOpen />

          </div>

          <div>

            <h2>

              {totalCourses}

            </h2>

            <span>

              Assigned Courses

            </span>

          </div>

        </div>

        {/* TOTAL SUBJECTS */}

        <div className="stat-card green">

          <div className="stat-icon">

            <FaLayerGroup />

          </div>

          <div>

            <h2>

              {totalSubjects}

            </h2>

            <span>

              Total Subjects

            </span>

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="stat-card orange">

          <div className="stat-icon">

            <FaClipboardList />

          </div>

          <div>

            <h2>

              {coursesWithDescription}

            </h2>

            <span>

              Described Courses

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
              setSearch(e.target.value)
            }
          />

        </div>

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

      {filteredCourses.length === 0 ? (

        <div className="empty-state">

          <FaBookOpen />

          <h3>

            No Courses Found

          </h3>

          <p>

            You don't have any assigned courses yet,
            or no course matches your search.

          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="teacher-courses-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Course</th>

                <th>Description</th>

                <th>Subjects</th>

              </tr>

            </thead>

            <tbody>

              {filteredCourses.map((course) => (

                <tr key={course.id}>

                  {/* ID */}

                  <td>

                    {course.id}

                  </td>

                  {/* COURSE */}

                  <td>

                    <div className="course-cell">

                      <div className="course-avatar">

                        {course.name
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}

                      </div>

                      <div className="course-info">

                        <strong>

                          {course.name || "N/A"}

                        </strong>

                      </div>

                    </div>

                  </td>

                  {/* DESCRIPTION */}

                  <td>

                    {course.description ||
                      "No description"}

                  </td>

                  {/* SUBJECT COUNT */}

                  <td>

                    <span className="subject-badge">

                      <FaBook />

                      {

                        Array.isArray(course.subjects)

                          ? course.subjects.length

                          : 0

                      }

                    </span>

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

export default TeacherCoursesPage;