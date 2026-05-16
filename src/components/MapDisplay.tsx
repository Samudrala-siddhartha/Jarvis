import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, LocateFixed, Maximize2, Minimize2 } from 'lucide-react';
import { useVoiceStore } from '../store/voiceStore';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const HAS_VALID_KEY = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

/**
 * MapDisplay Component
 * Tactical geographic overlay powered by Google Maps Platform.
 * Features: Live location tracking, full-screen toggle, dark-mode styling, and scanline effects.
 */
export default function MapDisplay() {
  const { isMapOpen, mapConfig, setMapConfig } = useVoiceStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (mapConfig?.center) {
      setCurrentLocation(mapConfig.center);
    }
  }, [mapConfig]);

  const handleClose = () => {
    setMapConfig(null);
  };

  const getLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newPos);
          setMapConfig({ center: newPos, zoom: 15, title: 'Current Live Position' });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (!isMapOpen) return null;

  if (!HAS_VALID_KEY) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed z-[60] bottom-24 right-4 md:right-8 w-[90vw] md:w-[400px] glass-panel rounded-2xl p-6 border-amber-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-amber-400 font-mono text-xs uppercase tracking-widest">Maps Setup Required</h3>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>
        <p className="text-[10px] text-white/60 leading-relaxed mb-4">
          Google Maps Platform key is missing. Deploy encrypted uplink via secrets panel.
        </p>
        <div className="space-y-2 text-[8px] font-mono uppercase tracking-tighter text-amber-400/80">
          <p>1. Open Settings (Gear Icon)</p>
          <p>2. Select 'Secrets'</p>
          <p>3. Add 'GOOGLE_MAPS_PLATFORM_KEY'</p>
        </div>
      </motion.div>
    );
  }

  if (!currentLocation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed z-[60] glass-panel rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl border-cyan-500/30 ${
        isFullscreen 
          ? 'inset-4 md:inset-10' 
          : 'bottom-24 right-4 md:right-8 w-[90vw] md:w-[400px] h-[300px] md:h-[400px]'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-12 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 z-10 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-100">
            {mapConfig?.title || 'Tactical Map Overlay'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={getLiveLocation}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-cyan-400"
            title="Refresh Live Location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleClose}
            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full h-full pt-12">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            center={currentLocation}
            zoom={mapConfig?.zoom || 15}
            disableDefaultUI={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            colorScheme="DARK"
          >
            <AdvancedMarker position={currentLocation}>
              <div className="relative">
                <div className="absolute -inset-4 bg-cyan-500/20 rounded-full animate-ping" />
                <Pin background="#22d3ee" glyphColor="#000" borderColor="#0891b2" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>

      {/* Decorative scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 scanlines" />
    </motion.div>
  );
}
