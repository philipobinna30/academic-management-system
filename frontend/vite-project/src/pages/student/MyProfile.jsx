import React, { useEffect, useState } from "react";

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

  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await getMyProfile();

      setStudent(data);
    } catch (error) {
      console.error("Failed to load profile:", error);

      setErrorMsg(
        error?.message || "Failed to load student profile"
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
  // SAFE FALLBACK MAPPING (FIX CORE ISSUE)
  // ======================================================

  const safeStudent = {
    id: student?.id ?? student?.student_profile_id ?? "N/A",

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

    total_score: student?.total_score ?? 0,
    average_score: student?.average_score ?? 0,
    gpa: student?.gpa ?? 0,
    position: student?.position ?? "Not Available",
    remarks: student?.remarks ?? "No Remarks",

    is_active:
      student?.is_active ?? true,

    email_verified:
      student?.email_verified ?? false,

    created_at: student?.created_at ?? null,
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "30px", marginBottom: "10px" }}>
          My Profile
        </h1>

        <p style={{ color: "#6b7280" }}>
          View your personal and academic information
        </p>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!loading && !student && !errorMsg && (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <p>No student profile available.</p>
        </div>
      )}

      {/* ======================================================
          PROFILE
      ====================================================== */}

      {student && (
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            maxWidth: "700px",
          }}
        >
          <ProfileRow label="Student Profile ID" value={safeStudent.id} />

          <ProfileRow label="User ID" value={safeStudent.user_id} />

          <ProfileRow label="Full Name" value={safeStudent.full_name} />

          <ProfileRow label="Email" value={safeStudent.email} />

          <ProfileRow label="Role" value={safeStudent.role} />

          <ProfileRow label="Account Active" value={safeStudent.is_active ? "Yes" : "No"} />

          <ProfileRow label="Email Verified" value={safeStudent.email_verified ? "Yes" : "No"} />

          <ProfileRow label="Course" value={safeStudent.course_name} />

          <ProfileRow label="Course ID" value={safeStudent.course_id} />

          <ProfileRow label="Parent ID" value={safeStudent.parent_id} />

          <ProfileRow label="Total Score" value={safeStudent.total_score} />

          <ProfileRow label="Average Score" value={safeStudent.average_score} />

          <ProfileRow label="GPA" value={safeStudent.gpa} />

          <ProfileRow label="Position" value={safeStudent.position} />

          <ProfileRow label="Remarks" value={safeStudent.remarks} />

          <ProfileRow
            label="Created At"
            value={
              safeStudent.created_at
                ? new Date(safeStudent.created_at).toLocaleString()
                : "N/A"
            }
          />
        </div>
      )}
    </div>
  );
};

// ======================================================
// PROFILE ROW
// ======================================================

const ProfileRow = ({ label, value }) => {
  return (
    <div
      style={{
        marginBottom: "20px",
        paddingBottom: "12px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          marginBottom: "6px",
          color: "#374151",
          fontSize: "15px",
        }}
      >
        {label}
      </h3>

      <p
        style={{
          color: "#111827",
          fontSize: "17px",
        }}
      >
        {value}
      </p>
    </div>
  );
};

export default MyProfile;