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
    
    # Prompt engineering for personality analysis
    prompt = f"""
    Analyze the personality of {request.name} based on the following interview transcript and emotional data.
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
      "summary": "Full text summary",
      "strengths": ["Strength 1", "Strength 2"],
      "improvements": ["Improvement 1", "Improvement 2"],
      "suggestions": ["Suggestion 1", "Suggestion 2"]
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
