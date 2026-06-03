from typing import Any, Literal

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=6, max_length=128)
    program: str | None = None


class UserLogin(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str


class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    program: str | None = None
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserProfile


class MessageResponse(BaseModel):
    message: str


class OtpRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    purpose: Literal["signin", "signup", "password_reset"] = "password_reset"


class OtpVerifyRequest(OtpRequest):
    otp: str = Field(min_length=4, max_length=8)


class OtpResponse(MessageResponse):
    dev_otp: str | None = None
    expires_in_minutes: int = 10


class PasswordResetConfirm(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    otp: str = Field(min_length=4, max_length=8)
    newPassword: str = Field(min_length=6, max_length=128)


class PasswordChangeRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6, max_length=128)


class GoogleAuthRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    name: str | None = Field(default=None, max_length=120)
    program: str | None = None
    credential: str | None = None


class ReportCreate(BaseModel):
    candidateName: str
    program: str | None = None
    assessmentTrack: str | None = None
    readinessScore: int = Field(ge=0, le=100)
    analysis: dict[str, Any]
    turns: list[dict[str, Any]] = Field(default_factory=list)


class ReportRecord(ReportCreate):
    id: int
    created_at: str


class ReportsResponse(BaseModel):
    reports: list[ReportRecord]
