import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getTeacherStudentProfile } from "../../../services/teacherService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

const TeacherStudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user && studentId) {
      loadStudent();
    }
  }, [user, studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const teacherId = user?.user_id || user?.id;

      if (!teacherId) {
        throw new Error("Teacher ID not found.");
      }

      const data = await getTeacherStudentProfile(
        teacherId,
        studentId
      );

      setStudent(data || null);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error?.message || "Failed to load student profile"
      );
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (errorMsg) {
    return (
      <div>
        <ErrorMessage message={errorMsg} />
        <button onClick={() => navigate(-1)} style={buttonStyle}>
          Back
        </button>
      </div>
    );
  }

  if (!student) {
    return <p>Student profile not found.</p>;
  }

  const userInfo = student.user || {};
  const course = student.course || {};

  return (
    <div>
      <div style={{ marginBottom: 25 }}>
        <h2>Student Profile</h2>
        <p style={{ color: "#6b7280" }}>Student academic profile</p>
      </div>

      <div style={cardStyle}>
        <ProfileRow label="Profile ID" value={student.id || "N/A"} />
        <ProfileRow label="User ID" value={student.user_id || "N/A"} />

        <ProfileRow
          label="Full Name"
          value={student.full_name || userInfo.full_name || "N/A"}
        />

        <ProfileRow
          label="Email"
          value={student.email || userInfo.email || "N/A"}
        />

        <ProfileRow
          label="Role"
          value={userInfo.role || student.role || "student"}
        />

        <ProfileRow
          label="Course"
          value={student.course_name || course.name || "N/A"}
        />

        <ProfileRow
          label="Course ID"
          value={course.id || student.course_id || "N/A"}
        />

        <ProfileRow label="Parent ID" value={student.parent_id || "N/A"} />

        <ProfileRow
          label="Total Score"
          value={student.total_score ?? 0}
        />

        <ProfileRow
          label="Average Score"
          value={student.average_score ?? 0}
        />

        {/* FIXED FALLBACKS */}
        <ProfileRow
          label="Position"
          value={
            student.position ||
            student.academic_position ||
            student.rank ||
            "N/A"
          }
        />

        <ProfileRow
          label="GPA"
          value={student.gpa ?? 0}
        />

        <ProfileRow
          label="Remarks"
          value={
            student.remarks ||
            student.comment ||
            student.note ||
            "N/A"
          }
        />

        <ProfileRow
          label="Active"
          value={userInfo.is_active === false ? "No" : "Yes"}
        />

        <ProfileRow
          label="Verified"
          value={userInfo.is_verified ? "Yes" : "No"}
        />

        <ProfileRow
          label="Permissions"
          value={
            Array.isArray(userInfo.permissions) &&
            userInfo.permissions.length
              ? userInfo.permissions.join(", ")
              : "None"
          }
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate(-1)} style={buttonStyle}>
          Back
        </button>
      </div>
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div
    style={{
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: "1px solid #e5e7eb",
    }}
  >
    <strong>{label}</strong>
    <div style={{ marginTop: 4 }}>{value}</div>
  </div>
);

const cardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  maxWidth: "700px",
};

const buttonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

export default TeacherStudentProfile;