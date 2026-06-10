from fastapi import APIRouter, Depends, Header

from app.schemas.auth import (
    AuthResponse,
    GoogleAuthRequest,
    MessageResponse,
    OtpRequest,
    OtpResponse,
    OtpVerifyRequest,
    PasswordChangeRequest,
    PasswordResetConfirm,
    ReportCreate,
    ReportRecord,
    ReportsResponse,
    UserCreate,
    UserLogin,
    UserProfile,
)
from app.services.auth_store import (
    authenticate_google,
    authenticate_user,
    change_password,
    create_user,
    get_user_by_token,
    list_reports,
    request_otp_code,
    reset_password,
    save_report,
    verify_otp_code,
)

router = APIRouter(tags=["auth"])


def current_user(authorization: str | None = Header(default=None)) -> UserProfile:
    token = ""

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()

    return get_user_by_token(token)


@router.post("/auth/register", response_model=AuthResponse)
async def register_user(payload: UserCreate) -> AuthResponse:
    token, user = create_user(payload)
    return AuthResponse(token=token, user=user)


@router.post("/auth/login", response_model=AuthResponse)
async def login_user(payload: UserLogin) -> AuthResponse:
    token, user = authenticate_user(payload)
    return AuthResponse(token=token, user=user)


@router.post("/auth/google", response_model=AuthResponse)
async def google_user(payload: GoogleAuthRequest) -> AuthResponse:
    token, user = authenticate_google(payload)
    return AuthResponse(token=token, user=user)


@router.post("/auth/request-otp", response_model=OtpResponse)
async def request_otp(payload: OtpRequest) -> OtpResponse:
    message, code = request_otp_code(payload)
    return OtpResponse(message=message, dev_otp=code)


@router.post("/auth/verify-otp", response_model=MessageResponse)
async def verify_otp(payload: OtpVerifyRequest) -> MessageResponse:
    verify_otp_code(payload)
    return MessageResponse(message="OTP verified")


@router.post("/auth/reset-password", response_model=MessageResponse)
async def reset_user_password(payload: PasswordResetConfirm) -> MessageResponse:
    reset_password(payload)
    return MessageResponse(message="Password reset complete")


@router.post("/auth/change-password", response_model=MessageResponse)
async def change_user_password(
    payload: PasswordChangeRequest,
    user: UserProfile = Depends(current_user),
) -> MessageResponse:
    change_password(user.id, payload)
    return MessageResponse(message="Password changed")


@router.get("/auth/me", response_model=UserProfile)
async def me(user: UserProfile = Depends(current_user)) -> UserProfile:
    return user


@router.post("/reports", response_model=ReportRecord)
async def create_report(
    payload: ReportCreate,
    user: UserProfile = Depends(current_user),
) -> ReportRecord:
    return save_report(user.id, payload)


@router.get("/reports", response_model=ReportsResponse)
async def get_reports(user: UserProfile = Depends(current_user)) -> ReportsResponse:
    return ReportsResponse(reports=list_reports(user.id))
