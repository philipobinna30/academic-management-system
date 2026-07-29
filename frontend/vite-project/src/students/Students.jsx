import React, { useEffect, useState } from "react";
import { getAllStudents } from "../../services/studentService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH STUDENTS FROM BACKEND
  // ==========================================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==========================================
  // UI STATES
  // ==========================================
  if (loading) return <h3>Loading students...</h3>;
  if (error) return <h3 style={{ color: "red" }}>{error}</h3>;

  return (
    <div>
      <h1>Students Page</h1>

      {students.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Course ID</th>
              <th>GPA</th>
              <th>Position</th>
              <th>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.user_id}</td>
                <td>{student.course_id}</td>
                <td>{student.gpa}</td>
                <td>{student.position}</td>
                <td>{student.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Students;