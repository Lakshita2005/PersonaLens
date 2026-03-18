import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  Brain, Award, Target, TrendingUp, AlertCircle, 
  Download, Share2, User, Camera, Sparkles, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Dashboard = ({ userData, interviewData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name,
            turns: interviewData
          })
        });
        const data = await response.json();
        setAnalysis(JSON.parse(data.analysis));
        setLoading(false);
      } catch (err) {
        console.error("Analysis error:", err);
        // Fallback dummy data for demo if backend is not running or fails
        setAnalysis({
          ocean: [
            { trait: 'Openness', A: 85, fullMark: 100 },
            { trait: 'Conscientiousness', A: 78, fullMark: 100 },
            { trait: 'Extraversion', A: 92, fullMark: 100 },
            { trait: 'Agreeableness', A: 80, fullMark: 100 },
            { trait: 'Neuroticism', A: 30, fullMark: 100 },
          ],
          summary: "A highly communicative and proactive candidate with strong leadership potential. Demonstrates exceptional emotional intelligence and adaptivity in pressurized environments.",
          strengths: ["Confident Public Speaking", "Rapid Problem Solving", "Empathic Leadership"],
          improvements: ["Attention to Minor Details", "Patience in Mentoring"],
          suggestions: ["Practice active listening techniques", "Dedicate time for deep-work focus sessions"]
        });
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [userData, interviewData]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617', // Match slate-950
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PersonaLens_Report_${userData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export report. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-6" />
      <h2 className="text-2xl font-bold text-gradient">Synthesizing Your Persona...</h2>
    </div>
  );

  return (
    <motion.div 
      ref={reportRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20 p-4"
    >
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] -z-10" />
        
        {userData.photo ? (
          <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-2 border-primary-500 shadow-2xl shadow-primary-500/20">
            <img src={userData.photo} alt={userData.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-6xl font-black text-white shadow-2xl shadow-primary-500/20">
            {userData.name.charAt(0)}
          </div>
        )}

        <div className="flex-grow text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-bold text-primary-300 uppercase tracking-tighter">AI Certified Profile</span>
          </div>
          <h1 className="text-5xl font-bold mb-2">{userData.name}</h1>
          <p className="text-slate-400 text-lg max-w-xl italic">"{analysis.summary}"</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-all shadow-lg shadow-primary-600/20"
          >
            <Download className="w-5 h-5" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personality Radar */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-8 self-start flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary-400" /> Personality Architecture
          </h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.ocean}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Traits"
                  dataKey="A"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20">
            <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-3">
              <Award className="w-5 h-5" /> Core Strengths
            </h3>
            <div className="space-y-4">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-lg font-bold text-amber-400 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> Areas of Growth
            </h3>
            <div className="space-y-4">
              {analysis.improvements.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-300 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="p-10 rounded-[3rem] bg-primary-600/5 border border-primary-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/10 blur-[60px]" />
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-4">
          <Target className="w-8 h-8 text-primary-400" /> Expert Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.suggestions.map((s, i) => (
            <div 
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4 transition-all hover:bg-white/10"
            >
              <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 font-bold text-xl">0{i+1}</div>
              <p className="text-slate-300 leading-relaxed font-medium">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="flex justify-center pt-8 no-print">
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 px-8 py-5 rounded-3xl bg-white text-slate-950 font-black hover:bg-slate-200 transition-all shadow-xl shadow-white/10"
        >
          <RefreshCw className="w-5 h-5" /> Retake Intelligence Assessment
        </button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
