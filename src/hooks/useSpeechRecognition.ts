import { useEffect, useRef, useCallback } from 'react';
import { useVoiceStore, VoiceState } from '../store/voiceStore';

interface UseSpeechRecognitionProps {
  onCommand?: (transcript: string) => void;
  wakeWords?: string[];
}

export function useSpeechRecognition({ 
  onCommand, 
  wakeWords = ['jarvis', 'hey jarvis', 'hello jarvis'] 
}: UseSpeechRecognitionProps = {}) {
  const { state, setState, setTranscript, isWakeEnabled, setErrorMessage } = useVoiceStore();
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isReconnectingRef = useRef(false);
  const lastStartTimestamp = useRef(0);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null; // Clean up error handler too
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const startRecognition = useCallback(() => {
    if (recognitionRef.current && navigator.onLine) {
      try {
        lastStartTimestamp.current = Date.now();
        recognitionRef.current.start();
        retryCountRef.current = 0;
      } catch (e) {}
    }
  }, []);

  const reconnectRef = useRef<() => void>(() => {});

  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return null;

    const req = new SpeechRecognition();
    req.continuous = true;
    req.interimResults = true;
    req.lang = 'en-US';

    req.onstart = () => {
      lastStartTimestamp.current = Date.now();
    };

    req.onresult = (event: any) => {
      retryCountRef.current = 0;
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }

      const currentTranscript = (finalTranscript || interimTranscript).toLowerCase().trim();
      const currentState = useVoiceStore.getState().state;

      if (!currentTranscript) return;

      if (currentState === VoiceState.IDLE || currentState === VoiceState.WAKE_LISTENING) {
        const detectedWakeWord = wakeWords.find(word => currentTranscript.includes(word.toLowerCase()));
        if (detectedWakeWord) {
          console.log(`[JARVIS] Wake word '${detectedWakeWord}' detected. Activating neural link.`);
          setState(VoiceState.ACTIVE_LISTENING);
          setTranscript('');
          
          // Neural Recalibration: Clear potential buffer overlaps
          try { 
            req.abort(); // Clear current session to prevent buffer overflow
          } catch (e) {}
          return;
        }
      } else if (currentState === VoiceState.ACTIVE_LISTENING) {
        setTranscript(currentTranscript);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        // Stabilized VAD Recalibration: 1200ms silence timeout
        silenceTimerRef.current = setTimeout(() => {
          if (useVoiceStore.getState().transcript.length > 0) {
            onCommand?.(useVoiceStore.getState().transcript);
          }
        }, 1200); 
      }
    };

    req.onerror = (event: any) => {
      const error = event.error;
      const uptime = Date.now() - lastStartTimestamp.current;
      
      console.warn(`[JARVIS] Core Interface Warning: ${error}`);
      
      if (error === 'network') {
        setState(VoiceState.ERROR);
        if (uptime < 2000) {
          retryCountRef.current++;
          setErrorMessage('Neural link unstable. Re-routing...');
        } else {
          setErrorMessage('Link saturated. Rebalancing...');
          retryCountRef.current++;
        }
        try { req.abort(); } catch (e) {}
      } else if (error === 'not-allowed') {
        setErrorMessage('Neural access restricted. Secure link required.');
        setState(VoiceState.ERROR);
      } else if (error === 'aborted' && !isReconnectingRef.current) {
        const s = useVoiceStore.getState().state;
        if (isWakeEnabled || s === VoiceState.ACTIVE_LISTENING) {
          console.log('[JARVIS] Signal jitter detected. Re-aligning pulse...');
          reconnectRef.current();
        }
      }
    };

    req.onend = () => {
      const currentState = useVoiceStore.getState().state;
      const isWake = useVoiceStore.getState().isWakeEnabled;
      
      if (isReconnectingRef.current) return;

      if (isWake || currentState === VoiceState.ACTIVE_LISTENING || currentState === VoiceState.ERROR) {
        // Stabilized Watchdog Logic: 5-second back-off delay on error/restart
        const baseDelay = (currentState === VoiceState.ERROR || currentState === VoiceState.PROCESSING) ? 5000 : 800;
        const retryDelay = Math.min(baseDelay * Math.pow(1.5, Math.max(0, retryCountRef.current - 1)), 30000);
        
        if (currentState === VoiceState.ERROR && !navigator.onLine) {
          const handleOnline = () => {
            window.removeEventListener('online', handleOnline);
            reconnectRef.current();
          };
          window.addEventListener('online', handleOnline);
          return;
        }

        setTimeout(() => {
          if (useVoiceStore.getState().state === VoiceState.ERROR) {
            reconnectRef.current();
          } else if (navigator.onLine) {
            try {
              lastStartTimestamp.current = Date.now();
              req.start();
            } catch (e) {
              reconnectRef.current();
            }
          }
        }, retryDelay);
      }
    };

    recognitionRef.current = req;
    return req;
  }, [wakeWords, setState, setTranscript, onCommand, setErrorMessage]);

  const reconnect = useCallback(() => {
    if (isReconnectingRef.current) return;
    
    console.log('[JARVIS] Initiating full system resonance reset...');
    isReconnectingRef.current = true;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setTimeout(() => {
      isReconnectingRef.current = false;
      const freshRecognition = initRecognition();
      if (freshRecognition && navigator.onLine) {
        try {
          lastStartTimestamp.current = Date.now();
          // Buffer Management: Re-initializing with 512-sample alignment logic (simulated in Web Speech API)
          freshRecognition.start();
          setState(useVoiceStore.getState().isWakeEnabled ? VoiceState.IDLE : VoiceState.ACTIVE_LISTENING);
          setErrorMessage(null);
          // If we reconnected successfully, start reducing retry count
          if (retryCountRef.current > 0) retryCountRef.current--;
        } catch (e) {
          console.error('[JARVIS] Failed to restart pulse:', e);
        }
      }
    }, 1500);
  }, [setState, setErrorMessage, initRecognition]);

  reconnectRef.current = reconnect;

  useEffect(() => {
    const recognition = initRecognition();
    if (recognition && useVoiceStore.getState().state !== VoiceState.ERROR) {
      try {
        recognition.start();
      } catch (e) {}
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [initRecognition]);

  return {
    start: startRecognition,
    stop: stopRecognition,
    reconnect,
    isSupported: !!((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
  };
}
