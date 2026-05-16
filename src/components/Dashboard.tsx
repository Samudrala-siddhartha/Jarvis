import { motion } from 'motion/react';
import { ShieldCheck, Activity, Cpu, Fingerprint, Scan, BrainCircuit, Mic, Power } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeviceManager from './DeviceManager';
import BluetoothHub from './BluetoothHub';
import { useVoiceStore, VoiceState } from '../store/voiceStore';

import TelemetryDashboard from './TelemetryDashboard';
import SmartHomeManager from './SmartHomeManager';
import CelestialOrbit from './CelestialOrbit';

/**
 * Dashboard Component
 * The central command matrix displaying real-time biometric and neural telemetry.
 * Serves as the primary visual display for Project Alpha-Omega.
 */
export default function Dashboard() {
  const [pulse, setPulse] = useState(72);
  const [brainActivity, setBrainActivity] = useState(42);
  const { state, setState, setTranscript, isVoiceEnabled, setVoiceEnabled } = useVoiceStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p + (Math.random() > 0.5 ? 1 : -1));
      setBrainActivity(b => Math.max(10, Math.min(100, b + (Math.random() > 0.5 ? 2 : -2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled(!isVoiceEnabled);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-8 mt-24 flex flex-col gap-8 pb-32">
      {/* Top Level Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biometric Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 rounded-3xl border-cyan-500/20 relative overflow-hidden interactive-card"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-medium tracking-tight">Biometric Link</h3>
              <p className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Active Connection</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Heart Rate</p>
                <p className="text-3xl font-light text-white">{pulse} <span className="text-xs text-white/30 uppercase font-mono tracking-normal">bpm</span></p>
              </div>
              <div className="flex gap-1 items-end h-10 pb-1">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, 30, 10] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-cyan-500/40 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Identity Match</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-medium text-white">99.9% Verified</p>
                </div>
              </div>
              <p className="text-[10px] font-mono text-emerald-400 animate-pulse uppercase">Authorized</p>
            </div>
          </div>
        </motion.div>

        {/* Advanced Telemetry Graphs */}
        <div className="md:col-span-2">
           <TelemetryDashboard />
        </div>
      </div>

      {/* Middle Section: Automations & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-light text-white tracking-tighter uppercase tracking-[0.2em]">Smart Domain Automations</h2>
          </div>
          <SmartHomeManager />
        </div>
        
        <div className="flex flex-col gap-8">
          {/* Quick Voice Access */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-3xl border-purple-500/20 relative overflow-hidden flex flex-col items-center justify-center text-center h-[240px]"
          >
            <div className="absolute top-4 right-4">
               <div className={`flex items-center gap-2 px-2 py-1 rounded-md border text-[8px] font-mono uppercase tracking-tighter ${
                 isVoiceEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
               }`}>
                 <Power className="w-2 h-2" />
                 {isVoiceEnabled ? 'Online' : 'Offline'}
               </div>
            </div>

            <button 
              onClick={toggleVoice}
              className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                isVoiceEnabled 
                  ? 'bg-purple-500 border-white shadow-[0_0_30px_#fff]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <Mic className={`w-8 h-8 ${isVoiceEnabled ? 'text-black animate-pulse' : 'text-white/20'}`} />
            </button>
            <div className="mt-4">
              <h3 className="text-white font-medium tracking-tight">Vocal Interface</h3>
              <p className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest">Manual Activation</p>
            </div>
            {isVoiceEnabled && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-[8px] font-mono text-purple-400 animate-pulse uppercase tracking-[0.2em]"
              >
                Neural Link Active
              </motion.div>
            )}
          </motion.div>

          {/* Astrology Intelligence */}
          <CelestialOrbit />

          {/* Comms */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-light text-white tracking-tighter uppercase tracking-[0.2em]">External Comms</h2>
            </div>
            <BluetoothHub />
          </div>
        </div>
      </div>

      {/* Control Matrix */}
      <div className="w-full">
         <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-light text-white tracking-tighter uppercase tracking-[0.2em]">Node Control Matrix</h2>
          </div>
        <DeviceManager />
      </div>
    </div>
  );
}
