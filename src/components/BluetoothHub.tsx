import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bluetooth, BluetoothSearching, BluetoothConnected, RefreshCw, Plus, Zap, AlertTriangle, X } from 'lucide-react';

interface BTDevice {
  id: string;
  name: string;
  strength: number;
  status: 'available' | 'pairing' | 'connected';
  type: 'headset' | 'watch' | 'display' | 'sensor' | 'real';
  device?: any; // Using any for BluetoothDevice to avoid missing global types
}

export default function BluetoothHub() {
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmAndScan = () => {
    setShowConfirm(true);
  };
  const [devices, setDevices] = useState<BTDevice[]>([
    { id: 'bt-1', name: 'Mark VII HUD', strength: 98, status: 'connected', type: 'display' },
    { id: 'bt-2', name: 'Stark-Phone 14', strength: 75, status: 'available', type: 'headset' },
  ]);

  const bluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        strength: d.status === 'connected' 
          ? Math.min(100, Math.max(80, d.strength + (Math.random() * 4 - 2)))
          : d.strength
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scanForDevices = async () => {
    setShowConfirm(false);
    setIsScanning(true);
    setError(null);
    
    if (!bluetoothSupported) {
      setTimeout(() => {
        const newDevice: BTDevice = {
          id: `bt-${Math.random()}`,
          name: `Unlinked Node ${Math.floor(Math.random() * 1000)}`,
          strength: Math.floor(Math.random() * 40) + 30,
          status: 'available',
          type: 'sensor'
        };
        setDevices(prev => [...prev, newDevice]);
        setIsScanning(false);
      }, 2000);
      return;
    }

    try {
      // In many environments (like iframes), requestDevice might be restricted
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        // optionalServices: ['battery_service'] // Examples
      });

      const newRealDevice: BTDevice = {
        id: device.id,
        name: device.name || 'Unknown Bluetooth Device',
        strength: 100,
        status: 'available',
        type: 'real',
        device: device
      };

      setDevices(prev => {
        if (prev.find(d => d.id === device.id)) return prev;
        return [...prev, newRealDevice];
      });
    } catch (err: any) {
      console.warn('Bluetooth scan failed or cancelled:', err);
      const errorName = err.name;
      
      if (errorName === 'SecurityError') {
        setError('Discovery Blocked: Neural link requires secure context or user-agent permission. (Security Error)');
      } else if (errorName === 'NotSupportedError') {
        setError('Hardware Conflict: Bluetooth adapter not detected or protocol unsupported. (System Error)');
      } else if (errorName === 'InvalidStateError') {
        setError('Scan Aborted: Discovery process already active or logic state error. (State Collision)');
      } else if (errorName !== 'NotFoundError') {
        setError(`Discovery Failure: ${err.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const connectDevice = async (id: string) => {
    const target = devices.find(d => d.id === id);
    if (!target) return;

    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'pairing' } : d));

    if (target.type === 'real' && target.device) {
      try {
        // We attempt to connect. If it fails, we offer a fallback to simulated data
        const server = await target.device.gatt?.connect();
        console.log('Connected to GATT Server:', server);
        setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'connected' } : d));
      } catch (err: any) {
        console.error('Real Bluetooth connection failed:', err);
        
        // Check for specific error types
        let errorMessage = err.message;
        const errorName = err.name;
        
        if (errorName === 'NetworkError') {
          errorMessage = "Device out of range or link unstable. (Network Conflict)";
        } else if (errorName === 'SecurityError') {
          errorMessage = "Interface restricted. Check host firewall/permissions. (Security Lockout)";
        } else if (errorName === 'AbortError') {
          errorMessage = "Link attempt timed out or sync was aborted. (Process Terminal)";
        } else if (errorName === 'NotSupportedError') {
          errorMessage = "Bluetooth protocol not supported by this node. (Hardware Incompatibility)";
        } else if (errorName === 'NotFoundError') {
          errorMessage = "Target node no longer detectable in local vicinity. (Signal Lost)";
        } else if (errorName === 'InvalidStateError') {
          errorMessage = "Link state conflict. The device is already in a binding process. (State Error)";
        }

        setError(`Link Failure [${target.name}]: ${errorMessage}`);
        
        // Fallback: If real connection fails, we can "emulate" the connection for the UI
        // to maintain the "JARVIS" experience, while indicating it's a simulation.
        setTimeout(() => {
          setDevices(prev => prev.map(d => d.id === id ? { 
            ...d, 
            status: 'connected', 
            name: `${d.name} (Simulated Link)`,
            type: 'sensor' // Change type to simulated sensor
          } : d));
          setError(null);
        }, 1500);
      }
    } else {
      // Simulated link for demo devices
      setTimeout(() => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'connected' } : d));
      }, 2000);
    }
  };

  const disconnectDevice = (id: string) => {
    const target = devices.find(d => d.id === id);
    if (target?.type === 'real' && target.device) {
      target.device.gatt?.disconnect();
    }
    
    setDevices(prev => prev.map(d => d.id === id ? { 
      ...d, 
      status: 'available',
      name: d.name.replace(' (Simulated Link)', '') 
    } : d));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-3xl border-cyan-500/20 relative"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isScanning ? 'bg-cyan-500/20' : 'bg-blue-500/10'} text-cyan-400`}>
            {isScanning ? <BluetoothSearching className="w-6 h-6 animate-pulse" /> : <Bluetooth className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-white font-medium tracking-tight">Wireless Matrix</h3>
            <p className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Bluetooth Link 5.3</p>
          </div>
        </div>
        <button 
          onClick={confirmAndScan}
          disabled={isScanning}
          className={`p-2.5 rounded-xl border transition-all ${isScanning ? 'border-white/5 text-white/20' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}`}
        >
          <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 border border-cyan-500/30">
                <BluetoothSearching className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="text-white font-medium mb-1">Initiate Discovery?</h4>
              <p className="text-[10px] font-mono text-white/40 uppercase mb-6">Confirm external node handshake</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-[10px] font-mono uppercase hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={scanForDevices}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black text-[10px] font-bold font-mono uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] font-mono text-amber-200/70 leading-tight">
                {error}
              </p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto p-1 text-amber-500/50 hover:text-amber-500"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}

          {devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                device.status === 'connected' ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  device.status === 'connected' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-white/5 border-white/10 text-white/30'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-medium text-white truncate">{device.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-1 h-2 rounded-full ${i < Math.ceil(device.strength/25) ? 'bg-cyan-400' : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-white/30 uppercase">{device.status}</span>
                  </div>
                </div>
              </div>

              {device.status === 'available' && (
                <button 
                  onClick={() => connectDevice(device.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono uppercase hover:bg-cyan-500/20 transition-all"
                >
                  Link
                </button>
              )}
              {device.status === 'connected' && (
                <button 
                  onClick={() => disconnectDevice(device.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  Unlink
                </button>
              )}
              {device.status === 'pairing' && (
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0s]" />
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              {device.status === 'connected' && (
                <BluetoothConnected className="w-4 h-4 text-cyan-400" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={confirmAndScan}
          className="w-full py-4 border-2 border-dashed border-white/5 hover:border-white/20 rounded-2xl flex items-center justify-center gap-3 text-white/20 hover:text-white/40 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono uppercase tracking-widest">Connect New Node</span>
        </button>
      </div>
    </motion.div>
  );
}
