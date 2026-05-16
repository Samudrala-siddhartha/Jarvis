import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Activity, Zap, Shield, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

const generateData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    load: Math.floor(Math.random() * 40) + 30,
    latency: Math.floor(Math.random() * 20) + 10,
    security: Math.floor(Math.random() * 10) + 90,
  }));
};

export default function TelemetryDashboard() {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1), {
          time: prev[prev.length - 1].time + 1,
          load: Math.floor(Math.random() * 40) + 30,
          latency: Math.floor(Math.random() * 20) + 10,
          security: Math.floor(Math.random() * 5) + 95,
        }];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* System Load Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl border-cyan-500/20 interactive-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-medium tracking-tight">Neural Load</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Real-time</span>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000000aa', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#22d3ee' }}
              />
              <Area 
                type="monotone" 
                dataKey="load" 
                stroke="#22d3ee" 
                fillOpacity={1} 
                fill="url(#colorLoad)" 
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Latency & Security Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 rounded-3xl border-blue-500/20 interactive-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium tracking-tight">Network Integrity</h3>
          </div>
          <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest">Global Link</span>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000000aa', border: '1px solid #ffffff10', borderRadius: '12px' }}
              />
              <Line 
                type="stepAfter" 
                dataKey="security" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
