from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    PreparationRequest,
    PreparationResponse,
)
from app.services.analyzer import PersonalityAnalyzer
from app.services.preparation import prepare_interview_plan

router = APIRouter(tags=["analysis"])
legacy_router = APIRouter(tags=["analysis"])


def _run_analysis(request: AnalysisRequest) -> AnalysisResponse:
    settings = get_settings()
    analyzer = PersonalityAnalyzer(settings)

    try:
        analysis, provider = analyzer.analyze(request)
    except Exception as exc:  # External LLM parsing/network errors should not leak.
        raise HTTPException(status_code=502, detail="Analysis provider failed") from exc

    return AnalysisResponse(analysis=analysis, provider=provider)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_personality(request: AnalysisRequest) -> AnalysisResponse:
    return _run_analysis(request)


@router.post("/prepare", response_model=PreparationResponse)
async def prepare_interview(request: PreparationRequest) -> PreparationResponse:
    return prepare_interview_plan(request)


@legacy_router.post("/analyze", response_model=AnalysisResponse)
async def analyze_personality_legacy(request: AnalysisRequest) -> AnalysisResponse:
    return _run_analysis(request)
