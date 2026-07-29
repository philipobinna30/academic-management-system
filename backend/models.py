from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey,
    Float, DateTime, JSON, UniqueConstraint, func
)
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime, timezone

Base = declarative_base()

# =====================================================
# USER
# =====================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    taught_courses = relationship(
        "Course",
        back_populates="teacher",
        lazy="selectin"   # ✅ ADDED
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        lazy="selectin"   # ✅ ADDED
    )

    student_profile = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete",
        lazy="joined"     # 🔥 IMPORTANT FIX (prevents None profile issue)
    )

# =====================================================
# STUDENT PROFILE
# =====================================================
class StudentProfile(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    total_score = Column(Float, default=0.0)
    average_score = Column(Float, default=0.0)
    gpa = Column(Float, default=0.0)
    position = Column(Integer)
    remarks = Column(String)

    user = relationship(
        "User",
        back_populates="student_profile",
        lazy="joined"   # 🔥 FIX
    )

    parent = relationship(
        "Parent",
        back_populates="students",
        lazy="selectin"
    )

    course = relationship(
        "Course",
        back_populates="students",
        lazy="selectin"
    )

    scores = relationship("Score", back_populates="student", cascade="all, delete")
    results = relationship("Result", back_populates="student", cascade="all, delete")
    admissions = relationship("Admission", back_populates="student", cascade="all, delete")
# =====================================================
# PARENTS
# =====================================================
class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)

    students = relationship("StudentProfile", back_populates="parent")

# =====================================================
# COURSES (DEPARTMENTS)
# =====================================================
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    teacher = relationship(
        "User",
        back_populates="taught_courses",
        lazy="selectin"   # ✅ FIX
    )

    subjects = relationship("Subject", back_populates="course", cascade="all, delete", lazy="selectin")
    scores = relationship("Score", back_populates="course", cascade="all, delete")
    students = relationship("StudentProfile", back_populates="course", lazy="selectin")
# =====================================================
# SUBJECTS
# =====================================================
class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    course = relationship("Course", back_populates="subjects")
    scores = relationship("Score", back_populates="subject", cascade="all, delete")

# =====================================================
# SCORES
# =====================================================
class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id"), nullable=False)
    marks = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "subject_id",
            "term_id",
            name="uq_student_subject_term"
        ),
    )

    student = relationship("StudentProfile", back_populates="scores")
    course = relationship("Course", back_populates="scores")
    subject = relationship("Subject", back_populates="scores")
    term = relationship("Term")

# =====================================================
# ACADEMIC SESSION
# =====================================================
class AcademicSession(Base):
    __tablename__ = "academic_sessions"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=False)

    terms = relationship(
        "Term",
        back_populates="session",
        cascade="all, delete",
        lazy="selectin"   # 🔥 FIX
    )
# =====================================================
# TERM
# =====================================================
class Term(Base):
    __tablename__ = "terms"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    session_id = Column(Integer, ForeignKey("academic_sessions.id"), nullable=False)
    is_active = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)

    session = relationship(
        "AcademicSession",
        back_populates="terms",
        lazy="joined"   # 🔥 FIX
    )
# =====================================================
# RESULT
# ================================================

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("academic_sessions.id"), nullable=False)

    total_score = Column(Float, nullable=False)
    average_score = Column(Float, nullable=False)
    gpa = Column(Float)
    position = Column(Integer)
    remarks = Column(String)

    # subjects stored as JSON
    subjects = Column(JSON, nullable=False, default=list)

    is_locked = Column(Boolean, default=False)
    published = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("StudentProfile", back_populates="results", lazy="selectin")
    course = relationship("Course", lazy="selectin")
    term = relationship("Term", lazy="selectin")
    session = relationship("AcademicSession", lazy="selectin")
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "term_id",
            "session_id",
            name="uq_student_term_session"
        ),
    )

    # used by Pydantic
    @property
    def academic_session_id(self):
        return self.session_id

# =====================================================
# ONLINE CLASSES
# =====================================================
class OnlineClass(Base):
    __tablename__ = "online_classes"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    meeting_link = Column(String)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id"), nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)

    subject = relationship("Subject", lazy="selectin")
    term = relationship("Term", lazy="selectin")
# =====================================================
# ADMISSIONS
# =====================================================
class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("academic_sessions.id"), nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id"), nullable=True)
    admission_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="pending")
    remarks = Column(String)

    student = relationship("StudentProfile", back_populates="admissions")
    session = relationship("AcademicSession")
    term = relationship("Term")

# =====================================================
# AUDIT LOGS
# =====================================================
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    user_role = Column(String, nullable=True)
    action = Column(String, nullable=False)
    target = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    extra_data = Column(JSON, default=lambda: {})  # 🔥 SAFE

    user = relationship("User", back_populates="audit_logs")



