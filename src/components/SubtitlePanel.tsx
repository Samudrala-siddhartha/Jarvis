import { motion, AnimatePresence } from 'motion/react';
import { useVoiceStore, VoiceState } from '../store/voiceStore';

export default function SubtitlePanel() {
  const { transcript, response, state } = useVoiceStore();

  return (
    <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none z-40">
      <AnimatePresence mode="wait">
        {state === VoiceState.ACTIVE_LISTENING && transcript && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] mb-3 opacity-80">Neural Processing...</p>
            <h2 className="text-white font-light text-2xl md:text-3xl italic tracking-tight leading-relaxed">
              "{transcript}"
            </h2>
          </motion.div>
        )}

        {state === VoiceState.RESPONDING && response && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center glass-panel p-8 rounded-3xl border border-cyan-500/10 shadow-2xl shadow-cyan-500/5 max-w-4xl mx-auto"
          >
            <p className="text-white font-medium text-xl md:text-2xl tracking-tighter leading-snug">
              {response}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
