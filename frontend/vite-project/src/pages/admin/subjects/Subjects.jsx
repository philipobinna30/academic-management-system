import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../services/subjectService";

import { getCourses } from "../../../services/courseService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

const Subjects = () => {
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

  const [form, setForm] =
    useState({
      name: "",
      course_id: "",
    });

  const [editingId, setEditingId] =
    useState(null);

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

  const courseMap = useMemo(
    () =>
      Object.fromEntries(
        courses.map((course) => [
          course.id,
          course.name,
        ])
      ),
    [courses]
  );

  const getCourseName = (
    courseId
  ) =>
    courseMap[courseId] || "N/A";

  // ======================================================
  // INPUT
  // ======================================================

  const handleChange = (e) => {
    const { name, value } =
      e.target;

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
      course_id: "",
    });

    setEditingId(null);
    setErrorMsg("");
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        name: form.name.trim(),
        course_id: Number(
          form.course_id
        ),
      };

      if (!payload.name) {
        throw new Error(
          "Subject name is required"
        );
      }

      if (!payload.course_id) {
        throw new Error(
          "Please select a course"
        );
      }

      if (editingId) {
        await updateSubject(
          editingId,
          payload
        );

        alert(
          "Subject updated successfully"
        );
      } else {
        await createSubject(
          payload
        );

        alert(
          "Subject created successfully"
        );
      }

      resetForm();

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to save subject"
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
        subject?.course_id || ""
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
        "Subject deleted successfully"
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error?.message ||
          "Failed to delete subject"
      );
    }
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
        <h2>Subjects</h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Manage subjects and
          assign them to courses.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >
        <input
          type="text"
          name="name"
          placeholder="Subject Name"
          value={form.name}
          onChange={
            handleChange
          }
          required
        />

        <select
          name="course_id"
          value={
            form.course_id
          }
          onChange={
            handleChange
          }
          required
        >
          <option value="">
            Select Course
          </option>

          {courses.map(
            (course) => (
              <option
                key={
                  course.id
                }
                value={
                  course.id
                }
              >
                {course.name}
              </option>
            )
          )}
        </select>

        <button
          type="submit"
          disabled={
            submitting
          }
        >
          {submitting
            ? "Processing..."
            : editingId
            ? "Update Subject"
            : "Create Subject"}
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

      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
        />
      )}

      {loading ? (
        <Loader />
      ) : subjects.length ===
        0 ? (
        <p>
          No subjects found
        </p>
      ) : (
        <table
          style={tableStyle}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>
                Subject Name
              </th>
              <th>Course</th>
              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {subjects.map(
              (subject) => (
                <tr
                  key={
                    subject.id
                  }
                >
                  <td>
                    {
                      subject.id
                    }
                  </td>

                  <td>
                    {
                      subject.name
                    }
                  </td>

                  <td>
                    {getCourseName(
                      subject.course_id
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleEdit(
                          subject
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          subject.id
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
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default Subjects;