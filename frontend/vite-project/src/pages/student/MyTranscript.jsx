import React, {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import {
  getMyProfile,
} from "../../services/studentService";

import {
  printStudentTranscript,
} from "../../services/resultService";

const MyTranscript = () => {
  const { user } = useAuth();

  // ======================================================
  // STATES
  // ======================================================
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [successMsg, setSuccessMsg] =
    useState("");

  // ======================================================
  // HARD-CODED SCHOOL INFO
  // ======================================================
  const school = {
    name: "MY APO SCHOOL",
    motto: "EXCELLENCY",
    logo: "📘",
    address: "Abuja, Nigeria",
    phone: "+234 8000000000",
    email: "info@myaposchool.com",
  };

  // ======================================================
  // LOAD PROFILE
  // ======================================================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data =
        await getMyProfile();

      setProfile(data);
    } catch (error) {
      console.error(
        "Profile load failed:",
        error
      );
    }
  };

  // ======================================================
  // DOWNLOAD TRANSCRIPT
  // ======================================================
  const handleDownload =
    async () => {
      try {
        if (
          !user?.student_profile_id
        ) {
          setErrorMsg(
            "Student profile not found."
          );

          return;
        }

        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const blob =
          await printStudentTranscript(
            user.student_profile_id
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `student-transcript-${user.student_profile_id}.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        window.URL.revokeObjectURL(
          url
        );

        setSuccessMsg(
          "Transcript downloaded successfully."
        );
      } catch (error) {
        console.error(error);

        setErrorMsg(
          error?.message ||
            "Failed to download transcript"
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // RETRY
  // ======================================================
  const retryDownload =
    () => {
      setErrorMsg("");
      handleDownload();
    };

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          marginBottom:
            "30px",
        }}
      >
        <h1
          style={{
            fontSize:
              "30px",
            marginBottom:
              "10px",
          }}
        >
          My Transcript
        </h1>

        <p
          style={{
            color:
              "#6b7280",
          }}
        >
          Download and preview your
          academic transcript
        </p>
      </div>

      {/* SUCCESS */}

      {successMsg && (
        <div
          style={{
            background:
              "#dcfce7",
            color:
              "#166534",
            padding:
              "15px",
            borderRadius:
              "8px",
            marginBottom:
              "20px",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* ERROR */}

      {errorMsg && (
        <div
          style={{
            background:
              "#fee2e2",
            color:
              "#b91c1c",
            padding:
              "15px",
            borderRadius:
              "8px",
            marginBottom:
              "20px",
          }}
        >
          {errorMsg}

          <button
            onClick={
              retryDownload
            }
            style={{
              marginLeft:
                "15px",
              padding:
                "8px 14px",
              border:
                "none",
              borderRadius:
                "6px",
              background:
                "#2563eb",
              color:
                "#fff",
              cursor:
                "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          PREVIEW CARD
      ====================================================== */}

      <div
        style={{
          background:
            "#fff",
          padding:
            "30px",
          borderRadius:
            "10px",
          maxWidth:
            "650px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* SCHOOL HEADER */}

        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              "25px",
          }}
        >
          <div
            style={{
              fontSize:
                "40px",
            }}
          >
            {school.logo}
          </div>

          <h2>
            {school.name}
          </h2>

          <p
            style={{
              color:
                "#6b7280",
            }}
          >
            {school.motto}
          </p>
        </div>

        {/* STUDENT DETAILS */}

        <div
          style={{
            background:
              "#f9fafb",
            padding:
              "20px",
            borderRadius:
              "8px",
            marginBottom:
              "20px",
          }}
        >
          <p>
            <strong>
              Name:
            </strong>{" "}
            {profile?.full_name ||
              "N/A"}
          </p>

          <p>
            <strong>
              Email:
            </strong>{" "}
            {profile?.email ||
              "N/A"}
          </p>

          <p>
            <strong>
              Student ID:
            </strong>{" "}
            {profile?.id ||
              user?.student_profile_id ||
              "N/A"}
          </p>

          <p>
            <strong>
              Course:
            </strong>{" "}
            {profile?.course_name ||
              "N/A"}
          </p>

          <p>
            <strong>
              Role:
            </strong>{" "}
            {profile?.role ||
              "student"}
          </p>
        </div>

        <p
          style={{
            color:
              "#6b7280",
            marginBottom:
              "20px",
          }}
        >
          This is a preview of your
          transcript before download.
        </p>

        {/* DOWNLOAD */}

        <button
          onClick={
            handleDownload
          }
          disabled={
            loading
          }
          style={{
            width:
              "100%",
            padding:
              "12px 18px",
            border:
              "none",
            borderRadius:
              "6px",
            background:
              loading
                ? "#9ca3af"
                : "#2563eb",
            color:
              "#fff",
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
            fontSize:
              "15px",
            fontWeight:
              "600",
          }}
        >
          {loading
            ? "Downloading..."
            : "Download Transcript"}
        </button>
      </div>
    </div>
  );
};

export default MyTranscript;