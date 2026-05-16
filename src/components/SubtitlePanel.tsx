import { motion, AnimatePresence } from 'motion/react';
import { useVoiceStore, VoiceState, Mood } from '../store/voiceStore';
import { Copy, Download } from 'lucide-react';

/**
 * SubtitlePanel Component
 * Provides real-time visual feedback of user speech and assistant responses.
 * Uses high-fidelity cinematic styling consistent with Project Alpha-Omega.
 */
export default function SubtitlePanel() {
  const { transcript, response, state, isChatOpen, mood } = useVoiceStore();

  const getMoodColor = () => {
    switch (mood) {
      case Mood.ALERT: return 'border-red-500/30 shadow-red-500/20 text-red-100';
      case Mood.SUCCESS: return 'border-emerald-500/30 shadow-emerald-500/20 text-emerald-100';
      case Mood.THINKING: return 'border-purple-500/30 shadow-purple-500/20 text-purple-100';
      case Mood.CONCERNED: return 'border-orange-500/30 shadow-orange-500/20 text-orange-100';
      case Mood.ELATED: return 'border-yellow-500/30 shadow-yellow-500/20 text-yellow-100';
      case Mood.SERIOUS: return 'border-blue-700/30 shadow-blue-700/20 text-blue-100';
      case Mood.PLAYFUL: return 'border-pink-500/30 shadow-pink-500/20 text-pink-100';
      default: return 'border-cyan-500/10 shadow-cyan-500/5 text-white';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isChatOpen) return null;

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
            className={`text-center glass-panel p-8 rounded-3xl border shadow-2xl max-w-4xl mx-auto relative group pointer-events-auto transition-all duration-500 ${getMoodColor()}`}
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => copyToClipboard(response)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-white/40 hover:text-cyan-400 transition-all"
                title="Copy Response"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={() => downloadAsFile(response, `jarvis_response_${Date.now()}.md`)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-white/40 hover:text-cyan-400 transition-all"
                title="Download Response"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white font-medium text-xl md:text-2xl tracking-tighter leading-snug">
              {response}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
