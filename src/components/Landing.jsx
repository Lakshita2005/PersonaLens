import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Brain, Sparkles, User, ArrowRight } from 'lucide-react';

const Landing = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart({ name });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 inline-flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5 text-primary-400" />
        <span className="text-sm font-medium text-primary-300">AI-Powered Personality Intelligence</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent"
      >
        PersonaLens
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12"
      >
        Deep dive into your personality through multimodal AI analysis. Capture every nuance, 
        understand your strengths, and elevate your interview performance.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Candidate Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full group bg-primary-600 hover:bg-primary-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/20"
          >
            Start Intelligence Assessment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl text-left">
        {[
          { icon: Brain, title: "Personality Analysis", desc: "Advanced AI profiling based on Big Five traits." },
          { icon: Camera, title: "Emotion Detection", desc: "Real-time facial expression analysis during interaction." },
          { icon: Mic, title: "Voice Intelligence", desc: "Sentiment and confidence scoring via vocal cues." }
        ].map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4">
              <feat.icon className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="font-semibold mb-2">{feat.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
