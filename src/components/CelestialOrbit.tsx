import { motion } from 'motion/react';
import { Moon, Sun, Star, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * CelestialOrbit Component
 * Provides high-fidelity astrology intelligence and astral resonance mapping.
 */
export default function CelestialOrbit() {
  const [data, setData] = useState({
    sign: 'Aquarius',
    alignment: '98%',
    resonance: 'High',
    transit: 'Mars in Retrograde'
  });

  useEffect(() => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const interval = setInterval(() => {
      setData({
        sign: signs[Math.floor(Math.random() * signs.length)],
        alignment: `${Math.floor(Math.random() * 20) + 80}%`,
        resonance: Math.random() > 0.5 ? 'Peak' : 'High',
        transit: Math.random() > 0.5 ? 'Jupiter Ascending' : 'Mercury Direct'
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-3xl border-purple-500/20 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Star className="w-16 h-16 text-purple-400 rotate-12" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
          <Moon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-white font-medium tracking-tight">Celestial Resonance</h3>
          <p className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest">Astral Intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-3 h-3 text-amber-400" />
            <p className="text-[9px] font-mono text-white/30 uppercase">Solar Sign</p>
          </div>
          <p className="text-sm font-medium text-white tracking-tight">{data.sign}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-3 h-3 text-cyan-400" />
            <p className="text-[9px] font-mono text-white/30 uppercase">Alignment</p>
          </div>
          <p className="text-sm font-medium text-white tracking-tight">{data.alignment}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
        <p className="text-[10px] font-mono text-purple-400 uppercase mb-2 tracking-tighter italic">Current Transit</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/80">{data.transit}</p>
          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
