# 🎭 PersonaLens: AI Personality Intelligence Analyzer

PersonaLens is a state-of-the-art AI-powered platform designed to provide deep insights into personality traits through multimodal interview intelligence. By combining real-time emotion detection with advanced large language models (LLMs), PersonaLens offers a comprehensive analysis of an individual's behavioral patterns and personality characteristics.

![Dashboard Preview](https://via.placeholder.com/800x450?text=PersonaLens+Dashboard+Preview)

## 🚀 Features

- **🧠 Multimodal Analysis**: Combines transcript text with real-time emotional data for a holistic personality assessment.
- **😊 Real-time Emotion Detection**: Uses `face-api.js` to track facial expressions and emotional states during interviews.
- **✨ AI-Powered Insights**: Leverages Google's **Gemini Pro** to analyze interview turns and provide a detailed personality profile.
- **📊 OCEAN Model Visualization**: Visualizes personality traits using the Big Five (OCEAN) model:
  - **O**penness
  - **C**onscientiousness
  - **E**xtraversion
  - **A**greeableness
  - **N**euroticism
- **📝 Actionable Feedback**: Provides summaries, identifies strengths, and suggests areas for improvement and growth.
- **📱 Responsive Design**: A modern, sleek UI built with React and Tailwind CSS, featuring glassmorphism and smooth animations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **ML**: `face-api.js` (for client-side emotion detection)

### Backend
- **Framework**: FastAPI (Python)
- **AI Engine**: Google Generative AI (Gemini Pro)
- **Validation**: Pydantic
- **Environment**: Python-dotenv

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Start the backend server:
   ```bash
   python main.py
   ```
   The API will be running at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
PersonaLens/
├── backend/            # FastAPI Backend
│   ├── main.py        # API implementation
│   └── requirements.txt
├── src/               # React Frontend
│   ├── components/    # UI Components
│   └── App.jsx
├── public/            # Static assets
├── tailwind.config.js
└── vite.config.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
