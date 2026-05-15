import { motion } from 'motion/react';
import { ShieldCheck, Activity, Cpu, Fingerprint, Scan, BrainCircuit, Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeviceManager from './DeviceManager';
import BluetoothHub from './BluetoothHub';
import { useVoiceStore, VoiceState } from '../store/voiceStore';

export default function Dashboard() {
  const [pulse, setPulse] = useState(72);
  const [brainActivity, setBrainActivity] = useState(42);
  const { state, setState, setTranscript } = useVoiceStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p + (Math.random() > 0.5 ? 1 : -1));
      setBrainActivity(b => Math.max(10, Math.min(100, b + (Math.random() > 0.5 ? 2 : -2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerVoiceCommand = () => {
    if (state === VoiceState.IDLE) {
      setTranscript('');
      setState(VoiceState.ACTIVE_LISTENING);
    } else if (state === VoiceState.ACTIVE_LISTENING) {
      setState(VoiceState.PROCESSING);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-8 mt-24 flex flex-col gap-8 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biometric Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 rounded-3xl border-cyan-500/20 relative overflow-hidden"
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

        {/* Neural Activity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-3xl border-blue-500/20 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-medium tracking-tight">Neural Bandwidth</h3>
              <p className="text-[10px] font-mono text-blue-500/60 uppercase tracking-widest">Cloud Processing</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-white/30">Synaptic Load</span>
                <span className="text-blue-400">{brainActivity}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: `${brainActivity}%` }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-mono text-white/30 uppercase mb-1">Latency</p>
                <p className="text-sm font-medium text-white tracking-tight">12ms</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-mono text-white/30 uppercase mb-1">Uptime</p>
                <p className="text-sm font-medium text-white tracking-tight">100%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voice Command Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-3xl border-purple-500/20 relative overflow-hidden flex flex-col items-center justify-center text-center"
        >
          <button 
            onClick={triggerVoiceCommand}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
              state === VoiceState.ACTIVE_LISTENING 
                ? 'bg-purple-500 border-white shadow-[0_0_30px_#fff]' 
                : 'bg-purple-500/10 border-purple-400/40 hover:bg-purple-500/20'
            }`}
          >
            <Mic className={`w-8 h-8 ${state === VoiceState.ACTIVE_LISTENING ? 'text-black animate-pulse' : 'text-purple-400'}`} />
          </button>
          <div className="mt-4">
            <h3 className="text-white font-medium tracking-tight">Voice Command</h3>
            <p className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest">Manual Override</p>
          </div>
          {state === VoiceState.ACTIVE_LISTENING && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-[10px] font-mono text-white animate-pulse"
            >
              Uplink Engaged...
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-light text-white tracking-tighter uppercase tracking-[0.2em]">Node Control Matrix</h2>
          </div>
          <DeviceManager />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-light text-white tracking-tighter uppercase tracking-[0.2em]">External Comms</h2>
          </div>
          <BluetoothHub />
        </div>
      </div>
    </div>
  );
}

