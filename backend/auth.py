from fastapi import (
    Depends,
    HTTPException,
    APIRouter,
    BackgroundTasks
)

from fastapi.security import (
    OAuth2PasswordRequestForm,
    OAuth2PasswordBearer
)

from sqlalchemy.orm import Session

from jose import jwt, JWTError

from passlib.context import CryptContext

from datetime import (
    datetime,
    timedelta,
    timezone
)

import os
from dotenv import load_dotenv
import requests

import models
import schemas

from database import get_db

router = APIRouter(tags=["Authentication"])

load_dotenv()

# =====================================================
# CONFIG
# =====================================================
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change-me"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_EXPIRE_MIN = 30
REFRESH_EXPIRE_DAYS = 7
RESET_EXPIRE_MIN = 15
VERIFY_EXPIRE_MIN = 60

APP_URL = os.getenv(
    "APP_URL",
    "http://localhost:8000"
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

BREVO_API_KEY = os.getenv(
    "BREVO_API_KEY"
)

BREVO_SENDER_EMAIL = os.getenv(
    "BREVO_SENDER_EMAIL"
)

BREVO_SENDER_NAME = os.getenv(
    "BREVO_SENDER_NAME"
)

ENABLE_EMAILS = os.getenv(
    "ENABLE_EMAILS",
    "true"
).lower() in ["true", "1", "yes"]

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

# =====================================================
# PASSWORD HELPERS
# =====================================================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    password: str,
    hashed: str
) -> bool:
    return pwd_context.verify(
        password,
        hashed
    )

# =====================================================
# TOKEN HELPERS
# =====================================================
def create_token(
    data: dict,
    expires: timedelta
) -> str:

    payload = data.copy()

    payload["exp"] = (
        datetime.now(timezone.utc) + expires
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def create_verification_token(
    email: str
) -> str:

    return create_token(
        {
            "email": email,
            "type": "verify"
        },
        timedelta(
            minutes=VERIFY_EXPIRE_MIN
        )
    )


def create_refresh_token(
    user: models.User
) -> str:

    return create_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "role": user.role,
            "type": "refresh"
        },
        timedelta(
            days=REFRESH_EXPIRE_DAYS
        )
    )

# =====================================================
# AUDIT LOG
# =====================================================
def create_audit_log(
    db: Session,
    user: models.User,
    action: str,
    target: str = None
):

    log = models.AuditLog(
        user_id=user.id,
        user_email=user.email,
        user_role=user.role,
        action=action,
        target=target
    )

    db.add(log)
    db.commit()

# =====================================================
# EMAIL HELPERS
# =====================================================
def send_email(
    to: str,
    subject: str,
    text_body: str,
    html_body: str = None
):

    if not ENABLE_EMAILS:
        return

    if not BREVO_API_KEY:
        return

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "sender": {
            "name": BREVO_SENDER_NAME,
            "email": BREVO_SENDER_EMAIL
        },
        "to": [
            {
                "email": to
            }
        ],
        "subject": subject,
        "textContent": text_body,
        "htmlContent": html_body or text_body
    }

    try:

        requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15
        )

    except Exception:
        pass


def verification_email_html(
    link: str
) -> str:

    return f"""
    <html>
        <body style="font-family: Arial;">
            <h3>Email Verification</h3>

            <p>
                Please click the button below
                to verify your account:
            </p>

            <a href="{link}" style="
                padding:10px 18px;
                background:#007bff;
                color:white;
                text-decoration:none;
                border-radius:5px;
            ">
                Verify Email
            </a>

            <p>
                If the button fails,
                open this link manually:
                <br>{link}
            </p>
        </body>
    </html>
    """

# =====================================================
# CURRENT USER + RBAC
# =====================================================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid access token"
            )

        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

        user = db.query(
            models.User
        ).filter(
            models.User.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # =================================================
        # ADMIN SHOULD NEVER DEPEND ON EMAIL VERIFICATION
        # =================================================
        if (
            user.role != "admin"
            and not user.is_verified
        ):
            raise HTTPException(
                status_code=403,
                detail="Email not verified"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="Account disabled"
            )

        return user

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

# =====================================================
# ROLE HELPERS
# =====================================================
def require_admin(
    user: models.User = Depends(get_current_user)
):

    if user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user


def require_teacher_or_admin(
    user: models.User = Depends(get_current_user)
):

    if user.role not in [
        "admin",
        "teacher"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Admin or Teacher access required"
        )

    return user


# =====================================================
# STUDENT OWNERSHIP CHECK
# =====================================================
def require_student_owner_or_staff(
    student_profile_id: int,
    current_user: models.User,
    db: Session
):

    # =================================================
    # STAFF CAN ACCESS ALL
    # =================================================
    if current_user.role in [
        "admin",
        "teacher"
    ]:
        return

    # =================================================
    # STUDENT CAN ONLY ACCESS SELF
    # =================================================
    if current_user.role == "student":

        student_profile = getattr(
            current_user,
            "student_profile",
            None
        )

        if not student_profile:

            raise HTTPException(
                status_code=403,
                detail="Student profile not found"
            )

        if student_profile.id != student_profile_id:

            raise HTTPException(
                status_code=403,
                detail="Not authorized"
            )

        return

    raise HTTPException(
        status_code=403,
        detail="Access denied"
    )

# =====================================================
# CREATE FIRST USER
# =====================================================
@router.post("/create-first-user")
def create_first_user(
    data: schemas.UserCreateAdmin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=403,
            detail="First user already exists"
        )

    user = models.User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(
            data.password
        ),
        role="admin",
        is_verified=True,
        is_active=True
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return {
        "message":
        "First admin user created successfully",
        "role": user.role
    }

# =====================================================
# LOGIN
# =====================================================
@router.post(
    "/login",
    response_model=schemas.LoginResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.email == form_data.username
    ).first()

    if not user:

        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    if not verify_password(
        form_data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    # =================================================
    # EMAIL VERIFICATION
    # =================================================
    if (
        user.role != "admin"
        and not user.is_verified
    ):

        raise HTTPException(
            status_code=403,
            detail="Verify your email first"
        )

    # =================================================
    # ACTIVE ACCOUNT CHECK
    # =================================================
    if not user.is_active:

        raise HTTPException(
            status_code=403,
            detail="Account disabled"
        )

    # =================================================
    # ACCESS TOKEN
    # =================================================
    access_token = create_token(
        {
            "sub": user.email,
            "role": user.role,
            "user_id": user.id,
            "type": "access"
        },
        timedelta(
            minutes=ACCESS_EXPIRE_MIN
        )
    )

    # =================================================
    # REFRESH TOKEN
    # =================================================
    refresh_token = create_refresh_token(
        user
    )

    # =================================================
    # STUDENT PROFILE LOOKUP
    # =================================================
    student_profile_id = None

    if user.role == "student":

        student_profile = getattr(
            user,
            "student_profile",
            None
        )

        if student_profile:
            student_profile_id = (
                student_profile.id
            )

    # =================================================
    # AUDIT LOG
    # =================================================
    create_audit_log(
        db,
        user,
        "LOGIN"
    )

    # =================================================
    # RESPONSE
    # =================================================
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "student_profile_id":
        student_profile_id
    }

# =====================================================
# REFRESH TOKEN
# =====================================================
@router.post("/refresh")
def refresh_token(
    token: str,
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "refresh":

            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    user = db.query(
        models.User
    ).filter(
        models.User.email == payload["sub"]
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    access_token = create_token(
        {
            "sub": user.email,
            "role": user.role,
            "user_id": user.id,
            "type": "access"
        },
        timedelta(
            minutes=ACCESS_EXPIRE_MIN
        )
    )

    return {
        "access_token": access_token,
        "refresh_token": token,
        "token_type": "bearer"
    }

# =====================================================
# EMAIL VERIFICATION
# =====================================================
class VerifyEmailRequest(
    schemas.ForgotPassword
):
    pass


@router.post("/send-verification")
def send_verification(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    token = create_verification_token(
        data.email
    )

    link = (
        f"{APP_URL}/auth/verify-email"
        f"?token={token}"
    )

    send_email(
        user.email,
        "Verify Email",
        link,
        verification_email_html(link)
    )

    return {
        "message":
        "Verification email sent"
    }


@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "verify":

            raise HTTPException(
                status_code=400,
                detail="Invalid verification token"
            )

        user = db.query(
            models.User
        ).filter(
            models.User.email == payload["email"]
        ).first()

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user.is_verified = True
        user.is_active = True

        db.commit()

        return {
            "message":
            "Email verified successfully"
        }

    except JWTError:

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )

# =====================================================
# FORGOT PASSWORD
# =====================================================
@router.post("/forgot-password")
def forgot_password(
    data: schemas.ForgotPassword,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.email == data.email
    ).first()

    if not user:

        return {
            "message":
            "If email exists, reset instructions sent"
        }

    token = create_token(
        {
            "sub": user.email,
            "type": "reset"
        },
        timedelta(
            minutes=RESET_EXPIRE_MIN
        )
    )

    link = (
    f"{FRONTEND_URL}/reset-password"
    f"?token={token}"
)

    background_tasks.add_task(
        send_email,
        user.email,
        "Reset Password",
        link,
        f"<a href='{link}'>Reset Password</a>"
    )

    create_audit_log(
        db,
        user,
        "PASSWORD_RESET_REQUEST"
    )

    return {
        "message":
        "Password reset email sent"
    }

# =====================================================
# RESET PASSWORD
# =====================================================
@router.post("/reset-password")
def reset_password(
    data: schemas.ResetPassword,
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            data.token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "reset":

            raise HTTPException(
                status_code=400,
                detail="Invalid reset token"
            )

        user = db.query(
            models.User
        ).filter(
            models.User.email == payload["sub"]
        ).first()

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user.password_hash = hash_password(
            data.new_password
        )

        db.commit()

        create_audit_log(
            db,
            user,
            "PASSWORD_RESET_SUCCESS"
        )

        return {
            "message":
            "Password changed successfully"
        }

    except JWTError:

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )