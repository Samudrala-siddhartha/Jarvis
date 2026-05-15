import { useCallback, useRef } from 'react';
import { useVoiceStore, VoiceState } from '../store/voiceStore';

export function useSpeechSynthesis() {
  const { setState } = useVoiceStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    setState(VoiceState.RESPONDING);

    try {
      // Try Server-Side TTS first
      const response = await fetch('/api/jarvis/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          audioRef.current = audio;
          
          return new Promise((resolve) => {
            audio.onended = () => {
              setState(VoiceState.IDLE);
              resolve(true);
            };
            audio.onerror = () => {
              // Fallback to browser TTS if audio playback fails
              fallbackToBrowser(text, resolve);
            };
            audio.play().catch(() => fallbackToBrowser(text, resolve));
          });
        }
      }
      
      // Fallback if API fails
      return new Promise((resolve) => fallbackToBrowser(text, resolve));
    } catch (err) {
      console.error('TTS API error, falling back:', err);
      return new Promise((resolve) => fallbackToBrowser(text, resolve));
    }
  }, [setState]);

  const fallbackToBrowser = (text: string, callback: (val: any) => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.85; // Deep JARVIS tone
    
    // Find a good male/British voice if available
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => (v.name.includes('Daniel') || v.name.includes('Google UK English Male'))) || voices[0];
    if (jarvisVoice) utterance.voice = jarvisVoice;

    utterance.onend = () => {
      setState(VoiceState.IDLE);
      callback(true);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setState(VoiceState.IDLE);
  }, [setState]);

  return { speak, cancel };
}
