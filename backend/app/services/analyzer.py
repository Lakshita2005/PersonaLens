import json
from typing import Any

from app.core.config import Settings
from app.schemas.analysis import AnalysisRequest, PersonalityAnalysis


def _model_dump(value: Any) -> dict[str, Any]:
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return value.dict()


def _strip_json_fence(value: str) -> str:
    text = value.strip()

    if text.startswith("```json"):
        return text[7:-3].strip()

    if text.startswith("```"):
        return text[3:-3].strip()

    return text


def fallback_analysis(request: AnalysisRequest) -> PersonalityAnalysis:
    track = request.assessmentTrack or "academic readiness"
    program = request.program or "the academic program"

    return PersonalityAnalysis(
        ocean=[
            {"trait": "Openness", "A": 84, "fullMark": 100},
            {"trait": "Conscientiousness", "A": 79, "fullMark": 100},
            {"trait": "Extraversion", "A": 76, "fullMark": 100},
            {"trait": "Agreeableness", "A": 82, "fullMark": 100},
            {"trait": "Neuroticism", "A": 34, "fullMark": 100},
        ],
        summary=(
            f"{request.name} shows strong reflective ability for {track} in {program}. "
            "The profile suggests good readiness for mentor-led interview practice, "
            "with room to improve specificity, evidence, and concise storytelling."
        ),
        strengths=[
            "Structured self-reflection",
            "Collaborative response orientation",
            "Composed interview presence",
        ],
        improvements=[
            "Add measurable outcomes to project stories",
            "Use tighter examples for conflict and pressure",
            "Connect academic work to career goals more directly",
        ],
        suggestions=[
            "Practice two STAR-format stories before the next mock interview.",
            "Prepare a concise explanation for one academic project and one leadership moment.",
            "Use the PDF report as a mentor review brief for targeted feedback.",
        ],
    )


class PersonalityAnalyzer:
    def __init__(self, settings: Settings):
        self.settings = settings

    def analyze(self, request: AnalysisRequest) -> tuple[PersonalityAnalysis, str]:
        if not self.settings.gemini_api_key:
            return fallback_analysis(request), "fallback"

        prompt = self._build_prompt(request)
        response_text = self._generate_content(prompt)
        raw_text = _strip_json_fence(response_text)
        payload = json.loads(raw_text)
        return PersonalityAnalysis(**payload), "gemini"

    def _generate_content(self, prompt: str) -> str:
        try:
            from google import genai

            client = genai.Client(api_key=self.settings.gemini_api_key)
            response = client.models.generate_content(
                model=self.settings.gemini_model,
                contents=prompt,
            )
            return response.text or ""
        except ImportError:
            import google.generativeai as legacy_genai

            legacy_genai.configure(api_key=self.settings.gemini_api_key)
            model = legacy_genai.GenerativeModel(self.settings.gemini_model)
            response = model.generate_content(prompt)
            return response.text

    def _build_prompt(self, request: AnalysisRequest) -> str:
        payload = _model_dump(request)

        return f"""
Analyze the personality profile for {request.name}.

Context:
- Program: {request.program or "Not provided"}
- Assessment track: {request.assessmentTrack or "Not provided"}

Use the interview transcript and emotion timeline to produce mentor-friendly academic readiness guidance.
Return only a valid JSON object. No markdown, preamble, comments, or code fences.

Schema:
{{
  "ocean": [
    {{ "trait": "Openness", "A": 0, "fullMark": 100 }},
    {{ "trait": "Conscientiousness", "A": 0, "fullMark": 100 }},
    {{ "trait": "Extraversion", "A": 0, "fullMark": 100 }},
    {{ "trait": "Agreeableness", "A": 0, "fullMark": 100 }},
    {{ "trait": "Neuroticism", "A": 0, "fullMark": 100 }}
  ],
  "summary": "One concise paragraph for mentors and placement teams.",
  "strengths": ["Three concrete strengths"],
  "improvements": ["Three concrete growth areas"],
  "suggestions": ["Three actionable mentor or candidate next steps"]
}}

Data:
{json.dumps(payload, ensure_ascii=True)}
""".strip()
