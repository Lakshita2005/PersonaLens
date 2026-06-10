from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from app.schemas.analysis import PreparationRequest, PreparationResponse


CORE_PATH = (
    Path(__file__).resolve().parents[3]
    / "pipeline"
    / "docs"
    / "PersonaLens_Dynamic_Code_Pack"
)

if str(CORE_PATH) not in sys.path:
    sys.path.append(str(CORE_PATH))

from persona_lens_core import (  # noqa: E402
    QuestionItem,
    analyze_gap,
    build_question_items_from_company_questions,
    default_question_blueprint,
    parse_company_questions,
    parse_job_text,
    parse_resume_text,
)


def _dump_model(value: Any) -> dict[str, Any]:
    if hasattr(value, "model_dump"):
        return value.model_dump(exclude_none=True)
    if hasattr(value, "dict"):
        return value.dict(exclude_none=True)
    return dict(value)


def _question_from_blueprint(item: dict[str, Any]) -> QuestionItem:
    clean_item = dict(item)
    allowed_sources = {
        "company",
        "llm_generated",
        "gap_based",
        "resume_based",
        "job_description_based",
    }

    if clean_item.get("source") not in allowed_sources:
        clean_item["source"] = "llm_generated"

    return QuestionItem(**clean_item)


def _parse_company_question_input(value: str | None) -> list[str]:
    if not value:
        return []

    line_items = [
        line.strip(" -\t\r\n")
        for line in value.splitlines()
        if line.strip(" -\t\r\n")
    ]

    if len(line_items) > 1:
        return list(dict.fromkeys(line_items))

    return parse_company_questions(value)


def prepare_interview_plan(request: PreparationRequest) -> PreparationResponse:
    candidate = parse_resume_text(request.resumeText)
    job = parse_job_text(request.jobDescription)
    gap = analyze_gap(candidate, job)
    company_questions = _parse_company_question_input(request.companyQuestions)

    if company_questions:
        questions = build_question_items_from_company_questions(company_questions)
        source_priority = ["company_questions", "job_description", "gap_analysis", "resume"]
    else:
        blueprint = default_question_blueprint(
            job,
            gap,
            total_questions=request.totalQuestions,
        )
        questions = [_question_from_blueprint(item) for item in blueprint]
        source_priority = ["job_description", "gap_analysis", "resume", "behavioral"]

    return PreparationResponse(
        candidate=_dump_model(candidate),
        job=_dump_model(job),
        gap=_dump_model(gap),
        questions=[_dump_model(question) for question in questions],
        source_priority=source_priority,
    )
