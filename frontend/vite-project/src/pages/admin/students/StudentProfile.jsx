import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getStudentProfile,
  getStudentResult,
  printStudentResult,
  printStudentTranscript,
} from "../../../services/studentService";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/common/ErrorMessage";

const StudentProfile = () => {
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await getStudentProfile(studentId);
      setStudent(profile);

      try {
        const resultData = await getStudentResult(studentId);
        setResult(resultData);
      } catch {
        setResult(null);
      }
    } catch (err) {
      setError(
        err?.message || "Failed to load student profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrintResult = async () => {
    try {
      const blob = await printStudentResult(studentId);

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      alert(
        err?.message ||
          "Failed to print result"
      );
    }
  };

  const handlePrintTranscript = async () => {
    try {
      const blob =
        await printStudentTranscript(studentId);

      const url =
        window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      alert(
        err?.message ||
          "Failed to print transcript"
      );
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!student) {
    return <h3>Student not found</h3>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}

      <div style={headerStyle}>
        <h2>Student Profile</h2>

        <div style={buttonGroupStyle}>
          <button onClick={handlePrintResult}>
            Print Result
          </button>

          <button
            onClick={handlePrintTranscript}
          >
            Print Transcript
          </button>
        </div>
      </div>

      {/* STUDENT INFORMATION */}

      <div style={cardStyle}>
        <h3>Student Information</h3>

        <p>
          <strong>Profile ID:</strong>{" "}
          {student.id}
        </p>

        <p>
          <strong>User ID:</strong>{" "}
          {student.user_id || "N/A"}
        </p>

        <p>
          <strong>Full Name:</strong>{" "}
          {student.user?.full_name ||
            student.full_name ||
            "N/A"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {student.user?.email ||
            student.email ||
            "N/A"}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {student.user?.role ||
            "student"}
        </p>

        <p>
          <strong>Course:</strong>{" "}
          {student.course?.name ||
            student.course_name ||
            "N/A"}
        </p>

        <p>
          <strong>Course ID:</strong>{" "}
          {student.course_id || "N/A"}
        </p>

        <p>
          <strong>Parent ID:</strong>{" "}
          {student.parent_id || "N/A"}
        </p>

        <p>
          <strong>Active:</strong>{" "}
          {student.user?.is_active
            ? "Yes"
            : "No"}
        </p>

        <p>
          <strong>Verified:</strong>{" "}
          {student.user?.is_verified
            ? "Yes"
            : "No"}
        </p>

        <p>
          <strong>Permissions:</strong>{" "}
          {student.user?.permissions
            ?.length
            ? student.user.permissions.join(
                ", "
              )
            : "None"}
        </p>
      </div>

      {/* ACADEMIC SUMMARY */}

      <div style={cardStyle}>
        <h3>Academic Summary</h3>

        <p>
          <strong>Total Score:</strong>{" "}
          {student.total_score ?? 0}
        </p>

        <p>
          <strong>Average Score:</strong>{" "}
          {student.average_score ?? 0}
        </p>

        <p>
          <strong>GPA:</strong>{" "}
          {student.gpa ?? 0}
        </p>

        <p>
          <strong>Position:</strong>{" "}
          {student.position ?? "-"}
        </p>

        <p>
          <strong>Remarks:</strong>{" "}
          {student.remarks || "-"}
        </p>
      </div>

      {/* RESULT */}

      <div style={cardStyle}>
        <h3>Current Published Result</h3>

        {!result ? (
          <p>No published result found.</p>
        ) : (
          <>
            {/* SCHOOL INFO */}

            <h4>School Information</h4>

            <p>
              <strong>School:</strong>{" "}
              {result.school_name ||
                "N/A"}
            </p>

            <p>
              <strong>Motto:</strong>{" "}
              {result.school_motto ||
                "N/A"}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {result.school_address ||
                "N/A"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {result.school_phone ||
                "N/A"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {result.school_email ||
                "N/A"}
            </p>

            <p>
              <strong>Website:</strong>{" "}
              {result.school_website ||
                "N/A"}
            </p>

            <hr />

            <h4>Result Information</h4>

            <p>
              <strong>Session:</strong>{" "}
              {result.session_year ||
                "-"}
            </p>

            <p>
              <strong>Term:</strong>{" "}
              {result.term_name || "-"}
            </p>

            <p>
              <strong>Total Score:</strong>{" "}
              {result.total_score}
            </p>

            <p>
              <strong>Average:</strong>{" "}
              {result.average_score}
            </p>

            <p>
              <strong>GPA:</strong>{" "}
              {result.gpa}
            </p>

            <p>
              <strong>
                Cumulative GPA:
              </strong>{" "}
              {result.cumulative_gpa ??
                "-"}
            </p>

            <p>
              <strong>Position:</strong>{" "}
              {result.position ?? "-"}
            </p>

            <p>
              <strong>
                Class Size:
              </strong>{" "}
              {result.class_size ?? "-"}
            </p>

            <p>
              <strong>
                Total Subjects:
              </strong>{" "}
              {result.number_of_subjects ??
                "-"}
            </p>

            <p>
              <strong>
                Promotion Status:
              </strong>{" "}
              {result.promotion_status ||
                "-"}
            </p>

            <p>
              <strong>Published:</strong>{" "}
              {result.published
                ? "Yes"
                : "No"}
            </p>

            <p>
              <strong>Locked:</strong>{" "}
              {result.is_locked
                ? "Yes"
                : "No"}
            </p>

            <p>
              <strong>Remarks:</strong>{" "}
              {result.remarks || "-"}
            </p>

            <hr />

            <h4>Attendance</h4>

            <p>
              <strong>
                Attendance:
              </strong>{" "}
              {result.attendance ??
                "-"}
            </p>

            <p>
              <strong>
                Total School Days:
              </strong>{" "}
              {result.total_school_days ??
                "-"}
            </p>

            <hr />

            <h4>Comments</h4>

            <p>
              <strong>
                Teacher Comment:
              </strong>{" "}
              {result.teacher_comment ||
                "-"}
            </p>

            <p>
              <strong>
                Principal Comment:
              </strong>{" "}
              {result.principal_comment ||
                "-"}
            </p>

            <hr />

            <h4>Verification</h4>

            <p>
              <strong>
                Verification Link:
              </strong>
            </p>

            <a
              href={
                result.verification_link
              }
              target="_blank"
              rel="noreferrer"
            >
              {result.verification_link}
            </a>

            <p>
              <strong>
                Generated:
              </strong>{" "}
              {result.created_at
                ? new Date(
                    result.created_at
                  ).toLocaleString()
                : "-"}
            </p>

            <p>
              <strong>
                Next Term Begins:
              </strong>{" "}
              {result.next_term_begins
                ? new Date(
                    result.next_term_begins
                  ).toLocaleDateString()
                : "-"}
            </p>

            <hr />

            <h4>Subject Breakdown</h4>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Remark</th>
                </tr>
              </thead>

              <tbody>
                {result.subjects?.map(
                  (subject, index) => (
                    <tr
                      key={
                        subject.subject_id ||
                        index
                      }
                    >
                      <td>
                        {
                          subject.subject_name
                        }
                      </td>

                      <td>
                        {subject.marks}
                      </td>

                      <td>
                        {subject.grade}
                      </td>

                      <td>
                        {subject.remark}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  padding: "20px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "8px",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.08)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
};

export default StudentProfile;