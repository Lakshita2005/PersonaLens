from typing import Any

from pydantic import BaseModel, Field


class EmotionFrame(BaseModel):
    timestamp: int | None = None

    class Config:
        extra = "allow"


class InterviewTurn(BaseModel):
    question: str
    answer: str
    emotions: list[dict[str, Any]] = Field(default_factory=list)
    category: str | None = None


class AnalysisRequest(BaseModel):
    name: str
    program: str | None = None
    assessmentTrack: str | None = None
    turns: list[InterviewTurn]


class PreparationRequest(BaseModel):
    resumeText: str = ""
    jobDescription: str = ""
    companyQuestions: str | None = None
    totalQuestions: int = Field(default=8, ge=1, le=12)


class PreparedQuestion(BaseModel):
    question_id: str
    category: str
    difficulty: str
    question: str
    answer_modes: list[str] = Field(default_factory=list)
    source: str
    rationale: str | None = None
    expected_signal: str | None = None
    rubric: list[str] = Field(default_factory=list)


class PreparationResponse(BaseModel):
    candidate: dict[str, Any]
    job: dict[str, Any]
    gap: dict[str, Any]
    questions: list[PreparedQuestion]
    source_priority: list[str]
    provider: str = "persona_lens_pipeline"


class OceanScore(BaseModel):
    trait: str
    A: int = Field(ge=0, le=100)
    fullMark: int = 100


class PersonalityAnalysis(BaseModel):
    ocean: list[OceanScore]
    summary: str
    strengths: list[str]
    improvements: list[str]
    suggestions: list[str]


class AnalysisResponse(BaseModel):
    analysis: PersonalityAnalysis
    provider: str = "gemini"


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
