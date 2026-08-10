import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import "./TeacherStudentProfile.css";

// ======================================================
// CONTEXT
// ======================================================

import { useAuth } from "../../../context/AuthContext";

// ======================================================
// SERVICES
// ======================================================

import {
  getTeacherStudentProfile,
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
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaBook,
  FaChartLine,
  FaAward,
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaIdCard,
} from "react-icons/fa";

// ======================================================
// COMPONENT
// ======================================================

const TeacherStudentProfile = () => {

  const { studentId } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  // ======================================================
  // STATE
  // ======================================================

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  useEffect(() => {

    if (
      user &&
      studentId
    ) {

      loadStudent();

    }

  }, [
    user,
    studentId,
  ]);

  // ======================================================
  // FETCH PROFILE
  // ======================================================

  const loadStudent =
    async () => {

      try {

        setLoading(true);
        setErrorMsg("");

        const teacherId =
          user?.user_id ||
          user?.id;

        if (!teacherId) {

          throw new Error(
            "Teacher ID not found."
          );

        }

        const data =
          await getTeacherStudentProfile(
            teacherId,
            studentId
          );

        setStudent(
          data || null
        );

      } catch (error) {

        console.error(error);

        setErrorMsg(
          error?.message ||
          "Failed to load student profile."
        );

        setStudent(null);

      } finally {

        setLoading(false);

      }

    };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return <Loader />;

  }

  // ======================================================
  // ERROR
  // ======================================================

  if (errorMsg) {

    return (

      <div className="teacher-student-page">

        <ErrorMessage
          message={errorMsg}
        />

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <FaArrowLeft />

          Back

        </button>

      </div>

    );

  }

  // ======================================================
  // EMPTY
  // ======================================================

  if (!student) {

    return (

      <div className="teacher-student-page">

        <div className="empty-card">

          <FaUserGraduate
            className="empty-icon"
          />

          <h2>
            Student Not Found
          </h2>

          <p>
            The requested student
            profile could not be found.
          </p>

          <button
            className="back-btn"
            onClick={() =>
              navigate(-1)
            }
          >

            <FaArrowLeft />

            Back

          </button>

        </div>

      </div>

    );

  }

  // ======================================================
  // OBJECTS
  // ======================================================

  const userInfo =
    student.user || {};

  const course =
    student.course || {};

  // ======================================================
  // HELPER
  // ======================================================

  const yesNoBadge = (
    value
  ) => (

    <span
      className={
        value
          ? "status-badge active"
          : "status-badge inactive"
      }
    >
      {value ? (
        <>
          <FaCheckCircle />
          Yes
        </>
      ) : (
        <>
          <FaTimesCircle />
          No
        </>
      )}
    </span>

  );

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="teacher-student-page">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="teacher-student-header">

        <div>

          <h1>Student Profile</h1>

          <p>
            View complete academic and account
            information for this student.
          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* PROFILE CARD */}
      {/* ====================================================== */}

      <div className="profile-card">

        <div className="profile-avatar">

          <FaUserGraduate />

        </div>

        <div className="profile-details">

          <h2>
            {student.full_name ||
              userInfo.full_name ||
              "N/A"}
          </h2>

          <p>

            <FaEnvelope />

            {student.email ||
              userInfo.email ||
              "N/A"}

          </p>

          <p>

            <FaBook />

            {student.course_name ||
              course.name ||
              "No Course"}

          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* INFORMATION GRID */}
      {/* ====================================================== */}

      <div className="profile-grid">

        <ProfileRow
          icon={<FaIdCard />}
          label="Profile ID"
          value={student.id || "N/A"}
        />

        <ProfileRow
          icon={<FaIdCard />}
          label="User ID"
          value={student.user_id || "N/A"}
        />

        <ProfileRow
          icon={<FaUserGraduate />}
          label="Role"
          value={
            userInfo.role ||
            student.role ||
            "Student"
          }
        />

        <ProfileRow
          icon={<FaBook />}
          label="Course"
          value={
            student.course_name ||
            course.name ||
            "N/A"
          }
        />

        <ProfileRow
          icon={<FaBook />}
          label="Course ID"
          value={
            course.id ||
            student.course_id ||
            "N/A"
          }
        />

        <ProfileRow
          icon={<FaUserShield />}
          label="Parent ID"
          value={
            student.parent_id ||
            "N/A"
          }
        />

        <ProfileRow
          icon={<FaChartLine />}
          label="Total Score"
          value={
            student.total_score ?? 0
          }
        />

        <ProfileRow
          icon={<FaChartLine />}
          label="Average Score"
          value={
            student.average_score ?? 0
          }
        />

        <ProfileRow
          icon={<FaAward />}
          label="Position"
          value={
            student.position ||
            student.academic_position ||
            student.rank ||
            "N/A"
          }
        />

        <ProfileRow
          icon={<FaAward />}
          label="GPA"
          value={
            student.gpa ?? 0
          }
        />

        <ProfileRow
          icon={<FaChartLine />}
          label="Remarks"
          value={
            student.remarks ||
            student.comment ||
            student.note ||
            "N/A"
          }
        />

        <ProfileRow
          icon={<FaCheckCircle />}
          label="Verified"
          value={yesNoBadge(
            userInfo.is_verified
          )}
        />

        <ProfileRow
          icon={<FaCheckCircle />}
          label="Active"
          value={yesNoBadge(
            userInfo.is_active !== false
          )}
        />

        <ProfileRow
          icon={<FaUserShield />}
          label="Permissions"
          value={
            Array.isArray(
              userInfo.permissions
            ) &&
            userInfo.permissions.length
              ? userInfo.permissions.join(
                  ", "
                )
              : "None"
          }
        />

      </div>

      {/* ====================================================== */}
      {/* BACK BUTTON */}
      {/* ====================================================== */}

      <div className="profile-actions">

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <FaArrowLeft />

          Back

        </button>

      </div>

    </div>

  );

};

// ======================================================
// PROFILE ROW
// ======================================================

const ProfileRow = ({
  icon,
  label,
  value,
}) => (

  <div className="profile-row">

    <div className="profile-label">

      {icon}

      <span>
        {label}
      </span>

    </div>

    <div className="profile-value">

      {value}

    </div>

  </div>

);

export default TeacherStudentProfile;