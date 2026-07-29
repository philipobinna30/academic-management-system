import React from "react";

import { Outlet } from "react-router-dom";

import StudentSidebar from "../components/navigation/StudentSidebar";

// ======================================================
// STUDENT SIDEBAR LINKS
// ======================================================
const studentLinks = [
  {
    label: "Dashboard",
    to: "/student",
  },

  {
    label: "My Profile",
    to: "/student/profile",
  },

  {
    label: "My Results",
    to: "/student/results",
  },

  {
    label: "My Transcript",
    to: "/student/transcript",
  },

  {
    label: "Online Classes",
    to: "/student/online-classes",
  },
];

// ======================================================
// STUDENT LAYOUT
// ======================================================
const StudentLayout = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* SIDEBAR */}
      <StudentSidebar
        title="Student Portal"
        roleColor="#0f172a"
        links={studentLinks}
      />

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "20px",
          background: "#f8fafc",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;