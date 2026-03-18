import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Volume2, Loader2, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { useEmotions } from '../hooks/useEmotions';

const QUESTIONS = [
  "How would you describe yourself in three words?",
  "What is your biggest professional achievement so far?",
  "How do you handle high-pressure situations or tight deadlines?",
  "Describe a time when you had to work with a difficult team member.",
  "What motivates you to keep growing in your career?",
  "Where do you see yourself in the next five years?"
];

const Interview = ({ userName, onComplete, onCapturePhoto }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interviewLog, setInterviewLog] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  const videoRef = useRef(null);
  const { emotions, modelsLoaded } = useEmotions(videoRef);
  const recognitionRef = useRef(null);
  const emotionHistoryRef = useRef([]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };
    }
  }, []);

  // Update emotion history for current question
  useEffect(() => {
    if (emotions && isRecording) {
      emotionHistoryRef.current.push({ ...emotions, timestamp: Date.now() });
    }
  }, [emotions, isRecording]);

  const speak = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
      // Wait a bit before asking the first question
      setTimeout(() => speak(`Hello ${userName}, let's begin. ${QUESTIONS[0]}`), 1500);
    }
  }, [modelsLoaded, userName, speak]);

  const startCamera = async () => {
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("✅ Camera stream active");
      }
    } catch (err) {
      console.error("❌ Camera error:", err);
      alert("Uh oh! Camera/Mic access was denied or not found. Please ensure they are connected and permissions are allowed.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      onCapturePhoto(photoData);
      console.log("📸 Photo captured");
    }
  };

  const handleNext = async () => {
    // Capture photo on first question if not already captured
    if (currentIdx === 0) capturePhoto();

    // Save current response
    const logEntry = {
      question: QUESTIONS[currentIdx],
      answer: transcript,
      emotions: [...emotionHistoryRef.current]
    };
    
    setInterviewLog(prev => [...prev, logEntry]);
    
    if (currentIdx < QUESTIONS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTranscript('');
      emotionHistoryRef.current = [];
      speak(QUESTIONS[nextIdx]);
    } else {
      setIsAIThinking(true);
      // Finalize and conclude
      onComplete([...interviewLog, logEntry]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto py-4">
      {/* Left: Video Feed */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl group"
      >
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="w-full h-full object-cover grayscale-[0.2] brightness-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        
        {/* Real-time Emotion HUD */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex flex-wrap gap-2">
            {emotions && Object.entries(emotions).map(([emo, val]) => {
              if (val < 0.1) return null;
              return (
                <div key={emo} className="px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  <span className="text-xs font-semibold capitalize tracking-wider">{emo} {Math.round(val * 100)}%</span>
                </div>
              );
            })}
          </div>
          {!modelsLoaded && (
            <div className="flex items-center gap-2 text-primary-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" /> Initializing AI Lens...
            </div>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-6 right-6 px-4 py-2 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">Live Analysis</span>
          </div>
        )}
      </motion.div>

      {/* Right: Interaction Area */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:min-h-[600px] flex flex-col"
      >
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex-grow flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-primary-500 uppercase tracking-widest">Question {currentIdx + 1} of {QUESTIONS.length}</span>
              <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
            <h2 className="text-3xl font-semibold leading-tight text-white">{QUESTIONS[currentIdx]}</h2>
          </div>

          <div className="flex-grow mb-8 overflow-y-auto max-h-[300px] custom-scrollbar">
            <p className="text-slate-400 text-lg leading-relaxed italic">
              {transcript || "Speak to answer... Your response will be recorded and analyzed."}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-auto">
            <button
              onClick={toggleRecording}
              disabled={!modelsLoaded}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                isRecording 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20'
              }`}
            >
              {isRecording ? <Mic className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              {isRecording ? 'Listening...' : 'Push to Talk'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!transcript.trim() || isAIThinking}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tips / Live Insights */}
        <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
          <div className="p-2 rounded-xl bg-primary-500/10">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <p className="text-xs text-primary-300">
            <strong>AI Insight:</strong> Keep a steady posture and moderate volume for best analysis accuracy.
          </p>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isAIThinking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center flex-col text-center p-6"
          >
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-8" />
            <h2 className="text-4xl font-bold mb-4">Processing Intelligence...</h2>
            <p className="text-slate-400 max-w-md">Our AI is analyzing your facial patterns, vocal sentiment, and personality traits to generate your report.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;
