import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Interview from './components/Interview';
import Dashboard from './components/Dashboard';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [step, setStep] = useState('landing'); // 'landing', 'interview', 'dashboard'
  const [userData, setUserData] = useState({ name: '', photo: null });
  const [interviewData, setInterviewData] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const handleStart = (data) => {
    setUserData(data);
    setStep('interview');
  };

  const handleComplete = (data) => {
    setInterviewData(data);
    setStep('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)] pointer-events-none" />
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {step === 'landing' && <Landing onStart={handleStart} key="landing" />}
          {step === 'interview' && (
            <Interview 
              userName={userData.name} 
              onComplete={handleComplete} 
              key="interview" 
            />
          )}
          {step === 'dashboard' && (
            <Dashboard 
              userData={userData} 
              interviewData={interviewData} 
              key="dashboard" 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
