from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime


# =====================================================
# AUTH / USER SCHEMAS
# =====================================================

class UserCreateBase(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = None


class UserCreateAdmin(UserCreateBase):
    pass


class UserCreateStudent(UserCreateBase):
    course_id: int


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    permissions: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    permissions: List[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class Login(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    user_id: int
    student_profile_id: Optional[int] = None


class RefreshToken(BaseModel):
    token: str


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


# =====================================================
# PARENT SCHEMAS
# =====================================================

class ParentCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class ParentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


# =====================================================
# COURSE & SUBJECT SCHEMAS
# =====================================================

class SubjectCreate(BaseModel):
    name: str
    course_id: int


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    course_id: Optional[int] = None


class SubjectResponse(BaseModel):
    id: int
    name: str
    course_id: int

    model_config = {"from_attributes": True}


class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    teacher_id: Optional[int] = None


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    teacher_id: Optional[int] = None


class CourseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    teacher_id: Optional[int]
    subjects: List[SubjectResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class BulkCourseSubjectsCreate(BaseModel):
    subjects: List[str]


# =====================================================
# STUDENT PROFILE SCHEMAS
# =====================================================

class StudentProfileCreate(BaseModel):
    user_id: int
    course_id: int
    parent_id: Optional[int] = None


# =====================================================
# STUDENT UPDATE
# =====================================================

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    permissions: Optional[List[str]] = None

    course_id: Optional[int] = None
    parent_id: Optional[int] = None


class StudentProfileUpdate(BaseModel):
    parent_id: Optional[int] = None
    course_id: Optional[int] = None


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    course_id: int

    total_score: float = 0.0
    average_score: float = 0.0

    position: Optional[int] = None
    gpa: Optional[float] = 0.0
    remarks: Optional[str] = None

    # 🔥 ADDED
    user: Optional[UserResponse] = None
    course: Optional[CourseResponse] = None
    parent_id: Optional[int] = None

    model_config = {"from_attributes": True}


class StudentUpdateRequest(BaseModel):
    user: UserUpdate
    profile: StudentProfileUpdate


# =====================================================
# PARENT RESPONSE
# =====================================================

class ParentResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str

    students: List[StudentProfileResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# =====================================================
# SCORE SCHEMAS
# =====================================================

# =====================================================
# SCORE SCHEMAS
# =====================================================

class ScoreCreate(BaseModel):
    student_id: int
    subject_id: int
    term_id: int
    marks: float


class ScoreUpdate(BaseModel):
    subject_id: Optional[int] = None
    term_id: Optional[int] = None
    marks: Optional[float] = None


class ScoreResponse(BaseModel):
    id: int

    student_id: int
    course_id: int
    subject_id: int
    term_id: int

    marks: float

    # ======================================================
    # RELATED OBJECTS
    # ======================================================

    student: Optional["StudentProfileResponse"] = None

    course: Optional["CourseResponse"] = None

    subject: Optional["SubjectResponse"] = None

    term: Optional["TermResponse"] = None

    model_config = {
        "from_attributes": True
    }
# =====================================================
# SESSION / TERM SCHEMAS
# =====================================================

class SessionCreate(BaseModel):
    name: str


class SessionResponse(BaseModel):
    id: int
    name: str
    is_active: bool

    model_config = {"from_attributes": True}


class TermCreate(BaseModel):
    name: str
    session_id: int


class TermResponse(BaseModel):
    id: int
    name: str
    session_id: int
    is_active: bool
    is_closed: bool

    # 🔥 ADDED
    next_term_begins: Optional[datetime] = None

    model_config = {"from_attributes": True}


# =====================================================
# RESULT / TRANSCRIPT SCHEMAS
# =====================================================



class SubjectScoreOut(BaseModel):
    subject_id: int
    subject_name: str
    marks: float

    grade: Optional[str] = None
    remark: Optional[str] = None


class ResultResponse(BaseModel):

    # =====================================================
    # IDENTIFIERS
    # =====================================================

    id: int
    student_id: int
    course_id: int
    term_id: int
    academic_session_id: int

    student_name: Optional[str] = None

    # =====================================================
    # SCHOOL INFORMATION
    # =====================================================

    school_name: Optional[str] = None
    school_motto: Optional[str] = None
    school_address: Optional[str] = None
    school_phone: Optional[str] = None
    school_email: Optional[str] = None
    school_website: Optional[str] = None
    school_logo: Optional[str] = None

    # =====================================================
    # SCORES
    # =====================================================

    total_score: float
    average_score: float

    gpa: Optional[float] = 0.0
    cumulative_gpa: Optional[float] = None

    position: Optional[int] = None
    remarks: Optional[str] = None

    # =====================================================
    # LOCK / PUBLISH
    # =====================================================

    is_locked: bool = False
    published: bool

    created_at: datetime

    # =====================================================
    # SUBJECTS
    # =====================================================

    subjects: List[SubjectScoreOut] = Field(default_factory=list)

    # =====================================================
    # SUMMARY
    # =====================================================

    total_marks: Optional[float] = None
    number_of_subjects: Optional[int] = None
    class_size: Optional[int] = None

    # =====================================================
    # TERM INFO
    # =====================================================

    term_name: Optional[str] = None
    session_year: Optional[str] = None

    # =====================================================
    # PROMOTION
    # =====================================================

    promotion_status: Optional[str] = None

    # =====================================================
    # COMMENTS
    # =====================================================

    teacher_comment: Optional[str] = None
    principal_comment: Optional[str] = None

    # =====================================================
    # ATTENDANCE
    # =====================================================

    attendance: Optional[int] = None
    total_school_days: Optional[int] = None

    # =====================================================
    # NEXT TERM
    # =====================================================

    next_term_begins: Optional[datetime] = None

    # =====================================================
    # SIGNATURES
    # =====================================================

    class_teacher_signature: Optional[str] = None
    principal_signature: Optional[str] = None
    registrar_signature: Optional[str] = None

    # =====================================================
    # VERIFICATION
    # =====================================================

    verification_link: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class TranscriptResponse(BaseModel):

    # =====================================================
    # STUDENT
    # =====================================================

    student_id: int
    session: str

    # =====================================================
    # SCHOOL INFORMATION
    # =====================================================

    school_name: Optional[str] = None
    school_motto: Optional[str] = None
    school_address: Optional[str] = None
    school_phone: Optional[str] = None
    school_email: Optional[str] = None
    school_website: Optional[str] = None
    school_logo: Optional[str] = None

    # =====================================================
    # RESULTS
    # =====================================================

    term_results: List[ResultResponse] = Field(default_factory=list)

    # =====================================================
    # CUMULATIVE PERFORMANCE
    # =====================================================

    cumulative_average: Optional[float] = None
    cumulative_gpa: Optional[float] = None

    model_config = {
        "from_attributes": True
    }
# =====================================================
# ONLINE CLASS SCHEMAS
# =====================================================

class OnlineClassCreate(BaseModel):
    title: str
    description: str
    meeting_link: str
    subject_id: int
    term_id: int
    start_time: datetime
    end_time: datetime


class OnlineClassUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_link: Optional[str] = None
    subject_id: Optional[int] = None
    term_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class OnlineClassResponse(BaseModel):
    id: int
    title: str
    description: str
    meeting_link: str
    subject_id: int
    term_id: int
    start_time: datetime
    end_time: datetime

    model_config = {"from_attributes": True}


# =====================================================
# ADMISSION SCHEMAS
# =====================================================

class AdmissionCreate(BaseModel):
    student_id: int
    session_id: int
    term_id: Optional[int] = None


class AdmissionUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None


class AdmissionResponse(BaseModel):
    id: int
    student_id: int
    session_id: int
    term_id: Optional[int]

    admission_date: datetime
    status: str

    remarks: Optional[str]

    model_config = {"from_attributes": True}


# =====================================================
# AUDIT LOG SCHEMAS
# =====================================================

class AuditLogCreate(BaseModel):
    user_id: Optional[int] = None
    user_role: Optional[str] = None
    action: str
    target: Optional[str] = None
    extra_data: Optional[Dict] = None


class AuditLogResponse(AuditLogCreate):
    id: int
    timestamp: datetime

    model_config = {"from_attributes": True}



# =====================================================
# REBUILD FORWARD REFERENCES
# =====================================================

ScoreResponse.model_rebuild()