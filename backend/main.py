import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterviewTurn(BaseModel):
    question: str
    answer: str
    emotions: List[dict]

class AnalysisRequest(BaseModel):
    name: str
    turns: List[InterviewTurn]

@app.get("/")
def read_root():
    return {"message": "PersonaLens API is running"}

@app.post("/analyze")
async def analyze_personality(request: AnalysisRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    
    # Prompt engineering for detailed personality and linguistic analysis
    prompt = f"""
    Analyze the personality and communication style of {request.name} based on the following interview transcript and emotional data.
    
    CRITICAL: Pay close attention to linguistic patterns such as:
    1. Filler words (e.g., "um", "uh", "like", "you know", "actually").
    2. Stammering or repetitions.
    3. Sentence structure and clarity.
    
    Return ONLY a valid JSON object. No markdown, no pre-amble, no triple backticks.
    
    Format:
    {{
      "ocean": [
        {{ "trait": "Openness", "A": score, "fullMark": 100 }},
        {{ "trait": "Conscientiousness", "A": score, "fullMark": 100 }},
        {{ "trait": "Extraversion", "A": score, "fullMark": 100 }},
        {{ "trait": "Agreeableness", "A": score, "fullMark": 100 }},
        {{ "trait": "Neuroticism", "A": score, "fullMark": 100 }}
      ],
      "summary": "Concise high-level summary",
      "linguistic_analysis": {{
        "filler_count": total_count_of_fillers,
        "top_fillers": ["filler1", "filler2"],
        "clarity_score": score_out_of_100,
        "stammering_detected": true/false,
        "feedback": "Specific feedback on speech patterns and how to improve clarity"
      }},
      "role_suitability": [
        {{ "role": "Leadership", "match": score_out_of_100 }},
        {{ "role": "Technical/Analytical", "match": score_out_of_100 }},
        {{ "role": "Creative/Strategic", "match": score_out_of_100 }},
        {{ "role": "Customer-Facing/Social", "match": score_out_of_100 }}
      ],
      "personality_deep_dive": {{
        "strengths_detailed": "In-depth analysis of core strengths",
        "growth_detailed": "Deep dive into areas for professional and personal growth"
      }},
      "suggestions": ["Immediate actionable suggestion 1", "Suggestion 2"]
    }}
    
    Data:
    {request.turns}
    """
    
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    
    # Simple cleaning if Gemini includes backticks
    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:-3].strip()
    elif text.startswith("```"):
        text = text[3:-3].strip()
        
    return {"analysis": text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
