import React, {
  useEffect,
  useState,
} from "react";

import "./MyTranscript.css";

import { useAuth } from "../../context/AuthContext";

import {
  getMyProfile,
} from "../../services/studentService";

import {
  printStudentTranscript,
} from "../../services/resultService";

/**
 * ======================================================
 * My Transcript
 * ======================================================
 */

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
  // SCHOOL INFORMATION
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
      setErrorMsg("");

      const data =
        await getMyProfile();

      setProfile(data);
    } catch (error) {
      console.error(
        "Profile load failed:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Failed to load student profile."
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

        if (!blob) {
          throw new Error(
            "No transcript file was returned."
          );
        }

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
        console.error(
          "Transcript download failed:",
          error
        );

        setErrorMsg(
          error?.message ||
            "Failed to download transcript."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // RETRY DOWNLOAD
  // ======================================================

  const retryDownload = () => {
    setErrorMsg("");
    handleDownload();
  };

  // ======================================================
  // SAFE PROFILE DATA
  // ======================================================

  const safeProfile = {
    id:
      profile?.id ??
      profile?.student_profile_id ??
      user?.student_profile_id ??
      "N/A",

    full_name:
      profile?.full_name ??
      profile?.user?.full_name ??
      user?.full_name ??
      "N/A",

    email:
      profile?.email ??
      profile?.user?.email ??
      user?.email ??
      "N/A",

    course_name:
      profile?.course_name ??
      profile?.course?.name ??
      "N/A",

    role:
      profile?.role ??
      profile?.user?.role ??
      user?.role ??
      "student",
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="my-transcript">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="my-transcript-header">

        <div>
          <h1>
            My Transcript
          </h1>

          <p>
            Download and preview your
            academic transcript
          </p>
        </div>

      </div>

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {successMsg && (
        <div className="transcript-success">
          <span className="message-icon">
            ✓
          </span>

          <span>
            {successMsg}
          </span>
        </div>
      )}

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {errorMsg && (
        <div className="transcript-error">

          <div className="error-content">

            <span className="message-icon">
              !
            </span>

            <span>
              {errorMsg}
            </span>

          </div>

          <button
            type="button"
            onClick={retryDownload}
            className="retry-button"
          >
            Retry
          </button>

        </div>
      )}

      {/* ==================================================
          TRANSCRIPT PREVIEW
      ================================================== */}

      <div className="transcript-preview">

        {/* ==================================================
            SCHOOL HEADER
        ================================================== */}

        <div className="transcript-school-header">

          <div className="school-logo">
            {school.logo}
          </div>

          <h2>
            {school.name}
          </h2>

          <p className="school-motto">
            {school.motto}
          </p>

          <p className="school-address">
            {school.address}
          </p>

          <div className="school-contact">

            <span>
              {school.phone}
            </span>

            <span>
              {school.email}
            </span>

          </div>

        </div>

        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="transcript-title">

          <span className="title-line"></span>

          <h3>
            ACADEMIC TRANSCRIPT
          </h3>

          <span className="title-line"></span>

        </div>

        {/* ==================================================
            STUDENT INFORMATION
        ================================================== */}

        <div className="student-information">

          <div className="information-header">
            <h3>
              Student Information
            </h3>
          </div>

          <div className="student-info-grid">

            <TranscriptInfo
              label="Student Name"
              value={
                safeProfile.full_name
              }
            />

            <TranscriptInfo
              label="Student ID"
              value={
                safeProfile.id
              }
            />

            <TranscriptInfo
              label="Email"
              value={
                safeProfile.email
              }
            />

            <TranscriptInfo
              label="Course"
              value={
                safeProfile.course_name
              }
            />

            <TranscriptInfo
              label="Role"
              value={
                safeProfile.role
              }
            />

          </div>

        </div>

        {/* ==================================================
            PREVIEW NOTICE
        ================================================== */}

        <div className="transcript-notice">

          <div className="notice-icon">
            📄
          </div>

          <div>
            <h4>
              Transcript Preview
            </h4>

            <p>
              This is a preview of your
              academic transcript. Your
              complete transcript will be
              generated as a PDF when you
              click the download button.
            </p>
          </div>

        </div>

        {/* ==================================================
            DOWNLOAD
        ================================================== */}

        <div className="transcript-download">

          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className={
              loading
                ? "download-transcript-button loading"
                : "download-transcript-button"
            }
          >

            {loading ? (
              <>
                <span className="button-spinner"></span>
                Downloading...
              </>
            ) : (
              <>
                <span className="download-icon">
                  ↓
                </span>

                Download Transcript
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
};

// ======================================================
// TRANSCRIPT INFORMATION ROW
// ======================================================

const TranscriptInfo = ({
  label,
  value,
}) => {
  return (
    <div className="transcript-info-item">

      <span className="transcript-info-label">
        {label}
      </span>

      <span className="transcript-info-value">
        {value ?? "N/A"}
      </span>

    </div>
  );
};

export default MyTranscript;

