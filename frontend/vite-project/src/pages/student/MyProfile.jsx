import React, {
  useEffect,
  useState,
} from "react";

import "./MyProfile.css";

import { useAuth } from "../../context/AuthContext";

import {
  getMyProfile,
} from "../../services/studentService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const MyProfile = () => {
  const { user } = useAuth();

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

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data =
        await getMyProfile();

      setStudent(data);
    } catch (error) {
      console.error(
        "Failed to load profile:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load student profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INIT
  // ======================================================

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // ======================================================
  // SAFE FALLBACK MAPPING
  // ======================================================

  const safeStudent = {
    id:
      student?.id ??
      student?.student_profile_id ??
      "N/A",

    user_id:
      student?.user_id ??
      student?.user?.id ??
      user?.id ??
      user?.user_id ??
      "N/A",

    full_name:
      student?.full_name ??
      student?.user?.full_name ??
      user?.full_name ??
      "N/A",

    email:
      student?.email ??
      student?.user?.email ??
      user?.email ??
      "N/A",

    role:
      student?.role ??
      student?.user?.role ??
      user?.role ??
      "student",

    course_name:
      student?.course_name ??
      student?.course?.name ??
      "Not Assigned",

    course_id:
      student?.course_id ??
      student?.course?.id ??
      "N/A",

    parent_id:
      student?.parent_id ??
      student?.parent?.id ??
      "N/A",

    total_score:
      student?.total_score ?? 0,

    average_score:
      student?.average_score ?? 0,

    gpa:
      student?.gpa ?? 0,

    position:
      student?.position ??
      student?.academic_position ??
      student?.rank ??
      "Not Available",

    remarks:
      student?.remarks ??
      student?.comment ??
      student?.note ??
      "No Remarks",

    is_active:
      student?.is_active ??
      student?.user?.is_active ??
      true,

    email_verified:
      student?.email_verified ??
      student?.is_verified ??
      student?.user?.is_verified ??
      false,

    created_at:
      student?.created_at ?? null,
  };

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
    <div className="my-profile-page">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="my-profile-header">

        <div className="profile-header-content">

          <div className="profile-header-icon">
            👤
          </div>

          <div>
            <h1>
              My Profile
            </h1>

            <p>
              View your personal and academic information
            </p>
          </div>

        </div>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {errorMsg && (
        <div className="my-profile-error">
          <ErrorMessage
            message={errorMsg}
          />
        </div>
      )}

      {/* ==================================================
          EMPTY STATE
      ================================================== */}

      {!loading &&
        !student &&
        !errorMsg && (
          <div className="profile-empty-state">

            <div className="empty-icon">
              👤
            </div>

            <h3>
              No Student Profile
            </h3>

            <p>
              No student profile information
              is currently available.
            </p>

          </div>
        )}

      {/* ==================================================
          PROFILE CONTENT
      ================================================== */}

      {student && (
        <div className="profile-content">

          {/* ==============================================
              ACCOUNT INFORMATION
          ============================================== */}

          <section className="profile-section">

            <div className="profile-section-header account-header">

              <div className="section-icon">
                👤
              </div>

              <div>
                <h2>
                  Account Information
                </h2>

                <p>
                  Your personal and account details
                </p>
              </div>

            </div>

            <div className="profile-grid">

              <ProfileRow
                label="Student Profile ID"
                value={safeStudent.id}
              />

              <ProfileRow
                label="User ID"
                value={safeStudent.user_id}
              />

              <ProfileRow
                label="Full Name"
                value={safeStudent.full_name}
              />

              <ProfileRow
                label="Email"
                value={safeStudent.email}
              />

              <ProfileRow
                label="Role"
                value={safeStudent.role}
              />

              <ProfileRow
                label="Account Active"
                value={
                  safeStudent.is_active
                    ? "Yes"
                    : "No"
                }
                valueClass={
                  safeStudent.is_active
                    ? "status-active"
                    : "status-inactive"
                }
              />

              <ProfileRow
                label="Email Verified"
                value={
                  safeStudent.email_verified
                    ? "Yes"
                    : "No"
                }
                valueClass={
                  safeStudent.email_verified
                    ? "status-active"
                    : "status-inactive"
                }
              />

            </div>

          </section>

          {/* ==============================================
              ACADEMIC INFORMATION
          ============================================== */}

          <section className="profile-section">

            <div className="profile-section-header academic-header">

              <div className="section-icon">
                🎓
              </div>

              <div>
                <h2>
                  Academic Information
                </h2>

                <p>
                  Your course and academic performance
                </p>
              </div>

            </div>

            <div className="profile-grid">

              <ProfileRow
                label="Course"
                value={safeStudent.course_name}
              />

              <ProfileRow
                label="Course ID"
                value={safeStudent.course_id}
              />

              <ProfileRow
                label="Parent ID"
                value={safeStudent.parent_id}
              />

              <ProfileRow
                label="Total Score"
                value={safeStudent.total_score}
              />

              <ProfileRow
                label="Average Score"
                value={safeStudent.average_score}
              />

              <ProfileRow
                label="GPA"
                value={safeStudent.gpa}
              />

              <ProfileRow
                label="Position"
                value={safeStudent.position}
              />

              <ProfileRow
                label="Remarks"
                value={safeStudent.remarks}
              />

              <ProfileRow
                label="Created At"
                value={
                  safeStudent.created_at
                    ? new Date(
                        safeStudent.created_at
                      ).toLocaleString()
                    : "N/A"
                }
              />

            </div>

          </section>

        </div>
      )}

    </div>
  );
};

// ======================================================
// PROFILE ROW
// ======================================================

const ProfileRow = ({
  label,
  value,
  valueClass = "",
}) => {
  return (
    <div className="profile-row">

      <div className="profile-label">
        {label}
      </div>

      <div
        className={`profile-value ${valueClass}`}
      >
        {value}
      </div>

    </div>
  );
};

// ======================================================
// EXPORT
// ======================================================

export default MyProfile;