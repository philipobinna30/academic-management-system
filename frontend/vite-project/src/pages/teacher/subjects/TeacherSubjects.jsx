import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./TeacherSubjects.css";

import {
  useAuth,
} from "../../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherCourses,
} from "../../../services/teacherService";

import {
  getSubjects,
} from "../../../services/subjectService";

// ======================================================
// COMPONENTS
// ======================================================

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

/**
 * ======================================================
 * Teacher Subjects
 *
 * Backend Compatible
 *
 * GET /teachers/{teacher_id}/courses
 * GET /subjects
 * ======================================================
 */

const TeacherSubjects = () => {

  const { user } = useAuth();

  // ======================================================
  // CURRENT TEACHER
  // ======================================================

  const teacherId =
    user?.user_id ||
    user?.id;

  // ======================================================
  // STATE
  // ======================================================

  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ======================================================
  // LOAD SUBJECTS
  // ======================================================

  const loadSubjects =
    async () => {

      if (!teacherId) return;

      try {

        setLoading(true);
        setErrorMsg("");

        // ================================================
        // TEACHER COURSES
        // ================================================

        const teacherCourses =
          await getTeacherCourses(
            teacherId
          );

        const courseIds =
          Array.isArray(
            teacherCourses
          )
            ? teacherCourses
                .map(
                  (course) =>
                    course.id
                )
                .filter(Boolean)
            : [];

        // ================================================
        // ALL SUBJECTS
        // ================================================

        const allSubjects =
          await getSubjects();

        const filteredSubjects =
          Array.isArray(
            allSubjects
          )
            ? allSubjects.filter(
                (subject) =>
                  courseIds.includes(
                    subject.course_id
                  )
              )
            : [];

        setSubjects(
          filteredSubjects
        );

      } catch (error) {

        console.error(error);

        setErrorMsg(
          error?.message ||
            "Failed to load teacher subjects."
        );

        setSubjects([]);

      } finally {

        setLoading(false);

      }

    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    loadSubjects();

  }, [teacherId]);

  // ======================================================
  // FILTER SUBJECTS
  // ======================================================

  const filteredSubjects =
    useMemo(() => {

      const keyword =
        search.toLowerCase();

      return subjects.filter(
        (subject) =>

          String(subject.id)
            .includes(keyword)

          ||

          (subject.name || "")
            .toLowerCase()
            .includes(keyword)

          ||

          String(
            subject.course_id
          ).includes(keyword)

      );

    }, [subjects, search]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const totalSubjects =
    subjects.length;

  const totalCourses =
    new Set(
      subjects.map(
        (subject) =>
          subject.course_id
      )
    ).size;

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

    <div className="teacher-subjects-page">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="teacher-subjects-header">

        <div>

          <h1>
            My Subjects
          </h1>

          <p>
            View all subjects assigned to your courses.
          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

      <div className="subject-summary">

        <div className="summary-card">

          <h3>
            Total Subjects
          </h3>

          <span>
            {totalSubjects}
          </span>

        </div>

        <div className="summary-card">

          <h3>
            Assigned Courses
          </h3>

          <span>
            {totalCourses}
          </span>

        </div>

      </div>

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <div className="subject-toolbar">

        <input
          type="text"
          placeholder="Search subject..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {errorMsg && (

        <ErrorMessage
          message={errorMsg}
        />

      )}

      {/* ====================================================== */}
      {/* EMPTY */}
      {/* ====================================================== */}

      {!loading &&
        !errorMsg &&
        filteredSubjects.length === 0 && (

          <div className="empty-state">

            <h3>
              No Subjects Found
            </h3>

            <p>
              No subjects have been assigned
              to your courses.
            </p>

          </div>

        )}

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      {!loading &&
        filteredSubjects.length > 0 && (

          <div className="table-wrapper">

            <table className="subjects-table">

              <thead>

                <tr>

                  <th>S/N</th>

                  <th>Subject ID</th>

                  <th>Subject Name</th>

                  <th>Course ID</th>

                </tr>

              </thead>

              <tbody>

                {filteredSubjects.map(
                  (
                    subject,
                    index
                  ) => (

                    <tr
                      key={subject.id}
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {subject.id}
                      </td>

                      <td>
                        {subject.name}
                      </td>

                      <td>
                        {subject.course_id}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

    </div>

  );

};

export default TeacherSubjects;