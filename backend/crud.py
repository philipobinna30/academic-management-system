

# =====================================================
# FIXED CRUD.PY
# FastAPI Dependency Injection Error Resolved
# =====================================================

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    BackgroundTasks,
    Query,
    Body
)

from fastapi.responses import (
    StreamingResponse,
    FileResponse
)

from sqlalchemy.orm import Session

from typing import (
    List,
    Optional
)

from datetime import datetime

from io import BytesIO

import os
import qrcode
import base64

from reportlab.platypus import (
    SimpleDocTemplate,
    PageBreak,
    Paragraph,
    Table,
    TableStyle,
    Spacer,
    Image
)

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from database import (
    get_db,
    SessionLocal
)

from models import (
    User,
    StudentProfile,
    Course,
    Score,
    Result,
    Admission,
    AuditLog,
    Subject,
    Term,
    AcademicSession,
    Parent,
    OnlineClass
)

from auth import (
    get_current_user,
    hash_password,
    create_verification_token,
    send_email,
    verification_email_html
)

from schemas import (
    UserCreateStudent,
    UserCreateAdmin,
    UserUpdate,
    UserResponse,

    CourseCreate,
    CourseUpdate,
    CourseResponse,

    ScoreCreate,
    ScoreUpdate,
    ScoreResponse,

    AdmissionCreate,
    AdmissionUpdate,

    SubjectCreate,
    SubjectUpdate,
    SubjectScoreOut,
    SubjectResponse,

    BulkCourseSubjectsCreate,

    ResultResponse,
    TranscriptResponse,

    SessionCreate,
    SessionResponse,

    TermCreate,
    TermResponse,

    ParentCreate,
    ParentUpdate,
    ParentResponse,

    OnlineClassCreate,
    OnlineClassUpdate,
    OnlineClassResponse,

    StudentProfileResponse,
    StudentUpdateRequest,
    StudentProfileUpdate
)
router = APIRouter(
    prefix="/students",
    tags=["Students"],
    dependencies=[Depends(get_current_user)]
)

APP_URL = os.getenv("APP_URL", "http://localhost:8000")
SCHOOL_LOGO_PATH = "static/logo.png"

SCHOOL_NAME = "MY APO SECONDARY SCHOOL"
SCHOOL_MOTTO = "The Sky Is Your Limit"
SCHOOL_ADDRESS = "Km 45 Lekki Epe Expressway"
SCHOOL_PHONE = "07032245886"
SCHOOL_EMAIL = "myaposs@gmail.com"
SCHOOL_WEBSITE = "www.aposchool.com"

# =====================================================
# ROLE CHECKS
# =====================================================

# ✅ FIXED
# NEVER USE Depends() INSIDE NORMAL UTILITY FUNCTIONS

def require_admin(current_user):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


# ✅ FIXED
def require_teacher_or_admin(current_user):

    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=403,
            detail="Admin or Teacher access required"
        )

    return current_user


# ✅ OPTIONAL OWNER CHECK
def require_owner_or_admin(
    account_id: int,
    current_user
):

    if current_user.role == "admin":
        return current_user

    if current_user.id != account_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    return current_user


# =====================================================
# AUDIT LOG
# =====================================================

def log_action(
    db: Session,
    user: User,
    action: str,
    target: Optional[str] = None,
    extra_data: Optional[dict] = None
):

    audit = AuditLog(
        user_id=user.id,
        user_role=user.role,
        action=action,
        target=target,
        extra_data=extra_data or {}
    )

    db.add(audit)
    db.commit()


# =====================================================
# GRADE CALCULATOR
# =====================================================

def calculate_grade(score: float):

    if score >= 70:
        return "A", "Excellent"

    elif score >= 60:
        return "B", "Very Good"

    elif score >= 50:
        return "C", "Good"

    elif score >= 45:
        return "D", "Pass"

    elif score >= 40:
        return "E", "Weak Pass"

    return "F", "Fail"


# =====================================================
# STUDENT ANALYTICS
# =====================================================

def update_student_analytics(
    db: Session,
    student_profile_id: int
):

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_profile_id
    ).first()

    if not student:
        return

    term = db.query(Term).filter(
        Term.is_active == True,
        Term.is_closed == False
    ).first()

    if not term:
        return

    scores = db.query(Score).filter(
        Score.student_id == student_profile_id,
        Score.term_id == term.id
    ).all()

    if not scores:

        student.total_score = 0
        student.average_score = 0
        student.gpa = 0
        student.remarks = "No scores yet"

        result = db.query(Result).filter(
            Result.student_id == student_profile_id,
            Result.term_id == term.id
        ).first()

        if not result:

            result = Result(
                student_id=student_profile_id,
                course_id=student.course_id,
                term_id=term.id,
                session_id=term.session_id,
                total_score=0,
                average_score=0,
                gpa=0,
                remarks="No scores yet",
                subjects=[],
                is_locked=False,
                published=False
            )

            db.add(result)

        db.commit()
        return

    total = sum(s.marks for s in scores)

    average = round(
        total / len(scores),
        2
    )

    def grade_point(mark):

        if mark >= 70:
            return 5

        if mark >= 60:
            return 4

        if mark >= 50:
            return 3

        if mark >= 45:
            return 2

        if mark >= 40:
            return 1

        return 0

    gpa = round(
        sum(
            grade_point(s.marks)
            for s in scores
        ) / len(scores),
        2
    )

    remarks = (
        "Excellent" if average >= 75 else
        "Very Good" if average >= 60 else
        "Good" if average >= 50 else
        "Fair" if average >= 40 else
        "Needs Improvement"
    )

    result = db.query(Result).filter(
        Result.student_id == student_profile_id,
        Result.term_id == term.id
    ).first()

    if not result:

        result = Result(
            student_id=student_profile_id,
            course_id=student.course_id,
            term_id=term.id,
            session_id=term.session_id,
            total_score=0,
            average_score=0,
            gpa=0,
            remarks="",
            subjects=[],
            is_locked=False,
            published=False
        )

        db.add(result)
        db.flush()

    if result.is_locked:
        return

    result.total_score = total
    result.average_score = average
    result.gpa = gpa
    result.remarks = remarks

    # ✅ SAFE JSON FORMAT
    result.subjects = [
        {
            "subject_id": s.subject_id,
            "marks": s.marks,
            "subject": {
                "id": s.subject.id,
                "name": s.subject.name,
                "course_id": s.subject.course_id
            }
        }
        for s in scores
    ]

    student.total_score = total
    student.average_score = average
    student.gpa = gpa
    student.remarks = remarks

    db.commit()

    students_in_term = db.query(StudentProfile).join(
        Result,
        Result.student_id == StudentProfile.id
    ).filter(
        StudentProfile.course_id == student.course_id,
        Result.term_id == term.id
    ).all()

    ranked_students = sorted(
        students_in_term,
        key=lambda s: s.average_score or 0,
        reverse=True
    )

    for index, s in enumerate(ranked_students, start=1):

        s.position = index

        res = db.query(Result).filter(
            Result.student_id == s.id,
            Result.term_id == term.id
        ).first()

        if res and not res.is_locked:
            res.position = index

    db.commit()


# =====================================================
# BACKGROUND TASK
# =====================================================

def update_student_analytics_task(student_id: int):

    db = SessionLocal()

    try:
        update_student_analytics(db, student_id)

    finally:
        db.close()




# ======================================================
# COURSES CRUD
# ======================================================

@router.post("/courses/", response_model=CourseResponse)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    course = Course(**data.dict())
    db.add(course)
    db.commit()
    db.refresh(course)

    log_action(db, current_user, "create_course", f"Course {course.name}")
    return course


@router.get("/courses", response_model=List[CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)
    return db.query(Course).all()


@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course


@router.patch("/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)

    log_action(db, current_user, "update_course", f"Course {course_id}")
    return course


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()

    log_action(db, current_user, "delete_course", f"Course {course_id}")
    return {"message": "Course deleted successfully"}


# ======================================================
# BULK SUBJECT ASSIGNMENT
# ======================================================

@router.post("/courses/{course_id}/subjects/bulk", response_model=List[SubjectResponse])
def bulk_assign_subjects(
    course_id: int,
    data: BulkCourseSubjectsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    # Ensure course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    subjects = []

    for name in data.subjects:
        # Skip duplicates in same course
        existing = db.query(Subject).filter(
            Subject.name == name,
            Subject.course_id == course_id
        ).first()

        if existing:
            continue

        sub = Subject(name=name, course_id=course_id)
        db.add(sub)
        db.flush()   # get ID without committing yet
        db.refresh(sub)

        subjects.append(sub)

        log_action(
            db,
            current_user,
            "create_subject_bulk",
            f"Course {course_id}, Subject {name}"
        )

    db.commit()
    return subjects




# ======================================================
# GET ALL SUBJECTS
# ======================================================
@router.get(
    "/subjects",
    response_model=List[SubjectResponse]
)
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    subjects = db.query(Subject).all()

    return subjects


# ======================================================
# GET SUBJECTS BY COURSE
# ======================================================
@router.get(
    "/subjects/course/{course_id}",
    response_model=List[SubjectResponse]
)
def get_subjects_by_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    subjects = db.query(Subject).filter(
        Subject.course_id == course_id
    ).all()

    return subjects

# ======================================================
# CREATE SUBJECT
# ======================================================
@router.post("/subjects", response_model=SubjectResponse)
def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    existing = db.query(Subject).filter(
        Subject.name == data.name,
        Subject.course_id == data.course_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Subject name already exists in this course"
        )

    subject = Subject(name=data.name, course_id=data.course_id)

    db.add(subject)
    db.commit()
    db.refresh(subject)

    log_action(db, current_user, "create_subject", f"Subject {subject.name}")
    return subject


# ======================================================
# GET SINGLE SUBJECT
# ======================================================
@router.get(
    "/subjects/{subject_id}",
    response_model=SubjectResponse
)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    subject = db.query(Subject).filter(
        Subject.id == subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    return subject
# ======================================================
# UPDATE SUBJECT
# ======================================================
@router.patch("/subjects/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: int,
    updates: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    subject = db.query(Subject).filter(Subject.id == subject_id).first()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    data = updates.model_dump(exclude_unset=True)

    new_name = data.get("name", subject.name)
    new_course_id = data.get("course_id", subject.course_id)

    duplicate = db.query(Subject).filter(
        Subject.name == new_name,
        Subject.course_id == new_course_id,
        Subject.id != subject.id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Subject name already exists in this course"
        )

    for field, value in data.items():
        setattr(subject, field, value)

    db.commit()
    db.refresh(subject)

    log_action(db, current_user, "update_subject", f"Subject {subject.name}")
    return subject


# ======================================================
# DELETE SUBJECT
# ======================================================
@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    subject = db.query(Subject).filter(Subject.id == subject_id).first()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db.delete(subject)
    db.commit()

    log_action(db, current_user, "delete_subject", f"Subject {subject.name}")

    return {"message": "Subject deleted successfully"}





# ==================== ACADEMIC SESSIONS ====================

# ======================================================
# GET ALL SESSIONS
# ======================================================
@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AcademicSession).all()


# ======================================================
# CREATE SESSION
# ======================================================
@router.post("/sessions", response_model=SessionResponse)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    session = AcademicSession(
        name=data.name,
        is_active=True
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    log_action(db, current_user, "create_session", session.name)
    return session


# ======================================================
# GET SINGLE SESSION
# ======================================================
@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AcademicSession).filter(
        AcademicSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


# ======================================================
# ACTIVATE SESSION
# ======================================================
@router.patch("/sessions/{session_id}/activate")
def activate_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    session = db.query(AcademicSession).filter(
        AcademicSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Deactivate all sessions first
    db.query(AcademicSession).update({"is_active": False})

    # Activate selected session
    session.is_active = True

    db.commit()

    log_action(db, current_user, "activate_session", f"session_id={session.id}")
    return {"message": "Session activated successfully"}


# ======================================================
# DELETE SESSION
# ======================================================
@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    session = db.query(AcademicSession).filter(
        AcademicSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()

    log_action(db, current_user, "delete_session", session.name)

    return {"message": "Session deleted successfully"}







# ==================== ACADEMIC TERMS ====================

# ======================================================
# GET ALL TERMS
# ======================================================
@router.get("/terms", response_model=List[TermResponse])
def get_terms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Term).all()



# ======================================================
# CREATE TERM
# ======================================================
@router.post("/terms", response_model=TermResponse)
def create_term(
    data: TermCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    # Check if session already has an active term
    active_term = db.query(Term).filter(
        Term.session_id == data.session_id,
        Term.is_active == True,
        Term.is_closed == False
    ).first()

    term = Term(
        name=data.name,
        session_id=data.session_id,
        is_active=False if active_term else True,
        is_closed=False
    )

    db.add(term)
    db.commit()
    db.refresh(term)

    log_action(
        db,
        current_user,
        "create_term",
        term.name
    )

    return term


# ======================================================
# GET ACTIVE TERM
# ======================================================
@router.get("/terms/active", response_model=TermResponse)
def get_active_term(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    term = db.query(Term).filter(
        Term.is_active == True,
        Term.is_closed == False
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="No active term found"
        )

    return term


# ======================================================
# GET SINGLE TERM
# ======================================================
@router.get("/terms/{term_id}", response_model=TermResponse)
def get_term(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    term = db.query(Term).filter(Term.id == term_id).first()

    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    return term


# ======================================================
# ACTIVATE TERM
# ======================================================
@router.patch("/terms/{term_id}/activate")
def activate_term(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    term = db.query(Term).filter(
        Term.id == term_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    if term.is_closed:
        raise HTTPException(
            status_code=400,
            detail="Cannot activate closed term"
        )

    # Deactivate all other terms in this session
    db.query(Term).filter(
        Term.session_id == term.session_id
    ).update(
        {"is_active": False},
        synchronize_session=False
    )

    term.is_active = True

    db.commit()
    db.refresh(term)

    log_action(
        db,
        current_user,
        "activate_term",
        f"term_id={term.id}"
    )

    return {
        "message": "Term activated successfully"
    }

# ======================================================
# CLOSE TERM
# ======================================================
@router.patch("/terms/{term_id}/close")
def close_term(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    term = db.query(Term).filter(
        Term.id == term_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    if term.is_closed:
        raise HTTPException(
            status_code=400,
            detail="Term already closed"
        )

    results = db.query(Result).filter(
        Result.term_id == term.id
    ).all()

    if not results:
        raise HTTPException(
            status_code=400,
            detail="Cannot close term without results"
        )

    term.is_closed = True
    term.is_active = False

    for result in results:
        result.is_locked = True

    db.commit()
    db.refresh(term)

    log_action(
        db,
        current_user,
        "close_term",
        f"term_id={term.id}"
    )

    return {
        "message": "Term closed and results locked"
    }
# ======================================================
# PUBLISH TERM RESULTS
# ======================================================
@router.patch("/terms/{term_id}/publish")
def publish_term_results(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    term = db.query(Term).filter(
        Term.id == term_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    if not term.is_closed:
        raise HTTPException(
            status_code=400,
            detail="Close term before publishing"
        )

    results = db.query(Result).filter(
        Result.term_id == term.id
    ).all()

    if not results:
        raise HTTPException(
            status_code=400,
            detail="No results found for this term"
        )

    for result in results:
        if not result.is_locked:
            raise HTTPException(
                status_code=400,
                detail="All results must be locked before publishing"
            )

        result.published = True

    db.commit()

    log_action(
        db,
        current_user,
        "publish_term",
        f"term_id={term.id}"
    )

    return {
        "message": "Results published successfully"
    }
# ======================================================
# DELETE TERM
# ======================================================
@router.delete("/terms/{term_id}")
def delete_term(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    term = db.query(Term).filter(Term.id == term_id).first()

    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    # Delete related scores
    db.query(Score).filter(
        Score.term_id == term_id
    ).delete(synchronize_session=False)

    # Delete related results
    db.query(Result).filter(
        Result.term_id == term_id
    ).delete(synchronize_session=False)

    # Delete related online classes
    db.query(OnlineClass).filter(
        OnlineClass.term_id == term_id
    ).delete(synchronize_session=False)

    # Delete term
    db.delete(term)
    db.commit()

    log_action(db, current_user, "delete_term", term.name)

    return {
        "message": "Term and all related scores, results, and online classes deleted successfully"
    }





# ==================== PARENTS ====================

# ======================================================
# GET ALL PARENTS
# ======================================================
@router.get("/parents", response_model=List[ParentResponse])
def get_parents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Parent).all()


# ======================================================
# CREATE PARENT
# ======================================================
@router.post("/parents", response_model=ParentResponse)
def create_parent(
    data: ParentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    try:
        # Check duplicate email
        if db.query(Parent).filter(
            Parent.email == data.email
        ).first():
            raise HTTPException(
                status_code=400,
                detail="Parent email already exists"
            )

        # Check duplicate phone
        if db.query(Parent).filter(
            Parent.phone == data.phone
        ).first():
            raise HTTPException(
                status_code=400,
                detail="Parent phone number already exists"
            )

        parent = Parent(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone
        )

        db.add(parent)
        db.commit()
        db.refresh(parent)

        log_action(
            db,
            current_user,
            "create_parent",
            parent.email
        )

        return parent

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ======================================================
# GET SINGLE PARENT
# ======================================================
@router.get("/parents/{parent_id}", response_model=ParentResponse)
def get_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parent = db.query(Parent).filter(
        Parent.id == parent_id
    ).first()

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found"
        )

    return parent


# ======================================================
# UPDATE PARENT
# ======================================================
@router.patch("/parents/{parent_id}", response_model=ParentResponse)
def update_parent(
    parent_id: int,
    updates: ParentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    parent = db.query(Parent).filter(
        Parent.id == parent_id
    ).first()

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found"
        )

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(parent, field, value)

    db.commit()
    db.refresh(parent)

    log_action(
        db,
        current_user,
        "update_parent",
        parent.full_name
    )

    return parent


# ======================================================
# DELETE PARENT
# ======================================================
@router.delete("/parents/{parent_id}")
def delete_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    parent = db.query(Parent).filter(
        Parent.id == parent_id
    ).first()

    if not parent:
        raise HTTPException(
            status_code=404,
            detail="Parent not found"
        )

    # Detach linked students
    students = db.query(StudentProfile).filter(
        StudentProfile.parent_id == parent.id
    ).all()

    for student in students:
        student.parent_id = None

    db.delete(parent)
    db.commit()

    log_action(
        db,
        current_user,
        "delete_parent",
        parent.full_name
    )

    return {
        "message": "Parent deleted successfully"
    }






# ==================== TEACHERS ====================

# ======================================================
# CREATE TEACHER
# ======================================================
@router.post("/teachers", response_model=UserResponse)
def create_teacher(
    data: UserCreateAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    existing = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    teacher = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        is_verified=True,
        is_active=True,
        role="teacher",
        permissions=[]
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    log_action(
        db,
        current_user,
        "create_teacher",
        teacher.email
    )

    return teacher


# ======================================================
# GET ALL TEACHERS
# ======================================================
@router.get("/teachers", response_model=List[UserResponse])
def get_all_teachers(
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    query = db.query(User).filter(
        User.role == "teacher"
    )

    if search:
        query = query.filter(
            User.full_name.ilike(f"%{search}%")
        )

    return query.offset(skip).limit(limit).all()


# ======================================================
# GET SINGLE TEACHER
# ======================================================
@router.get("/teachers/{teacher_id}", response_model=UserResponse)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_owner_or_admin(teacher_id, current_user)

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    return teacher


# ======================================================
# UPDATE TEACHER
# ======================================================
@router.patch("/teachers/{teacher_id}", response_model=UserResponse)
def update_teacher(
    teacher_id: int,
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_owner_or_admin(teacher_id, current_user)

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    if updates.full_name:
        teacher.full_name = updates.full_name

    if updates.email:
        existing = db.query(User).filter(
            User.email == updates.email,
            User.id != teacher_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already in use"
            )

        teacher.email = updates.email

    if getattr(updates, "password", None):
        teacher.password_hash = hash_password(
            updates.password
        )

    db.commit()
    db.refresh(teacher)

    log_action(
        db,
        current_user,
        "update_teacher",
        teacher.email
    )

    return teacher


# ======================================================
# DELETE TEACHER
# ======================================================
@router.delete("/teachers/{teacher_id}")
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    courses = db.query(Course).filter(
        Course.teacher_id == teacher_id
    ).all()

    for course in courses:
        course.teacher_id = None

    db.delete(teacher)
    db.commit()

    log_action(
        db,
        current_user,
        "delete_teacher",
        teacher.email
    )

    return {
        "message": "Teacher deleted successfully"
    }


# ======================================================
# ASSIGN COURSE TO TEACHER
# ======================================================
@router.patch("/teachers/{teacher_id}/assign-course/{course_id}")
def assign_course(
    teacher_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if course.teacher_id == teacher_id:
        raise HTTPException(
            status_code=400,
            detail="Course already assigned to this teacher"
        )

    course.teacher_id = teacher_id

    db.commit()

    log_action(
        db,
        current_user,
        "assign_course",
        teacher.email
    )

    return {
        "message": "Course assigned successfully"
    }


# ======================================================
# REMOVE COURSE FROM TEACHER
# ======================================================
@router.patch("/teachers/{teacher_id}/remove-course/{course_id}")
def remove_course(
    teacher_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)

    course = db.query(Course).filter(
        Course.id == course_id,
        Course.teacher_id == teacher_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not assigned to this teacher"
        )

    course.teacher_id = None

    db.commit()

    log_action(
        db,
        current_user,
        "remove_course",
        str(course_id)
    )

    return {
        "message": "Course removed successfully"
    }


# ======================================================
# GET TEACHER COURSES
# ======================================================
@router.get(
    "/teachers/{teacher_id}/courses",
    response_model=List[CourseResponse]
)
def get_teacher_courses(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    courses = db.query(Course).filter(
        Course.teacher_id == teacher_id
    ).all()

    return courses



# ======================================================
# GET TEACHER STUDENTS
# ======================================================
@router.get(
    "/teachers/{teacher_id}/students",
    response_model=List[StudentProfileResponse]
)
def get_teacher_students(
    teacher_id: int,
    course_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    print("Teacher ID:", teacher_id)

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    print("Teacher:", teacher)

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    courses = db.query(Course).filter(
        Course.teacher_id == teacher_id
    ).all()

    print("Courses:", courses)

    if not courses:
        return []

    course_ids = [course.id for course in courses]

    print("Course IDs:", course_ids)

    query = db.query(StudentProfile).filter(
        StudentProfile.course_id.in_(course_ids)
    )

    # Optional frontend filter
    if course_id is not None:
        query = query.filter(
            StudentProfile.course_id == course_id
        )

    students = query.all()

    print("Students:", students)

    return students
# ======================================================
# GET SINGLE TEACHER STUDENT
# ======================================================
@router.get(
    "/teachers/{teacher_id}/students/{student_id}",
    response_model=StudentProfileResponse
)
def get_teacher_student(
    teacher_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if (
        not student.course
        or student.course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Student not assigned to this teacher"
        )

    return student


# ======================================================
# GET TEACHER SUBJECTS
# ======================================================
# ======================================================
# GET TEACHER SUBJECTS
# ======================================================
@router.get(
    "/teachers/{teacher_id}/subjects",
    response_model=List[SubjectResponse]
)
def get_teacher_subjects(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    courses = db.query(Course).filter(
        Course.teacher_id == teacher_id
    ).all()

    if not courses:
        return []

    course_ids = [c.id for c in courses]

    subjects = db.query(Subject).filter(
        Subject.course_id.in_(course_ids)
    ).all()

    return subjects


# ======================================================
# GET TEACHER SCORES
# ======================================================
@router.get(
    "/teachers/{teacher_id}/scores",
    response_model=List[ScoreResponse]
)
def get_teacher_scores(
    teacher_id: int,
    term_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    teacher_courses = db.query(Course).filter(
        Course.teacher_id == teacher_id
    ).all()

    if not teacher_courses:
        return []

    course_ids = [
        course.id
        for course in teacher_courses
    ]

    query = db.query(Score).filter(
        Score.course_id.in_(course_ids)
    )

    if term_id is not None:
        query = query.filter(
            Score.term_id == term_id
        )

    if subject_id is not None:
        query = query.filter(
            Score.subject_id == subject_id
        )

    if student_id is not None:
        query = query.filter(
            Score.student_id == student_id
        )

    scores = query.all()

    return scores




# ======================================================
# TEACHER CREATE SCORE
# ======================================================
# ======================================================
# TEACHER CREATE SCORE
# ======================================================
@router.post(
    "/teachers/{teacher_id}/scores",
    response_model=ScoreResponse
)
def teacher_create_score(
    teacher_id: int,
    data: ScoreCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    student = db.query(StudentProfile).filter(
        StudentProfile.id == data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    subject = db.query(Subject).filter(
        Subject.id == data.subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    # ======================================================
    # ENSURE SUBJECT BELONGS TO STUDENT COURSE
    # ======================================================
    if subject.course_id != student.course_id:
        raise HTTPException(
            status_code=400,
            detail="Selected subject does not belong to the student's course."
        )

    course = db.query(Course).filter(
        Course.id == subject.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if (
        current_user.role == "teacher"
        and course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only score students in your assigned course."
        )

    term = db.query(Term).filter(
        Term.id == data.term_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    # ======================================================
    # BLOCK MODIFICATION OF CLOSED/LOCKED RESULTS
    # ======================================================
    result = db.query(Result).filter(
        Result.student_id == data.student_id,
        Result.term_id == data.term_id
    ).first()

    if result and result.is_locked:
        raise HTTPException(
            status_code=403,
            detail="This term has been locked. Scores can no longer be modified."
        )

    # ======================================================
    # PREVENT DUPLICATE SCORE ENTRY
    # ======================================================
    existing = db.query(Score).filter(
        Score.student_id == data.student_id,
        Score.subject_id == data.subject_id,
        Score.term_id == data.term_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Score already exists. Please edit the existing record."
        )

    # ======================================================
    # CREATE SCORE
    # ======================================================
    score = Score(
        student_id=data.student_id,
        course_id=course.id,
        subject_id=data.subject_id,
        term_id=data.term_id,
        marks=data.marks
    )

    db.add(score)
    db.commit()
    db.refresh(score)

    background_tasks.add_task(
        update_student_analytics_task,
        score.student_id
    )

    log_action(
        db,
        current_user,
        "teacher_create_score",
        str(score.id)
    )

    return score




# ======================================================
# TEACHER UPDATE SCORE
# ======================================================
@router.patch(
    "/teachers/{teacher_id}/scores/{score_id}",
    response_model=ScoreResponse
)
def teacher_update_score(
    teacher_id: int,
    score_id: int,
    data: ScoreUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    score = db.query(Score).filter(
        Score.id == score_id
    ).first()

    if not score:
        raise HTTPException(
            status_code=404,
            detail="Score not found"
        )

    # ======================================================
    # BLOCK MODIFICATION OF CLOSED/LOCKED RESULTS
    # ======================================================
    result = db.query(Result).filter(
        Result.student_id == score.student_id,
        Result.term_id == score.term_id
    ).first()

    if result and result.is_locked:
        raise HTTPException(
            status_code=403,
            detail="This term has been locked. Scores can no longer be modified."
        )

    student = db.query(StudentProfile).filter(
        StudentProfile.id == score.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    subject = db.query(Subject).filter(
        Subject.id == score.subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    course = db.query(Course).filter(
        Course.id == subject.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if (
        current_user.role == "teacher"
        and course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update scores for this course."
        )

    # ======================================================
    # UPDATE SCORE
    # ======================================================
    update_data = data.model_dump(
        exclude_unset=True
    )

    # ======================================================
    # IF SUBJECT IS CHANGED
    # ======================================================
    if "subject_id" in update_data:

        new_subject = db.query(Subject).filter(
            Subject.id == update_data["subject_id"]
        ).first()

        if not new_subject:
            raise HTTPException(
                status_code=404,
                detail="Subject not found"
            )

        if new_subject.course_id != student.course_id:
            raise HTTPException(
                status_code=400,
                detail="Selected subject does not belong to the student's course."
            )

        new_course = db.query(Course).filter(
            Course.id == new_subject.course_id
        ).first()

        if (
            current_user.role == "teacher"
            and new_course.teacher_id != teacher_id
        ):
            raise HTTPException(
                status_code=403,
                detail="You can only assign subjects from your own course."
            )

        duplicate = db.query(Score).filter(
            Score.student_id == score.student_id,
            Score.subject_id == update_data["subject_id"],
            Score.term_id == score.term_id,
            Score.id != score.id
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Score already exists. Please edit the existing record."
            )

        score.subject_id = update_data["subject_id"]
        score.course_id = new_course.id

    # ======================================================
    # IF TERM IS CHANGED
    # ======================================================
    if "term_id" in update_data:

        term = db.query(Term).filter(
            Term.id == update_data["term_id"]
        ).first()

        if not term:
            raise HTTPException(
                status_code=404,
                detail="Term not found"
            )

        duplicate = db.query(Score).filter(
            Score.student_id == score.student_id,
            Score.subject_id == score.subject_id,
            Score.term_id == update_data["term_id"],
            Score.id != score.id
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Score already exists. Please edit the existing record."
            )

        score.term_id = update_data["term_id"]

    # ======================================================
    # UPDATE MARKS
    # ======================================================
    if "marks" in update_data:

        if (
            update_data["marks"] < 0
            or update_data["marks"] > 100
        ):
            raise HTTPException(
                status_code=400,
                detail="Marks must be between 0 and 100."
            )

        score.marks = update_data["marks"]

    db.commit()
    db.refresh(score)

    background_tasks.add_task(
        update_student_analytics_task,
        score.student_id
    )

    log_action(
        db,
        current_user,
        "teacher_update_score",
        str(score.id)
    )

    return score


# ======================================================
# TEACHER BULK CREATE SCORES
# ======================================================
@router.post(
    "/teachers/{teacher_id}/scores/bulk",
    response_model=List[ScoreResponse]
)
def teacher_bulk_create_scores(
    teacher_id: int,
    scores: List[ScoreCreate],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    # ======================================================
    # CHECK FOR DUPLICATE SCORES FIRST
    # ======================================================
    duplicate_scores = []

    for data in scores:

        existing = db.query(Score).filter(
            Score.student_id == data.student_id,
            Score.subject_id == data.subject_id,
            Score.term_id == data.term_id
        ).first()

        if existing:
            duplicate_scores.append(
                f"Student {data.student_id} | Subject {data.subject_id}"
            )

    if duplicate_scores:
        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "One or more scores already exist. "
                    "Please edit the existing records."
                ),
                "duplicates": duplicate_scores
            }
        )

    created_scores = []

    affected_students = set()

    for data in scores:

        student = db.query(StudentProfile).filter(
            StudentProfile.id == data.student_id
        ).first()

        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student {data.student_id} not found"
            )

        subject = db.query(Subject).filter(
            Subject.id == data.subject_id
        ).first()

        if not subject:
            raise HTTPException(
                status_code=404,
                detail=f"Subject {data.subject_id} not found"
            )

        # ======================================================
        # ENSURE SUBJECT BELONGS TO STUDENT COURSE
        # ======================================================
        if subject.course_id != student.course_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Subject {subject.id} does not belong "
                    f"to Student {student.id}'s course."
                )
            )

        course = db.query(Course).filter(
            Course.id == subject.course_id
        ).first()

        if not course:
            raise HTTPException(
                status_code=404,
                detail=f"Course not found for Subject {data.subject_id}"
            )

        if (
            current_user.role == "teacher"
            and course.teacher_id != teacher_id
        ):
            raise HTTPException(
                status_code=403,
                detail="You can only score students in your assigned course."
            )

        term = db.query(Term).filter(
            Term.id == data.term_id
        ).first()

        if not term:
            raise HTTPException(
                status_code=404,
                detail=f"Term {data.term_id} not found"
            )

        # ======================================================
        # BLOCK MODIFICATION OF CLOSED/LOCKED RESULTS
        # ======================================================
        result = db.query(Result).filter(
            Result.student_id == data.student_id,
            Result.term_id == data.term_id
        ).first()

        if result and result.is_locked:
            raise HTTPException(
                status_code=403,
                detail=f"Student {data.student_id} result for this term is locked."
            )

        score = Score(
            student_id=data.student_id,
            subject_id=data.subject_id,
            course_id=course.id,
            term_id=data.term_id,
            marks=data.marks
        )

        db.add(score)

        db.flush()

        created_scores.append(score)

        affected_students.add(score.student_id)

    db.commit()

    for score in created_scores:
        db.refresh(score)

    for student_id in affected_students:
        background_tasks.add_task(
            update_student_analytics_task,
            student_id
        )

    log_action(
        db,
        current_user,
        "teacher_bulk_create_scores",
        f"{len(created_scores)} scores"
    )

    return created_scores



# ======================================================
# TEACHER DELETE SCORE
# ======================================================
@router.delete(
    "/teachers/{teacher_id}/scores/{score_id}"
)
def teacher_delete_score(
    teacher_id: int,
    score_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    score = db.query(Score).filter(
        Score.id == score_id
    ).first()

    if not score:
        raise HTTPException(
            status_code=404,
            detail="Score not found"
        )

    # ======================================================
    # BLOCK MODIFICATION OF CLOSED/LOCKED RESULTS
    # ======================================================
    result = db.query(Result).filter(
        Result.student_id == score.student_id,
        Result.term_id == score.term_id
    ).first()

    if result and result.is_locked:
        raise HTTPException(
            status_code=403,
            detail="This term has been locked. Score deletion is not allowed."
        )

    course = db.query(Course).filter(
        Course.id == score.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if (
        current_user.role == "teacher"
        and course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete scores for this course."
        )

    student_id = score.student_id

    db.delete(score)
    db.commit()

    background_tasks.add_task(
        update_student_analytics_task,
        student_id
    )

    log_action(
        db,
        current_user,
        "teacher_delete_score",
        str(score_id)
    )

    return {
        "message": "Score deleted successfully"
    }


# ======================================================
# TEACHER CREATE ONLINE CLASS
# ======================================================
@router.post(
    "/teachers/{teacher_id}/online-classes",
    response_model=OnlineClassResponse
)
def teacher_create_online_class(
    teacher_id: int,
    data: OnlineClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    subject = db.query(Subject).filter(
        Subject.id == data.subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    course = db.query(Course).filter(
        Course.id == subject.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if (
        current_user.role == "teacher"
        and course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only create online classes for your assigned subjects."
        )

    term = db.query(Term).filter(
        Term.id == data.term_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    online_class = OnlineClass(
        title=data.title,
        description=data.description,
        meeting_link=data.meeting_link,
        subject_id=data.subject_id,
        term_id=data.term_id,
        start_time=data.start_time,
        end_time=data.end_time
    )

    db.add(online_class)
    db.commit()
    db.refresh(online_class)

    log_action(
        db,
        current_user,
        "teacher_create_online_class",
        online_class.title
    )

    return online_class




# ======================================================
# TEACHER UPDATE ONLINE CLASS
# ======================================================
@router.patch(
    "/teachers/{teacher_id}/online-classes/{class_id}",
    response_model=OnlineClassResponse
)
def teacher_update_online_class(
    teacher_id: int,
    class_id: int,
    updates: OnlineClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    # --------------------------------------------------
    # Teacher can only edit his own resources
    # --------------------------------------------------
    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    online_class = db.query(OnlineClass).filter(
        OnlineClass.id == class_id
    ).first()

    if not online_class:
        raise HTTPException(
            status_code=404,
            detail="Online class not found"
        )

    # --------------------------------------------------
    # Validate ownership
    # --------------------------------------------------
    subject = db.query(Subject).filter(
        Subject.id == online_class.subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    course = db.query(Course).filter(
        Course.id == subject.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if (
        current_user.role == "teacher"
        and course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this course."
        )

    # --------------------------------------------------
    # If subject is changing, validate new subject
    # --------------------------------------------------
    update_data = updates.model_dump(
        exclude_unset=True
    )

    if "subject_id" in update_data:

        new_subject = db.query(Subject).filter(
            Subject.id == update_data["subject_id"]
        ).first()

        if not new_subject:
            raise HTTPException(
                status_code=404,
                detail="New subject not found"
            )

        new_course = db.query(Course).filter(
            Course.id == new_subject.course_id
        ).first()

        if (
            current_user.role == "teacher"
            and new_course.teacher_id != teacher_id
        ):
            raise HTTPException(
                status_code=403,
                detail="You cannot move this online class to another teacher's subject."
            )

    # --------------------------------------------------
    # Update fields
    # --------------------------------------------------
    for field, value in update_data.items():
        setattr(
            online_class,
            field,
            value
        )

    db.commit()
    db.refresh(online_class)

    log_action(
        db,
        current_user,
        "teacher_update_online_class",
        str(online_class.id)
    )

    return online_class



# ======================================================
# TEACHER DELETE ONLINE CLASS
# ======================================================
@router.delete(
    "/teachers/{teacher_id}/online-classes/{class_id}"
)
def teacher_delete_online_class(
    teacher_id: int,
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    # --------------------------------------------------
    # Teachers can only manage their own classes
    # --------------------------------------------------
    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    online_class = db.query(OnlineClass).filter(
        OnlineClass.id == class_id
    ).first()

    if not online_class:
        raise HTTPException(
            status_code=404,
            detail="Online class not found"
        )

    subject = db.query(Subject).filter(
        Subject.id == online_class.subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    course = db.query(Course).filter(
        Course.id == subject.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if (
        current_user.role == "teacher"
        and course.teacher_id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot delete online classes outside your assigned course."
        )

    db.delete(online_class)
    db.commit()

    log_action(
        db,
        current_user,
        "teacher_delete_online_class",
        str(class_id)
    )

    return {
        "message": "Online class deleted successfully"
    }


# ======================================================
# GET TEACHER ONLINE CLASSES
# ======================================================
@router.get(
    "/teachers/{teacher_id}/online-classes",
    response_model=List[OnlineClassResponse]
)
def get_teacher_online_classes(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    if (
        current_user.role == "teacher"
        and current_user.id != teacher_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    courses = db.query(Course).filter(
        Course.teacher_id == teacher_id
    ).all()

    if not courses:
        return []

    course_ids = [c.id for c in courses]

    subjects = db.query(Subject).filter(
        Subject.course_id.in_(course_ids)
    ).all()

    if not subjects:
        return []

    subject_ids = [s.id for s in subjects]

    classes = db.query(OnlineClass).filter(
        OnlineClass.subject_id.in_(subject_ids)
    ).all()

    return classes


# ==================== SCORES ====================

# ======================================================
# GET ALL SCORES
# ======================================================
@router.get("/scores", response_model=List[ScoreResponse])
def get_scores(
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    query = db.query(Score)

    if student_id:
        query = query.filter(
            Score.student_id == student_id
        )

    return query.all()


# ======================================================
# CREATE SCORE
# ======================================================
# ======================================================
# CREATE SCORE
# ======================================================
@router.post("/scores", response_model=ScoreResponse)
def create_score(
    data: ScoreCreate,
    db: Session = Depends(get_db),
    current_user: User =Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    student = db.query(StudentProfile).filter(
        StudentProfile.id == data.student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    result = db.query(Result).filter(
        Result.student_id == student.id,
        Result.term_id == data.term_id
    ).first()

    if result and result.is_locked:
        raise HTTPException(
            status_code=400,
            detail="Result is locked. Cannot add score."
        )

    existing = db.query(Score).filter(
        Score.student_id == student.id,
        Score.subject_id == data.subject_id,
        Score.term_id == data.term_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Score already exists. Please edit the existing record."
        )

    score = Score(
        student_id=student.id,
        course_id=student.course_id,
        subject_id=data.subject_id,
        term_id=data.term_id,
        marks=data.marks
    )

    db.add(score)
    db.commit()
    db.refresh(score)

    update_student_analytics(
        db,
        student.id
    )

    log_action(
        db,
        current_user,
        "create_score",
        f"student_id={student.id}"
    )

    return score


# ======================================================
# CREATE BULK SCORES
# ======================================================
# ======================================================
# CREATE BULK SCORES
# ======================================================
@router.post("/scores/bulk", response_model=List[ScoreResponse])
def create_bulk_scores(
    data: List[ScoreCreate],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    term = db.query(Term).filter(
        Term.is_active == True,
        Term.is_closed == False
    ).first()

    if not term:
        raise HTTPException(
            status_code=400,
            detail="No active term available"
        )

    created_scores = []

    affected_students = set()

    # ======================================================
    # VALIDATE ALL RECORDS FIRST
    # ======================================================

    for item in data:

        student = db.query(StudentProfile).filter(
            StudentProfile.id == item.student_id
        ).first()

        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student {item.student_id} not found."
            )

        existing = db.query(Score).filter(
            Score.student_id == student.id,
            Score.subject_id == item.subject_id,
            Score.term_id == term.id
        ).first()

        if existing:

            subject = db.query(Subject).filter(
                Subject.id == item.subject_id
            ).first()

            subject_name = (
                subject.name
                if subject
                else f"Subject {item.subject_id}"
            )

            raise HTTPException(
                status_code=409,
                detail=(
                    f"{student.user.full_name} already has a score for "
                    f"{subject_name}. "
                    "Please edit the existing record."
                )
            )

    # ======================================================
    # CREATE SCORES
    # ======================================================

    for item in data:

        student = db.query(StudentProfile).filter(
            StudentProfile.id == item.student_id
        ).first()

        score = Score(
            student_id=student.id,
            course_id=student.course_id,
            subject_id=item.subject_id,
            term_id=term.id,
            marks=item.marks
        )

        db.add(score)

        created_scores.append(score)

        affected_students.add(student.id)

    db.commit()

    for score in created_scores:
        db.refresh(score)

    for student_id in affected_students:
        background_tasks.add_task(
            update_student_analytics_task,
            student_id
        )

    log_action(
        db,
        current_user,
        "create_bulk_scores",
        f"Term {term.id} | Count {len(created_scores)}"
    )

    return created_scores

# ======================================================
# UPDATE SCORE
# ======================================================
@router.patch("/scores/{score_id}", response_model=ScoreResponse)
def update_score(
    score_id: int,
    data: ScoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    score = db.query(Score).filter(
        Score.id == score_id
    ).first()

    if not score:
        raise HTTPException(
            status_code=404,
            detail="Score not found"
        )

    result = db.query(Result).filter(
        Result.student_id == score.student_id,
        Result.term_id == score.term_id
    ).first()

    if result and result.is_locked:
        raise HTTPException(
            status_code=400,
            detail="Result is locked. Cannot modify score."
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(score, key, value)

    db.commit()
    db.refresh(score)

    update_student_analytics(
        db,
        score.student_id
    )

    log_action(
        db,
        current_user,
        "update_score",
        f"id={score_id}"
    )

    return score


# ======================================================
# DELETE SCORE
# ======================================================
@router.delete("/scores/{score_id}")
def delete_score(
    score_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    score = db.query(Score).filter(
        Score.id == score_id
    ).first()

    if not score:
        raise HTTPException(
            status_code=404,
            detail="Score not found"
        )

    result = db.query(Result).filter(
        Result.student_id == score.student_id,
        Result.term_id == score.term_id
    ).first()

    if result and result.is_locked:
        raise HTTPException(
            status_code=400,
            detail="Result is locked. Cannot delete score."
        )

    student_id = score.student_id

    db.delete(score)
    db.commit()

    update_student_analytics(
        db,
        student_id
    )

    log_action(
        db,
        current_user,
        "delete_score",
        f"id={score_id}"
    )

    return {
        "message": "Score deleted successfully"
    }






# ==================== ONLINE CLASSES ====================

# ======================================================
# GET ALL ONLINE CLASSES
# ======================================================
@router.get("/online-classes", response_model=List[OnlineClassResponse])
def get_online_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(OnlineClass).all()



@router.get(
    "/me/online-classes",
    response_model=List[OnlineClassResponse]
)
def get_my_online_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    return (
        db.query(OnlineClass)
        .join(
            Subject,
            OnlineClass.subject_id == Subject.id
        )
        .filter(
            Subject.course_id == profile.course_id
        )
        .all()
    )


# ======================================================
# CREATE ONLINE CLASS
# ======================================================
@router.post("/online-classes", response_model=OnlineClassResponse)
def create_online_class(
    data: OnlineClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    online_class = OnlineClass(
        title=data.title,
        description=data.description,
        meeting_link=data.meeting_link,
        subject_id=data.subject_id,
        term_id=data.term_id,
        start_time=data.start_time,
        end_time=data.end_time
    )

    db.add(online_class)
    db.commit()
    db.refresh(online_class)

    log_action(
        db,
        current_user,
        "create_online_class",
        online_class.title
    )

    return online_class


# ======================================================
# GET SINGLE ONLINE CLASS
# ======================================================
@router.get("/online-classes/{class_id}", response_model=OnlineClassResponse)
def get_online_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    online_class = db.query(OnlineClass).filter(
        OnlineClass.id == class_id
    ).first()

    if not online_class:
        raise HTTPException(
            status_code=404,
            detail="Online class not found"
        )

    return online_class


# ======================================================
# UPDATE ONLINE CLASS
# ======================================================
@router.patch("/online-classes/{class_id}", response_model=OnlineClassResponse)
def update_online_class(
    class_id: int,
    updates: OnlineClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    online_class = db.query(OnlineClass).filter(
        OnlineClass.id == class_id
    ).first()

    if not online_class:
        raise HTTPException(
            status_code=404,
            detail="Online class not found"
        )

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(online_class, field, value)

    db.commit()
    db.refresh(online_class)

    log_action(
        db,
        current_user,
        "update_online_class",
        online_class.title
    )

    return online_class


# ======================================================
# DELETE ONLINE CLASS
# ======================================================
@router.delete("/online-classes/{class_id}")
def delete_online_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_teacher_or_admin(current_user)

    online_class = db.query(OnlineClass).filter(
        OnlineClass.id == class_id
    ).first()

    if not online_class:
        raise HTTPException(
            status_code=404,
            detail="Online class not found"
        )

    db.delete(online_class)
    db.commit()

    log_action(
        db,
        current_user,
        "delete_online_class",
        online_class.title
    )

    return {
        "message": "Online class deleted successfully"
    }



# ======================================================
# STUDENT PROFILES (ADMIN)
# ======================================================
@router.get(
    "/profiles/all",
    response_model=List[StudentProfileResponse]
)
def get_student_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    return db.query(StudentProfile).all()


# ======================================================
# MY PROFILE (STUDENT)
# ======================================================
@router.get(
    "/me/profile",
    response_model=StudentProfileResponse
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Student access only")

    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    update_student_analytics(db, profile.id)
    db.refresh(profile)
    return profile


# ======================================================
# SINGLE PROFILE (BY PROFILE ID)
# ======================================================
@router.get(
    "/{student_id}/profile",
    response_model=StudentProfileResponse
)
def get_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if current_user.role == "student" and current_user.id != profile.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_student_analytics(db, profile.id)
    db.refresh(profile)
    return profile


# ======================================================
# VIEW RESULT
# ======================================================
@router.get(
    "/{student_id}/result",
    response_model=ResultResponse
)
def view_student_result(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if (
        current_user.role == "student"
        and current_user.id != student.user_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    # ======================================================
    # GET LATEST PUBLISHED RESULT
    # ======================================================

    result = (
        db.query(Result)
        .filter(
            Result.student_id == student.id,
            Result.published == True
        )
        .order_by(
            Result.session_id.desc(),
            Result.term_id.desc()
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="No published result found"
        )

    term = result.term

    # ======================================================
    # SUBJECT PROCESSING
    # ======================================================

    subjects_list = []

    total_marks = 0

    for s in result.subjects:

        marks = s["marks"]

        grade, remark = calculate_grade(marks)

        total_marks += marks

        subjects_list.append(
            {
                "subject_id": s["subject"]["id"],
                "subject_name": s["subject"]["name"],
                "marks": marks,
                "grade": grade,
                "remark": remark
            }
        )

    number_of_subjects = len(subjects_list)

    average_score = (
        round(total_marks / number_of_subjects, 2)
        if number_of_subjects
        else 0
    )

    class_results = (
        db.query(Result)
        .filter(
            Result.term_id == result.term_id,
            Result.session_id == result.session_id,
            Result.course_id == student.course_id
        )
        .order_by(Result.average_score.desc())
        .all()
    )

    position = 1

    for r in class_results:

        if r.student_id == student.id:
            break

        position += 1

    promotion_status = (
        "Promoted"
        if average_score >= 50
        else "Repeat"
    )

    # ======================================================
    # SCHOOL INFO
    # ======================================================

    school_name = "MY APO SCHOOL"
    school_motto = "EXCELLENCY"
    school_address = "Km 36 Lekki-Epe Expressway, Ibeju-Lekki, Lagos"
    school_phone = "07032245886"
    school_email = "myaposchool@yahoo.com"
    school_website = "www.myaposchool.com"
    school_logo = None

    # ======================================================
    # SIGNATURES
    # ======================================================

    principal_signature = "Tony Fortune"
    registrar_signature = "Tony Fortune"
    class_teacher_signature = "Tony Fortune"

    verification_link = (
        f"https://myaposchool.com/verify/result/{result.id}"
    )

    # ======================================================
    # RESPONSE
    # ======================================================

    return {

        "id": result.id,

        "student_id": student.id,

        "course_id": student.course_id,

        "term_id": result.term_id,

        "academic_session_id": result.session_id,

        "student_name": student.user.full_name,

        "school_name": school_name,
        "school_motto": school_motto,
        "school_address": school_address,
        "school_phone": school_phone,
        "school_email": school_email,
        "school_website": school_website,
        "school_logo": school_logo,

        "total_score": total_marks,
        "average_score": average_score,

        "gpa": result.gpa,

        "cumulative_gpa": getattr(
            result,
            "cumulative_gpa",
            None
        ),

        "position": position,

        "remarks": result.remarks,

        "is_locked": result.is_locked,

        "published": result.published,

        "created_at": result.created_at,

        "subjects": subjects_list,

        "total_marks": total_marks,

        "number_of_subjects": number_of_subjects,

        "class_size": len(class_results),

        "term_name": (
            result.term.name
            if result.term
            else "N/A"
        ),

        "session_year": (
            result.session.name
            if result.session
            else "N/A"
        ),

        "promotion_status": promotion_status,

        "teacher_comment": getattr(
            result,
            "teacher_comment",
            None
        ),

        "principal_comment": getattr(
            result,
            "principal_comment",
            None
        ),

        "attendance": getattr(
            result,
            "attendance",
            None
        ),

        "total_school_days": getattr(
            result,
            "total_school_days",
            None
        ),

        "next_term_begins": getattr(
            result.term,
            "next_term_begins",
            None
        ),

        "class_teacher_signature": class_teacher_signature,

        "principal_signature": principal_signature,

        "registrar_signature": registrar_signature,

        "verification_link": verification_link
    }




# ======================================================
# ADMIN VIEW SPECIFIC RESULT
# ======================================================
@router.get(
    "/{student_id}/result/{session_id}/{term_id}",
    response_model=ResultResponse
)
def view_student_result_by_term(
    student_id: int,
    session_id: int,
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    require_teacher_or_admin(current_user)

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    term = db.query(Term).filter(
        Term.id == term_id,
        Term.session_id == session_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    result = db.query(Result).filter(
        Result.student_id == student.id,
        Result.session_id == session_id,
        Result.term_id == term_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    # ======================================================
    # SUBJECT PROCESSING
    # ======================================================

    subjects_list = []

    total_marks = 0

    for s in result.subjects:

        marks = s["marks"]

        grade, remark = calculate_grade(marks)

        total_marks += marks

        subjects_list.append(
            {
                "subject_id": s["subject"]["id"],
                "subject_name": s["subject"]["name"],
                "marks": marks,
                "grade": grade,
                "remark": remark
            }
        )

    number_of_subjects = len(subjects_list)

    average_score = (
        round(total_marks / number_of_subjects, 2)
        if number_of_subjects
        else 0
    )

    class_results = (
        db.query(Result)
        .filter(
            Result.course_id == student.course_id,
            Result.session_id == session_id,
            Result.term_id == term_id
        )
        .order_by(Result.average_score.desc())
        .all()
    )

    position = 1

    for r in class_results:

        if r.student_id == student.id:
            break

        position += 1

    promotion_status = (
        "Promoted"
        if average_score >= 50
        else "Repeat"
    )

    # ======================================================
    # SCHOOL INFO
    # ======================================================

    school_name = "MY APO SCHOOL"
    school_motto = "EXCELLENCY"
    school_address = "Km 36 Lekki-Epe Expressway, Ibeju-Lekki, Lagos"
    school_phone = "07032245886"
    school_email = "myaposchool@yahoo.com"
    school_website = "www.myaposchool.com"
    school_logo = None

    principal_signature = "Tony Fortune"
    registrar_signature = "Tony Fortune"
    class_teacher_signature = "Tony Fortune"

    verification_link = (
        f"https://myaposchool.com/verify/result/{result.id}"
    )

    return {

        "id": result.id,

        "student_id": student.id,

        "course_id": student.course_id,

        "term_id": result.term_id,

        "academic_session_id": result.session_id,

        "student_name": student.user.full_name,

        "school_name": school_name,
        "school_motto": school_motto,
        "school_address": school_address,
        "school_phone": school_phone,
        "school_email": school_email,
        "school_website": school_website,
        "school_logo": school_logo,

        "total_score": total_marks,

        "average_score": average_score,

        "gpa": result.gpa,

        "cumulative_gpa": getattr(
            result,
            "cumulative_gpa",
            None
        ),

        "position": position,

        "remarks": result.remarks,

        "is_locked": result.is_locked,

        "published": result.published,

        "created_at": result.created_at,

        "subjects": subjects_list,

        "total_marks": total_marks,

        "number_of_subjects": number_of_subjects,

        "class_size": len(class_results),

        "term_name": (
            term.name
            if term
            else "N/A"
        ),

        "session_year": (
            term.session.name
            if term.session
            else "N/A"
        ),

        "promotion_status": promotion_status,

        "teacher_comment": getattr(
            result,
            "teacher_comment",
            None
        ),

        "principal_comment": getattr(
            result,
            "principal_comment",
            None
        ),

        "attendance": getattr(
            result,
            "attendance",
            None
        ),

        "total_school_days": getattr(
            result,
            "total_school_days",
            None
        ),

        "next_term_begins": getattr(
            term,
            "next_term_begins",
            None
        ),

        "class_teacher_signature": class_teacher_signature,

        "principal_signature": principal_signature,

        "registrar_signature": registrar_signature,

        "verification_link": verification_link
    }


# ======================================================
# PRINT RESULT
# ======================================================
# ======================================================
# PRINT RESULT
# ======================================================
@router.get("/{student_id}/result/print")
def print_result(
    student_id: int,
    academic_session_id: int | None = None,
    term_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if (
        current_user.role == "student"
        and current_user.id != student.user_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    # ======================================================
    # DETERMINE TERM
    # ======================================================
    if current_user.role == "admin":

        if not academic_session_id or not term_id:
            raise HTTPException(
                status_code=400,
                detail="academic_session_id and term_id are required"
            )

        term = db.query(Term).filter(
            Term.id == term_id,
            Term.session_id == academic_session_id
        ).first()

    else:
        term = db.query(Term).join(Result).filter(
            Result.student_id == student.id,
            Result.published == True
        ).order_by(
            Term.session_id.desc(),
            Term.id.desc()
        ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    # ======================================================
    # FETCH RESULT
    # ======================================================
    result = db.query(Result).filter(
        Result.student_id == student.id,
        Result.term_id == term.id,
        Result.published == True
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Published result not found"
        )

    os.makedirs("generated_reports", exist_ok=True)

    pdf_path = f"generated_reports/result_{student.id}.pdf"

    verification_link = (
        f"https://myaposchool.com/verify/result/{result.id}"
    )

    qr = qrcode.make(verification_link)
    qr_path = (
        f"generated_reports/qr_result_{student.id}.png"
    )
    qr.save(qr_path)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4
    )

    styles = getSampleStyleSheet()

    content = []

    # ======================================================
    # SCHOOL INFORMATION
    # ======================================================

    content.append(
        Paragraph("<b>MY APO SCHOOL</b>", styles["Title"])
    )

    content.append(
        Paragraph("Motto: EXCELLENCY", styles["Normal"])
    )

    content.append(
        Paragraph(
            "Km 36 Lekki-Epe Expressway, Ibeju-Lekki, Lagos",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Phone: 07032245886 | Email: myaposchool@yahoo.com",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Website: www.myaposchool.com",
            styles["Normal"]
        )
    )

    content.append(Spacer(1, 10))

    content.append(
        Paragraph(
            "<b>RESULT SHEET</b>",
            styles["Heading2"]
        )
    )

    # ======================================================
    # STUDENT INFORMATION
    # ======================================================

    student_table = Table([
        ["Name", student.user.full_name],
        ["Student ID", str(student.id)],
        ["Course", student.course.name if student.course else "N/A"],
        ["Term", term.name],
        ["Session", term.session.name if term.session else "N/A"]
    ])

    student_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black)
        ])
    )

    content.append(student_table)

    content.append(Spacer(1, 10))

       # ======================================================
    # SUBJECTS
    # ======================================================

    table_data = [
        ["Subject", "Score", "Grade", "Remark"]
    ]

    total_marks = 0

    subjects_data = result.subjects or []

    # ======================================================
    # FALLBACK TO SCORE TABLE
    # ======================================================

    if not subjects_data:

        scores = db.query(Score).filter(
            Score.student_id == student.id,
            Score.term_id == term.id
        ).all()

        for score in scores:

            grade, remark = calculate_grade(
                score.marks
            )

            total_marks += score.marks

            table_data.append([
                score.subject.name
                if score.subject
                else "Unknown Subject",

                str(score.marks),

                grade,

                remark
            ])

        number_of_subjects = len(scores)

    else:

        for item in subjects_data:

            marks = item.get("marks", 0)

            subject_name = (
                item.get("subject", {})
                .get("name", "Unknown Subject")
            )

            grade, remark = calculate_grade(
                marks
            )

            total_marks += marks

            table_data.append([
                subject_name,
                str(marks),
                grade,
                remark
            ])

        number_of_subjects = len(subjects_data)

    result_table = Table(table_data)

    result_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")
        ])
    )

    content.append(result_table)

    # ======================================================
    # SUMMARY
    # ======================================================

    average_score = (
        round(total_marks / number_of_subjects, 2)
        if number_of_subjects else 0
    )

    class_results = db.query(Result).filter(
        Result.term_id == term.id,
        Result.course_id == student.course_id
    ).order_by(
        Result.average_score.desc()
    ).all()

    position = 1

    for r in class_results:
        if r.student_id == student.id:
            break
        position += 1

    promotion_status = (
        "Promoted"
        if average_score >= 50
        else "Repeat"
    )

    content.append(Spacer(1, 10))

    summary_table = Table([
        ["Total Score", str(total_marks)],
        ["Average Score", str(average_score)],
        ["GPA", str(result.gpa)],
        ["Position", str(position)],
        ["Remarks", result.remarks or "-"],
        ["Promotion Status", promotion_status]
    ])

    summary_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black)
        ])
    )

    content.append(summary_table)

    # ======================================================
    # QR CODE
    # ======================================================

    content.append(Spacer(1, 10))

    content.append(
        Paragraph(
            "<b>Result Verification QR Code</b>",
            styles["Heading3"]
        )
    )

    qr_image = Image(
        qr_path,
        width=100,
        height=100
    )

    content.append(qr_image)

    content.append(
        Paragraph(
            verification_link,
            styles["Normal"]
        )
    )
    # ======================================================
    # SIGNATURE
    # ======================================================

    content.append(Spacer(1, 20))

    content.append(
        Paragraph(
            "<b>Tony Fortune</b>",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Principal / Registrar",
            styles["Normal"]
        )
    )

    doc.build(content)

    safe_name = student.user.full_name.replace(" ", "_")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{safe_name}_result.pdf"
    )




# ======================================================
# ADMIN PRINT SPECIFIC RESULT
# ======================================================
@router.get("/{student_id}/result/{session_id}/{term_id}/print")
def print_result_by_term(
    student_id: int,
    session_id: int,
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    require_teacher_or_admin(current_user)

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    term = db.query(Term).filter(
        Term.id == term_id,
        Term.session_id == session_id
    ).first()

    if not term:
        raise HTTPException(
            status_code=404,
            detail="Term not found"
        )

    result = db.query(Result).filter(
        Result.student_id == student.id,
        Result.session_id == session_id,
        Result.term_id == term_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    if not result.published:
        raise HTTPException(
            status_code=403,
            detail="Result not published"
        )

    os.makedirs("generated_reports", exist_ok=True)

    pdf_path = f"generated_reports/result_{student.id}.pdf"

    verification_link = (
        f"https://myaposchool.com/verify/result/{result.id}"
    )

    qr = qrcode.make(verification_link)

    qr_path = (
        f"generated_reports/qr_result_{student.id}.png"
    )

    qr.save(qr_path)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4
    )

    styles = getSampleStyleSheet()

    content = []

    # ======================================================
    # SCHOOL INFORMATION
    # ======================================================

    content.append(
        Paragraph("<b>MY APO SCHOOL</b>", styles["Title"])
    )

    content.append(
        Paragraph("Motto: EXCELLENCY", styles["Normal"])
    )

    content.append(
        Paragraph(
            "Km 36 Lekki-Epe Expressway, Ibeju-Lekki, Lagos",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Phone: 07032245886 | Email: myaposchool@yahoo.com",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Website: www.myaposchool.com",
            styles["Normal"]
        )
    )

    content.append(Spacer(1, 10))

    content.append(
        Paragraph(
            "<b>RESULT SHEET</b>",
            styles["Heading2"]
        )
    )

    student_table = Table([
        ["Name", student.user.full_name],
        ["Student ID", str(student.id)],
        ["Course", student.course.name if student.course else "N/A"],
        ["Term", term.name],
        ["Session", term.session.name if term.session else "N/A"]
    ])

    student_table.setStyle(
        TableStyle([
            ("GRID", (0,0), (-1,-1), 1, colors.black)
        ])
    )

    content.append(student_table)
    content.append(Spacer(1,10))

    table_data = [["Subject","Score","Grade","Remark"]]

    total_marks = 0

    for s in result.subjects:

        marks = s["marks"]

        grade, remark = calculate_grade(marks)

        total_marks += marks

        table_data.append([
            s["subject"]["name"],
            str(marks),
            grade,
            remark
        ])

    result_table = Table(table_data)

    result_table.setStyle(
        TableStyle([
            ("GRID",(0,0),(-1,-1),1,colors.black)
        ])
    )

    content.append(result_table)

    number_of_subjects = len(result.subjects)

    average_score = (
        round(total_marks/number_of_subjects,2)
        if number_of_subjects
        else 0
    )

    class_results = (
        db.query(Result)
        .filter(
            Result.term_id == term.id,
            Result.session_id == session_id,
            Result.course_id == student.course_id
        )
        .order_by(Result.average_score.desc())
        .all()
    )

    position = 1

    for r in class_results:
        if r.student_id == student.id:
            break
        position += 1

    promotion_status = (
        "Promoted"
        if average_score >= 50
        else "Repeat"
    )

    content.append(Spacer(1,10))

    summary_table = Table([
        ["Total Score", str(total_marks)],
        ["Average Score", str(average_score)],
        ["GPA", str(result.gpa)],
        ["Position", str(position)],
        ["Remarks", result.remarks or "-"],
        ["Promotion Status", promotion_status]
    ])

    summary_table.setStyle(
        TableStyle([
            ("GRID",(0,0),(-1,-1),1,colors.black)
        ])
    )

    content.append(summary_table)

    content.append(Spacer(1,10))

    content.append(
        Paragraph(
            "<b>Result Verification QR Code</b>",
            styles["Heading3"]
        )
    )

    qr_image = Image(
        qr_path,
        width=100,
        height=100
    )

    content.append(qr_image)

    content.append(
        Paragraph(
            verification_link,
            styles["Normal"]
        )
    )

    content.append(Spacer(1,20))

    content.append(
        Paragraph(
            "<b>Tony Fortune</b>",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Principal / Registrar",
            styles["Normal"]
        )
    )

    doc.build(content)

    safe_name = (
        student.user.full_name.replace(" ","_")
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{safe_name}_result.pdf"
    )



# ======================================================
# PRINT TRANSCRIPT
# ======================================================
@router.get("/{student_id}/transcript/print")
def print_transcript(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    student = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if (
        current_user.role == "student"
        and current_user.id != student.user_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    results = (
        db.query(Result)
        .filter(
            Result.student_id == student.id,
            Result.published == True
        )
        .order_by(
            Result.session_id,
            Result.term_id
        )
        .all()
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail="No transcript records found"
        )

    os.makedirs(
        "generated_reports",
        exist_ok=True
    )

    pdf_path = (
        f"generated_reports/transcript_{student.id}.pdf"
    )

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4
    )

    styles = getSampleStyleSheet()

    content = []

    # ==================================================
    # SCHOOL HEADER
    # ==================================================

    content.append(
        Paragraph(
            "<b>MY APO SCHOOL</b>",
            styles["Title"]
        )
    )

    content.append(
        Paragraph(
            "Motto: EXCELLENCY",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Km 36 Lekki-Epe Expressway, Ibeju-Lekki, Lagos",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Phone: 07032245886",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Email: myaposchool@yahoo.com",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Website: www.myaposchool.com",
            styles["Normal"]
        )
    )

    content.append(Spacer(1, 10))

    content.append(
        Paragraph(
            "<b>ACADEMIC TRANSCRIPT</b>",
            styles["Heading2"]
        )
    )

    # ==================================================
    # STUDENT INFORMATION
    # ==================================================

    content.append(Spacer(1, 15))

    student_info = Table(
        [
            ["Student Name", student.user.full_name],
            ["Student ID", str(student.id)],
            ["User ID", str(student.user_id)],
            ["Email", student.user.email or "N/A"],
            [
                "Course",
                student.course.name
                if student.course
                else "N/A"
            ],
            [
                "Parent ID",
                str(student.parent_id)
                if student.parent_id
                else "N/A"
            ]
        ],
        colWidths=[120, 300]
    )

    student_info.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica")
        ])
    )

    content.append(student_info)

    content.append(Spacer(1, 20))

        # ==================================================
    # TRANSCRIPT TABLE
    # ==================================================

    total_avg = 0
    total_gpa = 0

    for result in results:

        # =============================================
        # TERM SUMMARY
        # =============================================

        term_table_data = [
            [
                "Session",
                "Term",
                "Average",
                "GPA",
                "Position",
                "Remarks"
            ],
            [
                result.session.name
                if result.session
                else "N/A",

                result.term.name
                if result.term
                else "N/A",

                str(result.average_score),

                str(result.gpa),

                str(result.position or "-"),

                result.remarks or "-"
            ]
        ]

        term_table = Table(
            term_table_data
        )

        term_table.setStyle(
            TableStyle([
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")
            ])
        )

        content.append(term_table)

        total_avg += (
            result.average_score or 0
        )

        total_gpa += (
            result.gpa or 0
        )

        content.append(
            Spacer(1, 8)
        )

        # =============================================
        # SUBJECT BREAKDOWN
        # =============================================

        subject_table_data = [
            [
                "Subject",
                "Score",
                "Grade",
                "Remark"
            ]
        ]

        subjects_data = result.subjects or []

        # =============================================
        # FALLBACK TO SCORE TABLE
        # =============================================

        if not subjects_data:

            scores = db.query(Score).filter(
                Score.student_id == student.id,
                Score.term_id == result.term_id
            ).all()

            for score in scores:

                grade, remark = calculate_grade(
                    score.marks
                )

                subject_table_data.append([
                    score.subject.name
                    if score.subject
                    else "Unknown Subject",

                    str(score.marks),

                    grade,

                    remark
                ])

        else:

            for item in subjects_data:

                marks = item.get(
                    "marks",
                    0
                )

                subject_name = (
                    item.get("subject", {})
                    .get(
                        "name",
                        "Unknown Subject"
                    )
                )

                grade, remark = calculate_grade(
                    marks
                )

                subject_table_data.append([
                    subject_name,
                    str(marks),
                    grade,
                    remark
                ])

        subject_table = Table(
            subject_table_data
        )

        subject_table.setStyle(
            TableStyle([
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")
            ])
        )

        content.append(
            subject_table
        )

        content.append(
            Spacer(1, 15)
        )

    # ==================================================
    # SUMMARY
    # ==================================================

    count = len(results)

    avg_score = (
        round(total_avg / count, 2)
        if count else 0
    )

    avg_gpa = (
        round(total_gpa / count, 2)
        if count else 0
    )

    content.append(
        Spacer(1, 15)
    )

    summary_table = Table(
        [
            ["Total Sessions", str(count)],
            ["Average Score", str(avg_score)],
            ["Average GPA", str(avg_gpa)]
        ],
        colWidths=[150, 150]
    )

    summary_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey)
        ])
    )

    content.append(
        summary_table
    )

    # ==================================================
    # QR CODE
    # ==================================================

    verification_link = (
        f"https://myaposchool.com/verify/transcript/{student.id}"
    )

    qr = qrcode.make(
        verification_link
    )

    qr_path = (
        f"generated_reports/qr_transcript_{student.id}.png"
    )

    qr.save(qr_path)

    content.append(
        Spacer(1, 20)
    )

    content.append(
        Paragraph(
            "<b>Verification QR Code</b>",
            styles["Normal"]
        )
    )

    qr_img = Image(
        qr_path,
        width=100,
        height=100
    )

    content.append(
        qr_img
    )

    content.append(
        Paragraph(
            verification_link,
            styles["Normal"]
        )
    )

    # ==================================================
    # SIGNATURE
    # ==================================================

    content.append(
        Spacer(1, 30)
    )

    content.append(
        Paragraph(
            "<b>Tony Fortune</b>",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            "Principal / Registrar",
            styles["Normal"]
        )
    )

    # ==================================================
    # BUILD PDF
    # ==================================================

    doc.build(content)

    safe_name = (
        student.user.full_name
        .replace(" ", "_")
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{safe_name}_transcript.pdf"
    )
# ======================================================
# CREATE STUDENT
# ======================================================
@router.post("/", response_model=UserResponse)
def create_student(
    data: UserCreateStudent,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    require_admin(current_user)

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    student = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="student",
        is_active=True,
        is_verified=False,
        permissions=[]
    )

    db.add(student)
    db.flush()

    profile = StudentProfile(
        user_id=student.id,
        course_id=data.course_id,
        total_score=0,
        average_score=0,
        gpa=0
    )

    db.add(profile)
    db.commit()

    token = create_verification_token(student.email)
    link = f"{APP_URL}/auth/verify-email?token={token}"

    background_tasks.add_task(
        send_email,
        student.email,
        "Verify Your Email",
        f"Verify your account: {link}",
        verification_email_html(link)
    )

    return student


# ======================================================
# GET STUDENT USER
# ======================================================
@router.get("/{student_id}", response_model=UserResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(StudentProfile).filter(
        StudentProfile.id == student_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if current_user.role == "student" and current_user.id != profile.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return profile.user


# ======================================================
# UPDATE STUDENT
# ======================================================
@router.patch("/{student_id}", response_model=UserResponse)
def update_student(
    student_id: int,
    data: StudentUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    require_admin(current_user)

    profile = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student not found")

    student = profile.user

    user_updates = data.user.model_dump(exclude_unset=True)
    profile_updates = data.profile.model_dump(exclude_unset=True)

    for k, v in user_updates.items():
        setattr(student, k, v)

    for k, v in profile_updates.items():
        setattr(profile, k, v)

    db.commit()
    db.refresh(student)

    return student


# ======================================================
# DELETE STUDENT
# ======================================================
@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    require_admin(current_user)

    profile = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Student not found")

    user = profile.user

    db.delete(profile)
    if user:
        db.delete(user)

    db.commit()

    return {"message": "Student deleted successfully"}