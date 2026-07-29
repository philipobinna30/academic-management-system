import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/navigation/TeacherSidebar";

const TeacherLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <TeacherSidebar />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherLayout; 