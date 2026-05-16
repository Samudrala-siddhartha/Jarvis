import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Thermometer, Wind, Home, Power, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useJarvisApi } from '../hooks/useJarvisApi';
import { useVoiceStore } from '../store/voiceStore';

interface Automation {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'idle';
  trigger: string;
  action: string;
  icon: any;
}

export default function SmartHomeManager() {
  const { vocalize } = useJarvisApi();
  const { isVoiceEnabled } = useVoiceStore();
  const [automations, setAutomations] = useState<Automation[]>([
    { id: '1', name: 'Ambient Lighting', status: 'active', trigger: 'Low natural light detected', action: 'Adjusted to 2700K Warm White', icon: Lightbulb },
    { id: '2', name: 'Climate Control', status: 'idle', trigger: 'Room occupancy: High', action: 'Lowered fan speed by 15%', icon: Thermometer },
    { id: '3', name: 'Air Purification', status: 'pending', trigger: 'Particulate spike detected', action: 'Activating HEPA filter', icon: Wind },
  ]);

  const reportStatus = useCallback(async (automation: Automation) => {
    if (!isVoiceEnabled) return;
    const report = `${automation.name} status shift: ${automation.action}`;
    vocalize(report);
  }, [isVoiceEnabled, vocalize]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutomations(prev => {
        const statuses: ('active' | 'pending' | 'idle')[] = ['active', 'pending', 'idle'];
        const targetIndex = Math.floor(Math.random() * prev.length);
        
        return prev.map((a, i) => {
          if (i === targetIndex && Math.random() > 0.85) {
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const actionPrefix = newStatus === 'active' ? 'Neural Link Optimized: ' : 'Learning Cycle: ';
            const currentAction = a.action.split(': ').pop() || a.action;
            const updated = { 
              ...a, 
              status: newStatus,
              action: `${actionPrefix}${currentAction}`
            };
            
            if (newStatus === 'active') {
              reportStatus(updated);
            }
            
            return updated;
          }
          return a;
        });
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [reportStatus]);

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/10 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5 text-white/50">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-medium tracking-tight">Smart Domain</h3>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">AI Habit Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-tighter">AI Driven</span>
        </div>
      </div>

      <div className="space-y-4">
        {automations.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group interactive-card"
          >
            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-2 rounded-xl border transition-colors ${
                item.status === 'active' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' :
                item.status === 'pending' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
                'bg-white/5 border-white/10 text-white/20'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white tracking-tight">{item.name}</h4>
                  <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                    item.status === 'active' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                    item.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' :
                    'bg-white/5 border-white/10 text-white/20'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                  <span className="text-white/60">Trigger:</span> {item.trigger}
                </p>
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.action}
                  className="text-[10px] text-cyan-400 font-mono mt-0.5"
                >
                  {item.action}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 px-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group">
        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" />
        Analyze Habits
      </button>
    </div>
  );
}
