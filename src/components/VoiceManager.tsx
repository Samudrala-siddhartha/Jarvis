import { useCallback } from 'react';
import { useVoiceStore, VoiceState } from '../store/voiceStore';
import { Mic, MicOff, Volume2, ShieldAlert, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useJarvisApi } from '../hooks/useJarvisApi';

/**
 * VoiceManager Component
 * The elite neural control interface for JARVIS. 
 * Handles voice wake-word detection, active listening, and system state feedback.
 */
export default function VoiceManager() {
  const { 
    state, 
    setState, 
    setTranscript, 
    errorMessage, 
    setErrorMessage, 
    isUplinkStable,
    isVoiceEnabled,
    setVoiceEnabled
  } = useVoiceStore();
  
  const { speak, cancel } = useSpeechSynthesis();
  const { processCommand } = useJarvisApi();
  
  /**
   * Neural pulse handler for voice commands
   */
  const handleCommand = useCallback(async (transcript: string) => {
    const responseText = await processCommand(transcript);
    if (responseText) {
      await speak(responseText);
    }
  }, [processCommand, speak]);

  const { isSupported, reconnect } = useSpeechRecognition({
    onCommand: handleCommand,
  });

  /**
   * Manual system activation/deactivation
   */
  const handleManualTrigger = () => {
    if (state === VoiceState.RESPONDING) {
      cancel();
      setState(VoiceState.IDLE);
    } else {
      setVoiceEnabled(!isVoiceEnabled);
      if (!isVoiceEnabled) {
        setTranscript('');
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50">
      <AnimatePresence mode="wait">
        {(state !== VoiceState.IDLE || errorMessage) && (
          <motion.div
            key={errorMessage || state}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-2xl border border-cyan-500/30 flex items-center gap-2 shadow-2xl"
          >
            <div className="flex gap-1 h-1.5 items-end px-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: state === VoiceState.ACTIVE_LISTENING ? [1.5, 6, 3, 6, 1.5] : [1.5, 1.5],
                    opacity: state === VoiceState.ACTIVE_LISTENING ? 1 : 0.4
                  }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="w-0.5 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
            <span className="text-cyan-400 font-mono text-[8px] uppercase tracking-tighter font-bold whitespace-nowrap">
              {errorMessage || (state === VoiceState.WAKE_LISTENING ? "Waiting for 'JARVIS'..." : state.replace('_', ' '))}
            </span>
            {isUplinkStable && !errorMessage && state !== VoiceState.ERROR && (
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" title="Neural Uplink Stable" />
            )}
            {state === VoiceState.ERROR && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  reconnect();
                }}
                className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[6px] font-mono uppercase hover:bg-red-500/40 transition-all font-bold"
              >
                Reset
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-4">
        {/* Toggle voice recognition */}
        <button
          onClick={() => {
            setVoiceEnabled(!isVoiceEnabled);
          }}
          className={`p-2 rounded-full border transition-all ${
            isVoiceEnabled 
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
              : 'bg-white/5 border-white/10 text-white/30 hover:text-white'
          }`}
          title={isVoiceEnabled ? "Deactivate Neural Link" : "Activate Neural Link"}
        >
          {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={handleManualTrigger}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 group ${
            state === VoiceState.ACTIVE_LISTENING ? 'scale-110' : 'scale-100'
          }`}
          id="voice-trigger-btn"
        >
          {/* Cinematic Rings */}
          <div className={`absolute inset-0 rounded-full border border-cyan-500/20 transition-all duration-1000 ${
            state === VoiceState.IDLE ? 'opacity-40 scale-100' : 'opacity-10 scale-125 animate-pulse'
          }`} />
          
          <div className={`absolute inset-0.5 rounded-full border-2 border-dashed border-cyan-400/30 transition-transform duration-[10s] linear infinite ${
            state !== VoiceState.IDLE ? 'animate-spin' : ''
          }`} />

          <div className={`absolute inset-1 rounded-full bg-gradient-to-t from-cyan-900/40 via-transparent to-blue-900/40 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] transition-all duration-500`} />
          
          {/* The Core Element */}
          <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
            <AnimatePresence mode="wait">
              {state === VoiceState.ERROR ? (
                <motion.div key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  {errorMessage?.includes('Network') ? (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  )}
                </motion.div>
              ) : state === VoiceState.RESPONDING ? (
                <motion.div key="resp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                </motion.div>
              ) : (
                <motion.div 
                  key="default" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    state === VoiceState.ACTIVE_LISTENING 
                      ? 'bg-cyan-400 scale-[2.5] shadow-[0_0_15px_#22d3ee]' 
                      : state === VoiceState.WAKE_LISTENING
                        ? 'bg-cyan-400/60 scale-[1.5] shadow-[0_0_10px_#22d3ee] animate-pulse'
                        : 'bg-white/40 scale-100'
                  }`}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Scanning Pulse */}
          {(state === VoiceState.ACTIVE_LISTENING || state === VoiceState.WAKE_LISTENING) && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: state === VoiceState.ACTIVE_LISTENING ? 1.5 : 1.2, opacity: 0 }}
              transition={{ duration: state === VoiceState.ACTIVE_LISTENING ? 1.5 : 3, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
            />
          )}
        </button>
      </div>

      {!isSupported && (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <MicOff className="w-3 h-3 text-red-400" />
          <p className="text-red-400 text-[9px] uppercase font-mono font-bold">Incompatible Interface</p>
        </div>
      )}
    </div>
  );
}
