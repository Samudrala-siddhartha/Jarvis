/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ParticleEngine from './components/ParticleEngine';
import Sidebar from './components/Sidebar';
import JARVISChat from './components/JARVISChat';
import VoiceManager from './components/VoiceManager';
import Dashboard from './components/Dashboard';
import SubtitlePanel from './components/SubtitlePanel';
import MapDisplay from './components/MapDisplay';
import { motion, AnimatePresence } from 'motion/react';
import { useVoiceStore, VoiceState } from './store/voiceStore';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';

export default function App() {
  const { state } = useVoiceStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen bg-jarvis-bg text-slate-200 selection:bg-cyan-500/30 overflow-hidden font-sans scanlines" id="jarvis-root">
      {/* Atmospheric Background Gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-900 rounded-full blur-[100px]"></div>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
            id="intro-overlay"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-light tracking-[0.4em] text-white uppercase mb-4">JARVIS</h1>
              <p className="text-cyan-500 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Initializing System...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience */}
      <ParticleEngine />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Sidebar />
        
        {/* HUD Overlay */}
        <div className="flex-1 flex flex-col items-center">
          <header className="w-full px-8 py-8 flex justify-between items-start z-30">
            <div className="flex items-center gap-6">
              {/* Menu is handled by Sidebar component button, but we align text here */}
              <div className="ml-16">
                <h1 className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase opacity-70">Digital Core Interface</h1>
                <p className="text-2xl font-light tracking-tight text-white">JARVIS <span className="text-white/30">v4.0.2</span></p>
              </div>
            </div>

            <div className="hidden md:flex space-x-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-cyan-500 uppercase leading-none mb-1">
                    {isOnline ? 'System Online' : 'Standalone Mode'}
                  </p>
                  <p className={`text-sm font-semibold tracking-tight ${isOnline ? 'text-white' : 'text-amber-400'}`}>
                    {isOnline ? 'ENCRYPTED • SECURE' : 'LOCAL CACHE ONLY'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center border-2 border-white/20 shadow-lg transition-all ${
                  isOnline ? 'from-cyan-500 to-blue-600 shadow-cyan-500/30' : 'from-amber-500 to-orange-600 shadow-amber-500/30'
                }`}>
                  <span className="text-xs font-bold text-white uppercase">{auth.currentUser?.displayName?.[0] || 'AI'}</span>
                </div>
              </div>
            </div>
          </header>

          <Dashboard />
        </div>

        <SubtitlePanel />
        <MapDisplay />
        <VoiceManager />
        <JARVISChat />

        {/* Global VFX */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)] z-20" />
        <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-30" />
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .prose strong {
          color: #22d3ee;
          font-weight: 600;
        }

        @keyframes scan {
          from { top: -100%; }
          to { top: 200%; }
        }

        .scanlines::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.1) 50%
          ), linear-gradient(
            90deg, 
            rgba(255, 0, 0, 0.02), 
            rgba(0, 255, 0, 0.01), 
            rgba(0, 0, 255, 0.02)
          );
          background-size: 100% 4px, 3px 100%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.2;
        }
      `}</style>
    </main>
  );
}
