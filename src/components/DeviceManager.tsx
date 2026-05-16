import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Thermometer, Tv, ShieldCheck, Wind, Lock, X, Minus, Plus, Settings2, Power, Filter } from 'lucide-react';
import { useState } from 'react';

interface Device {
  id: string;
  name: string;
  type: string;
  icon: any;
  state: any;
}

const devices: Device[] = [
  { id: 'lights_1', name: 'Main Lights', type: 'lighting', icon: Lightbulb, state: { on: true, brightness: 80, color: '#00f0ff' } },
  { id: 'ac_1', name: 'Climate Control', type: 'hvac', icon: Thermometer, state: { on: true, temp: 22, mode: 'cool' } },
  { id: 'tv_1', name: 'Home Theater', type: 'media', icon: Tv, state: { on: false, channel: 'Netflix', volume: 45 } },
  { id: 'lock_front', name: 'Security Hub', type: 'security', icon: Lock, state: { locked: true } },
  { id: 'fans_1', name: 'Air Circulation', type: 'ventilation', icon: Wind, state: { speed: 2, on: true } },
];

/**
 * DeviceManager Component
 * Sophisticated control matrix for IoT and peripheral systems in the Alpha-Omega environment.
 * Handles state management for lighting, HVAC, and security systems.
 */
export default function DeviceManager() {
  const [deviceList, setDeviceList] = useState<Device[]>(devices);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(devices.map(d => d.type)))];

  const filteredDevices = activeCategory === 'all' 
    ? deviceList 
    : deviceList.filter(d => d.type === activeCategory);

  const selectedDevice = deviceList.find(d => d.id === selectedId);

  const updateDeviceState = (id: string, newState: any) => {
    setDeviceList(prev => prev.map(d => d.id === id ? { ...d, state: { ...d.state, ...newState } } : d));
  };

  const toggleDevice = (id: string) => {
    const device = deviceList.find(d => d.id === id);
    if (!device) return;
    if ('on' in device.state) {
      updateDeviceState(id, { on: !device.state.on });
    } else if ('locked' in device.state) {
      updateDeviceState(id, { locked: !device.state.locked });
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/40 mr-2">
          <Filter className="w-4 h-4" />
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {filteredDevices.map((device) => {
          const isActive = ('on' in device.state && device.state.on) || ('locked' in device.state && device.state.locked);
          return (
            <motion.div
              key={device.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden group ${
                selectedId === device.id 
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <button 
                onClick={() => setSelectedId(selectedId === device.id ? null : device.id)}
                className="absolute inset-0 z-0"
              />
              
              <div className="flex justify-between items-start z-10 relative pointer-events-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/40'
                }`}>
                  <device.icon className="w-5 h-5" />
                </div>
                
                {/* Quick Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDevice(device.id);
                  }}
                  className={`p-2 rounded-lg pointer-events-auto transition-all ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                      : 'bg-white/5 text-white/20 hover:bg-white/10'
                  }`}
                >
                  {device.type === 'security' ? (
                    <Lock className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-cyan-400' : 'text-white/20'}`} />
                  ) : (
                    <Power className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-cyan-400' : 'text-white/20'}`} />
                  )}
                </button>
              </div>

              <div className="text-left z-10 relative pointer-events-none">
                <p className="text-white text-xs font-medium truncate">{device.name}</p>
                <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{device.type}</p>
              </div>
              
              {isActive ? (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] z-10 animate-pulse" />
              ) : (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] z-10 animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedDevice && (
          <motion.div
            key={selectedDevice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-panel p-6 rounded-3xl border-white/10 relative"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
                  <selectedDevice.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-white">{selectedDevice.name}</h3>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{selectedDevice.type} CONTROL</p>
                </div>
              </div>
              <button onClick={() => toggleDevice(selectedDevice.id)} className={`px-6 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${
                (('on' in selectedDevice.state && selectedDevice.state.on) || ('locked' in selectedDevice.state && selectedDevice.state.locked))
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
              }`}>
                {('locked' in selectedDevice.state) ? (selectedDevice.state.locked ? 'Unlock' : 'Lock') : (selectedDevice.state.on ? 'Power Off' : 'Power On')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contextual Controls */}
              {selectedDevice.type === 'lighting' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase">
                      <span>Intensity</span>
                      <span className="text-cyan-400">{selectedDevice.state.brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={selectedDevice.state.brightness} 
                      onChange={(e) => updateDeviceState(selectedDevice.id, { brightness: parseInt(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              )}

              {selectedDevice.type === 'hvac' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Target Thermal</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateDeviceState(selectedDevice.id, { temp: selectedDevice.state.temp - 1 })} className="p-2 bg-white/5 rounded-lg text-cyan-400"><Minus className="w-4 h-4"/></button>
                      <span className="text-2xl font-light text-white">{selectedDevice.state.temp}°</span>
                      <button onClick={() => updateDeviceState(selectedDevice.id, { temp: selectedDevice.state.temp + 1 })} className="p-2 bg-white/5 rounded-lg text-cyan-400"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              )}

              {selectedDevice.type === 'ventilation' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Flow Rate</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button 
                        key={lvl}
                        onClick={() => updateDeviceState(selectedDevice.id, { speed: lvl })}
                        className={`flex-1 py-3 rounded-lg font-mono text-xs ${selectedDevice.state.speed >= lvl ? 'bg-cyan-500 text-black font-bold' : 'bg-white/5 text-white/20'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <Settings2 className="w-5 h-5 text-white/20" />
                <div>
                  <p className="text-[10px] font-mono text-white/40 uppercase">Efficiency Mode</p>
                  <p className="text-xs text-white/60">Optimizing system for minimal resource drain.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
