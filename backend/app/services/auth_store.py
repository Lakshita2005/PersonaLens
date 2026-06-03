from __future__ import annotations

import hashlib
import json
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator

from fastapi import HTTPException, status

from app.schemas.auth import (
    GoogleAuthRequest,
    OtpRequest,
    OtpVerifyRequest,
    PasswordChangeRequest,
    PasswordResetConfirm,
    ReportCreate,
    ReportRecord,
    UserCreate,
    UserLogin,
    UserProfile,
)


DB_PATH = Path(__file__).resolve().parents[2] / "storage" / "personalens.sqlite3"
HASH_ITERATIONS = 140_000
OTP_EXPIRY_MINUTES = 10


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    password_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        password_salt.encode("utf-8"),
        HASH_ITERATIONS,
    ).hex()
    return password_salt, digest


def _verify_password(password: str, salt: str, password_hash: str) -> bool:
    _, candidate_hash = _hash_password(password, salt)
    return secrets.compare_digest(candidate_hash, password_hash)


def _otp_expires_at() -> str:
    return (datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat(
        timespec="seconds",
    )


def _issue_token(connection: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    connection.execute(
        "INSERT INTO tokens (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, _utc_now()),
    )
    return token


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def init_auth_store() -> None:
    with _connect() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                program TEXT,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS tokens (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                candidate_name TEXT NOT NULL,
                program TEXT,
                assessment_track TEXT,
                readiness_score INTEGER NOT NULL,
                analysis_json TEXT NOT NULL,
                turns_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                purpose TEXT NOT NULL,
                otp TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                used_at TEXT,
                created_at TEXT NOT NULL
            )
            """
        )


def _profile_from_row(row: sqlite3.Row) -> UserProfile:
    return UserProfile(
        id=int(row["id"]),
        name=str(row["name"]),
        email=str(row["email"]),
        program=row["program"],
        created_at=str(row["created_at"]),
    )


def _report_from_row(row: sqlite3.Row) -> ReportRecord:
    return ReportRecord(
        id=int(row["id"]),
        candidateName=str(row["candidate_name"]),
        program=row["program"],
        assessmentTrack=row["assessment_track"],
        readinessScore=int(row["readiness_score"]),
        analysis=json.loads(row["analysis_json"]),
        turns=json.loads(row["turns_json"]),
        created_at=str(row["created_at"]),
    )


def create_user(payload: UserCreate) -> tuple[str, UserProfile]:
    init_auth_store()
    salt, password_hash = _hash_password(payload.password)

    try:
        with _connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO users (name, email, program, password_salt, password_hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.name.strip(),
                    payload.email.lower(),
                    payload.program,
                    salt,
                    password_hash,
                    _utc_now(),
                ),
            )
            user_id = int(cursor.lastrowid)
            token = _issue_token(connection, user_id)
            row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from exc

    return token, _profile_from_row(row)


def authenticate_user(payload: UserLogin) -> tuple[str, UserProfile]:
    init_auth_store()

    with _connect() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (payload.email.lower(),),
        ).fetchone()

        if not row or not _verify_password(
            payload.password,
            str(row["password_salt"]),
            str(row["password_hash"]),
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = _issue_token(connection, int(row["id"]))

    return token, _profile_from_row(row)


def request_otp_code(payload: OtpRequest) -> tuple[str, str]:
    init_auth_store()
    email = payload.email.lower().strip()
    otp = f"{secrets.randbelow(1_000_000):06d}"

    with _connect() as connection:
        connection.execute(
            """
            UPDATE otp_codes
            SET used_at = ?
            WHERE email = ? AND purpose = ? AND used_at IS NULL
            """,
            (_utc_now(), email, payload.purpose),
        )
        connection.execute(
            """
            INSERT INTO otp_codes (email, purpose, otp, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (email, payload.purpose, otp, _otp_expires_at(), _utc_now()),
        )

    return "OTP generated. In development, use the returned code to continue.", otp


def verify_otp_code(payload: OtpVerifyRequest, consume: bool = False) -> None:
    init_auth_store()
    email = payload.email.lower().strip()

    with _connect() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM otp_codes
            WHERE email = ? AND purpose = ? AND otp = ? AND used_at IS NULL
            ORDER BY created_at DESC, id DESC
            LIMIT 1
            """,
            (email, payload.purpose, payload.otp.strip()),
        ).fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP",
            )

        expires_at = datetime.fromisoformat(str(row["expires_at"]))
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP",
            )

        if consume:
            connection.execute(
                "UPDATE otp_codes SET used_at = ? WHERE id = ?",
                (_utc_now(), int(row["id"])),
            )


def reset_password(payload: PasswordResetConfirm) -> None:
    init_auth_store()
    verify_otp_code(
        OtpVerifyRequest(
            email=payload.email,
            otp=payload.otp,
            purpose="password_reset",
        ),
        consume=True,
    )
    salt, password_hash = _hash_password(payload.newPassword)

    with _connect() as connection:
        cursor = connection.execute(
            """
            UPDATE users
            SET password_salt = ?, password_hash = ?
            WHERE email = ?
            """,
            (salt, password_hash, payload.email.lower().strip()),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile exists for this email",
            )


def change_password(user_id: int, payload: PasswordChangeRequest) -> None:
    init_auth_store()
    salt, password_hash = _hash_password(payload.newPassword)

    with _connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

        if not row or not _verify_password(
            payload.currentPassword,
            str(row["password_salt"]),
            str(row["password_hash"]),
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

        connection.execute(
            """
            UPDATE users
            SET password_salt = ?, password_hash = ?
            WHERE id = ?
            """,
            (salt, password_hash, user_id),
        )


def authenticate_google(payload: GoogleAuthRequest) -> tuple[str, UserProfile]:
    init_auth_store()
    email = payload.email.lower().strip()
    name = (payload.name or email.split("@", 1)[0]).strip()

    with _connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

        if not row:
            salt, password_hash = _hash_password(secrets.token_urlsafe(32))
            cursor = connection.execute(
                """
                INSERT INTO users (name, email, program, password_salt, password_hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (name, email, payload.program, salt, password_hash, _utc_now()),
            )
            row = connection.execute(
                "SELECT * FROM users WHERE id = ?",
                (int(cursor.lastrowid),),
            ).fetchone()

        token = _issue_token(connection, int(row["id"]))

    return token, _profile_from_row(row)


def get_user_by_token(token: str) -> UserProfile:
    init_auth_store()

    with _connect() as connection:
        row = connection.execute(
            """
            SELECT users.*
            FROM tokens
            JOIN users ON users.id = tokens.user_id
            WHERE tokens.token = ?
            """,
            (token,),
        ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required",
        )

    return _profile_from_row(row)


def save_report(user_id: int, payload: ReportCreate) -> ReportRecord:
    init_auth_store()
    created_at = _utc_now()

    with _connect() as connection:
        cursor = connection.execute(
            """
            INSERT INTO reports (
                user_id, candidate_name, program, assessment_track, readiness_score,
                analysis_json, turns_json, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                payload.candidateName,
                payload.program,
                payload.assessmentTrack,
                payload.readinessScore,
                json.dumps(payload.analysis),
                json.dumps(payload.turns),
                created_at,
            ),
        )
        row = connection.execute(
            "SELECT * FROM reports WHERE id = ?",
            (int(cursor.lastrowid),),
        ).fetchone()

    return _report_from_row(row)


def list_reports(user_id: int) -> list[ReportRecord]:
    init_auth_store()

    with _connect() as connection:
        rows = connection.execute(
            "SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC, id DESC",
            (user_id,),
        ).fetchall()

    return [_report_from_row(row) for row in rows]
