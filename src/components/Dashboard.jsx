import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  Brain, Award, Target, TrendingUp, AlertCircle, 
  Download, Share2, User, Camera, Sparkles, RefreshCw, Mic, Loader2
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
        // Fallback dummy data for demo
        setAnalysis({
          ocean: [
            { trait: 'Openness', A: 85, fullMark: 100 },
            { trait: 'Conscientiousness', A: 78, fullMark: 100 },
            { trait: 'Extraversion', A: 92, fullMark: 100 },
            { trait: 'Agreeableness', A: 80, fullMark: 100 },
            { trait: 'Neuroticism', A: 30, fullMark: 100 },
          ],
          summary: "A highly communicative and proactive candidate with strong leadership potential. Demonstrates exceptional emotional intelligence and adaptivity in pressurized environments.",
          linguistic_analysis: {
            filler_count: 12,
            top_fillers: ["um", "actually", "like"],
            clarity_score: 88,
            stammering_detected: false,
            feedback: "Your speech is highly articulate. You use 'actually' as a filler occasionally, but it doesn't detract from your professional presence. Practice pausing instead of using fillers to reach a 95+ clarity score."
          },
          role_suitability: [
            { role: "Leadership", match: 92 },
            { role: "Technical", match: 78 },
            { role: "Creative", match: 85 },
            { role: "Social", match: 95 }
          ],
          personality_deep_dive: {
            strengths_detailed: "Your primary strength lies in your ability to synthesize complex emotional cues while maintaining high logical output. You lead with empathy but decide with data, a rare combination that builds high-trust teams.",
            growth_detailed: "While your extraversion is an asset, you may occasionally overshadow quieter team members. Focusing on 'active silence' during brainstorming sessions could unlock even more value from your peers."
          },
          suggestions: ["Practice 'Active Silence' techniques", "Reduce 'actually' usage in high-stakes starts", "Leverage your high openness for cross-departmental projects"]
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
        backgroundColor: '#020617',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // If the content is very long, we might need multiple pages, 
      // but for now let's fit it to one long page or improve scaling
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PersonaLens_Premium_Report_${userData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export report. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-primary-500/10 border-t-primary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-black text-gradient mt-8 text-center">Architecting Your Persona...</h2>
      <p className="text-slate-500 mt-2 animate-pulse">Running linguistic and emotional cross-analysis</p>
    </div>
  );

  return (
    <motion.div 
      ref={reportRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-24 p-6"
    >
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-10 p-12 rounded-[4rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] -z-10" />
        
        {userData.photo ? (
          <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-4 border-primary-500/30 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <img src={userData.photo} alt={userData.name} className="w-full h-full object-cover scale-110" />
          </div>
        ) : (
          <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-7xl font-black text-white shadow-2xl shadow-primary-500/20 transform -rotate-3">
            {userData.name.charAt(0)}
          </div>
        )}

        <div className="flex-grow text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 mb-6 transition-all hover:bg-primary-500/30 cursor-default">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-black text-primary-200 uppercase tracking-[0.2em]">Premium Intelligence Report</span>
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tight">{userData.name}</h1>
          <p className="text-slate-300 text-xl max-w-2xl leading-relaxed font-medium italic opacity-90">"{analysis.summary}"</p>
        </div>
        
        <div className="no-print">
          <button 
            onClick={handleExport}
            className="group flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-white text-slate-950 font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
          >
            <Download className="w-6 h-6 group-hover:bounce" /> 
            <span>Download VIP Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Personality Radar */}
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:border-primary-500/30 transition-colors group">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-white">
            <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7" />
            </div>
            Trait Architecture
          </h3>
          <div className="w-full h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.ocean}>
                <PolarGrid stroke="#334155" strokeWidth={1} />
                <PolarAngleAxis dataKey="trait" tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Traits"
                  dataKey="A"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="#0ea5e9"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Linguistic Analysis Card */}
        <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors group">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-white">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Mic className="w-7 h-7" />
            </div>
            Communication Intelligence
          </h3>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
              <div className="text-4xl font-black text-indigo-400 mb-1">{analysis.linguistic_analysis.clarity_score}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clarity Score</div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
              <div className="text-4xl font-black text-pink-400 mb-1">{analysis.linguistic_analysis.filler_count}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filler Words</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black text-slate-400 mb-3 uppercase tracking-widest">Top Fillers Detected</h4>
              <div className="flex flex-wrap gap-3">
                {analysis.linguistic_analysis.top_fillers.map((f, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-sm">
                    "{f}"
                  </span>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border-l-4 border-indigo-500 italic text-slate-300 leading-relaxed">
              "{analysis.linguistic_analysis.feedback}"
            </div>
            {analysis.linguistic_analysis.stammering_detected && (
              <div className="flex items-center gap-3 text-amber-400 font-bold text-sm bg-amber-400/10 p-4 rounded-xl border border-amber-400/20">
                <AlertCircle className="w-5 h-5" />
                Linguistic Hesitation (Stammering) detected in high-pressure responses.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Role Suitability */}
        <div className="lg:col-span-1 p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10">
          <h3 className="text-xl font-black mb-8 flex items-center gap-4">
            <Target className="w-6 h-6 text-emerald-400" /> Career Alignment
          </h3>
          <div className="space-y-8">
            {analysis.role_suitability.map((role, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-300">{role.role}</span>
                  <span className="text-emerald-400">{role.match}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${role.match}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[3rem] bg-primary-500/5 border border-primary-500/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-6 text-primary-400 flex items-center gap-3">
                <Award className="w-6 h-6" /> Professional Edge
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium">
                {analysis.personality_deep_dive.strengths_detailed}
              </p>
            </div>
          </div>
          <div className="p-10 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-6 text-amber-400 flex items-center gap-3">
                <TrendingUp className="w-6 h-6" /> Growth Strategy
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium">
                {analysis.personality_deep_dive.growth_detailed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="p-12 rounded-[4rem] bg-gradient-to-tr from-primary-600/10 to-indigo-600/10 border border-primary-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px]" />
        <h3 className="text-3xl font-black mb-10 text-center flex items-center justify-center gap-4">
          <Sparkles className="w-8 h-8 text-primary-400" /> Strategic Protocol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysis.suggestions.map((s, i) => (
            <div 
              key={i}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center text-center gap-4 transition-all hover:bg-white/10 hover:border-primary-500/40 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-xl group-hover:bg-primary-500 text-white transition-all">
                {i+1}
              </div>
              <p className="text-slate-200 leading-relaxed font-bold">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="flex justify-center pt-12 no-print">
        <button 
          onClick={() => window.location.reload()}
          className="group flex items-center gap-4 px-10 py-6 rounded-full bg-slate-900 border border-white/10 text-white font-black hover:bg-slate-800 transition-all shadow-2xl"
        >
          <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> 
          Reset Intelligence Matrix
        </button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
