/**
 * hook: useJarvisApi
 * Centralized logic for interacting with the JARVIS backend intelligence.
 * Handles chat, streaming, and tactical tool execution.
 */

import { useCallback } from 'react';
import { useVoiceStore, VoiceState, Mood } from '../store/voiceStore';

export function useJarvisApi() {
  const { 
    setState, 
    setResponse, 
    setErrorMessage, 
    addInteraction, 
    setMapConfig,
    setMood,
    isVoiceEnabled,
    history 
  } = useVoiceStore();

  /**
   * Vocalize text using high-fidelity TTS relay with browser fallback
   */
  const vocalize = useCallback(async (text: string) => {
    if (!text) return;
    try {
      const response = await fetch('/api/jarvis/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 500) })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          await audio.play().catch(e => {
            console.warn("[JARVIS] High-fidelity playback prevented, falling back:", e.message);
            browserFallback(text);
          });
          return data.audio;
        }
      } else if (response.status === 429 || response.status === 500) {
        console.warn("[JARVIS] Neural relay exhausted or offline. Switching to local vocalization.");
        browserFallback(text);
      } else {
        throw new Error('Vocal relay error');
      }
    } catch (err) {
      console.error("[Vocal Relay Error] Falling back to browser TTS:", err);
      browserFallback(text);
      return null;
    }
  }, []);

  const browserFallback = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    // Prefer professional male sounding British voices for JARVIS feel
    const jarvisVoice = voices.find(v => 
      v.name.includes('Daniel') || 
      v.name.includes('Google UK English Male') ||
      v.name.includes('Microsoft James')
    ) || voices[0];
    
    if (jarvisVoice) utterance.voice = jarvisVoice;
    window.speechSynthesis.speak(utterance);
  };

  /**
   * Processes a command through the neural core.
   * Handles tool calls (like maps) automatically.
   */
  const processCommand = useCallback(async (transcript: string) => {
    if (!transcript) return;
    
    setState(VoiceState.PROCESSING);
    
    // Safety timeout
    const timeout = setTimeout(() => {
      if (useVoiceStore.getState().state === VoiceState.PROCESSING) {
        setState(VoiceState.IDLE);
        setErrorMessage('Neural processing timeout. System reset.');
      }
    }, 20000);

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript, history })
      });
      
      clearTimeout(timeout);
      if (!res.ok) throw new Error('Communication failure');
      
      const data = await res.json();

      // Protocol 11-M: Tool Execution
      if (data.functionCalls) {
        for (const call of data.functionCalls) {
          if (call.name === 'display_map') {
            const { lat, lng, zoom, title, isLiveLocation } = call.args;
            if (isLiveLocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setMapConfig({ 
                    center: { lat: pos.coords.latitude, lng: pos.coords.longitude }, 
                    zoom: zoom || 15, 
                    title: title || 'Real-time Overlay' 
                  });
                },
                () => setErrorMessage('Privacy restriction: Location access denied.')
              );
            } else if (lat && lng) {
              setMapConfig({ center: { lat, lng }, zoom: zoom || 15, title });
            }
          }
          if (call.name === 'update_mood') {
            setMood(call.args.mood as Mood);
          }
        }
      }

      setResponse(data.response);
      addInteraction(transcript, data.response);
      
      if (isVoiceEnabled && data.response) {
        vocalize(data.response);
      }
      
      return data.response;
    } catch (err) {
      clearTimeout(timeout);
      console.error("[Neural Link Error]", err);
      setState(VoiceState.ERROR);
      setErrorMessage('Uplink failed. Local systems active.');
      setTimeout(() => setState(VoiceState.IDLE), 3000);
      return null;
    }
  }, [history, setState, setResponse, addInteraction, setErrorMessage, setMapConfig, setMood, isVoiceEnabled, vocalize]);

  /**
   * Processes a streaming command through the neural core.
   */
  const processCommandStream = useCallback(async (params: { 
    message: string, 
    file?: any,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  }) => {
    const { message, file, onChunk, onComplete } = params;
    
    setState(VoiceState.PROCESSING);
    let fullText = '';

    try {
      const response = await fetch('/api/jarvis/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          file,
          history: history.slice(-6).map(m => ({ 
            role: m.role, 
            parts: m.parts
          }))
        })
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Stream failure: ${response.status} ${errorDetail}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                setErrorMessage(`Neural Core Error: ${data.error}`);
                setState(VoiceState.ERROR);
                break;
              }
              if (data.text) {
                fullText += data.text;
                onChunk(data.text);
              }
              
              if (data.functionCalls) {
                for (const call of data.functionCalls) {
                  if (call.name === 'display_map') {
                    const { lat, lng, zoom, title, isLiveLocation } = call.args;
                    if (isLiveLocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => setMapConfig({ center: { lat: pos.coords.latitude, lng: pos.coords.longitude }, zoom: zoom || 15, title: title || 'Real-time Position' }),
                        () => console.warn("Location permission denied")
                      );
                    } else if (lat && lng) {
                      setMapConfig({ center: { lat, lng }, zoom: zoom || 15, title });
                    }
                  }
                  if (call.name === 'update_mood') {
                    setMood(call.args.mood as Mood);
                  }
                }
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }

      onComplete(fullText);
      addInteraction(message, fullText);
      setState(VoiceState.RESPONDING);
      
      if (isVoiceEnabled && fullText) {
        vocalize(fullText);
      }
      
      return fullText;
    } catch (err) {
      console.error("[Stream Error]", err);
      setState(VoiceState.ERROR);
      return null;
    }
  }, [history, setState, addInteraction, setMapConfig, setMood, isVoiceEnabled, vocalize]);

  return { processCommand, processCommandStream, vocalize };
}
