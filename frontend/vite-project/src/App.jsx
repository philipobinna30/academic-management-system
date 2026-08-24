import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// AUTH PAGES
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// CONTEXT
import { AuthProvider, useAuth } from "./context/AuthContext";

// ROUTES
import ProtectedRoute from "./Routes/ProtectedRoute";

// LAYOUTS
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/students/Students";
import StudentProfile from "./pages/admin/students/StudentProfile";
import Teachers from "./pages/admin/teachers/Teachers";
import TeacherCourses from "./pages/admin/teachers/TeacherCourses";
import Parents from "./pages/admin/parents/Parents";
import Courses from "./pages/admin/courses/Courses";
import Subjects from "./pages/admin/subjects/Subjects";
import Scores from "./pages/admin/scores/Scores";
import BulkScores from "./pages/admin/scores/BulkScores";
import Results from "./pages/admin/results/Results";
import Transcript from "./pages/admin/results/Transcript";
import Terms from "./pages/admin/terms/Terms";
import Sessions from "./pages/admin/sessions/Sessions";
import OnlineClasses from "./pages/admin/onlineclasses/OnlineClasses";

// TEACHER PAGES
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/students/TeacherStudents";
import TeacherStudentProfile from "./pages/teacher/students/TeacherStudentProfile";
import TeacherScores from "./pages/teacher/scores/TeacherScores";
import TeacherBulkScores from "./pages/teacher/scores/TeacherBulkScores";
import TeacherCoursesPage from "./pages/teacher/courses/TeacherCoursesPage";
import TeacherSubjects from "./pages/teacher/subjects/TeacherSubjects";
import TeacherOnlineClasses from "./pages/teacher/onlineclasses/TeacherOnlineClasses";

// STUDENT PAGES
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile from "./pages/student/MyProfile";
import MyResults from "./pages/student/MyResults";
import MyTranscript from "./pages/student/MyTranscript";
import StudentOnlineClasses from "./pages/student/StudentOnlineClasses";

import VerifyEmail from "./pages/auth/VerifyEmail";

// ======================================================
// ROLE REDIRECT
// ======================================================
const RoleRedirect = () => {
  const { user } = useAuth();

  if (!user?.access_token) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  if (role === "student") return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

// ======================================================
// ROUTES
// ======================================================
const AppRoutes = () => {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<RoleRedirect />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:studentId" element={<StudentProfile />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers/:teacherId/courses" element={<TeacherCourses />} />
        <Route path="parents" element={<Parents />} />
        <Route path="courses" element={<Courses />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="scores" element={<Scores />} />
        <Route path="scores/bulk" element={<BulkScores />} />
        <Route path="results" element={<Results />} />
        <Route path="results/transcript/:studentId" element={<Transcript />} />
        <Route path="terms" element={<Terms />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="online-classes" element={<OnlineClasses />} />
      </Route>

      {/* TEACHER */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="students/:studentId" element={<TeacherStudentProfile />} />
        <Route path="scores" element={<TeacherScores />} />
        <Route path="bulk-scores" element={<TeacherBulkScores />} />
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="subjects" element={<TeacherSubjects />} />
        <Route path="online-classes" element={<TeacherOnlineClasses />} />
      </Route>

      {/* STUDENT */}
<Route
  path="/student"
  element={
    <ProtectedRoute role="student">
      <StudentLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<StudentDashboard />} />
  <Route path="profile" element={<MyProfile />} />
  <Route path="results" element={<MyResults />} />
  <Route path="transcript" element={<MyTranscript />} />
  <Route path="online-classes" element={<StudentOnlineClasses />} />
</Route>

{/* EMAIL VERIFICATION */}
<Route
  path="/verify-email"
  element={<VerifyEmail />}
/>

{/* FALLBACK */}
<Route path="*" element={<Navigate to="/" replace />} />

</Routes>
  );
};
// ======================================================
// APP
// ======================================================
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;