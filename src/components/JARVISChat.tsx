import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, X, MessageSquare, Bot, Paperclip, Volume2, VolumeX, Camera, MicOff, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useVoiceStore, VoiceState } from '../store/voiceStore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useJarvisApi } from '../hooks/useJarvisApi';

/**
 * Interface Message Definition
 */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  file?: { name: string, mimeType: string };
}

/**
 * JARVISChat Component
 * The primary text-based interactive terminal for Project Alpha-Omega.
 * Supports multimodal input (camera, files), real-time streaming, and vocalization.
 */
export default function JARVISChat() {
  const { isChatOpen: isOpen, setIsChatOpen: setIsOpen, setState, transcript, state: voiceState, isVoiceEnabled: globalVoiceEnabled, setVoiceEnabled } = useVoiceStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ data: string, mimeType: string, name: string, textContent?: string } | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { processCommandStream, vocalize } = useJarvisApi();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

  /**
   * Automatic Mood Sensing: Captures tactical imagery for sentiment analysis
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCameraOpen && isOpen) {
      interval = setInterval(() => {
        const now = Date.now();
        if (now - lastScanTime > 15000 && !isTyping) { // Scan every 15s if not active
          captureAndSense();
          setLastScanTime(now);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isCameraOpen, isOpen, isTyping, lastScanTime]);

  const captureAndSense = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth / 2; // Lower res for scan
      canvas.height = video.videoHeight / 2;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      const fileData = {
        data: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
        name: `biometric_scan_${Date.now()}.jpg`
      };

      processCommandStream({
        message: "Perform biometric mood analysis on this visual feed. Shift your mood accordingly. Do not respond with text unless you detect a significant shift in user state.",
        file: fileData,
        onChunk: () => {},
        onComplete: () => {}
      });
    }
  };

  /**
   * Sync with global transcript when chat is open
   */
  useEffect(() => {
    if (isOpen && voiceState === VoiceState.ACTIVE_LISTENING) {
      setInput(transcript);
    }
  }, [transcript, isOpen, voiceState]);

  const toggleGlobalVoice = () => {
    setVoiceEnabled(!globalVoiceEnabled);
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedFile({
        data: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
        name: `capture_${Date.now()}.jpg`
      });
      stopCamera();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent | ClipboardEvent) => {
    let file: File | null = null;
    
    if ('files' in e && (e as any).files) {
      file = (e as any).files?.[0];
    } else if ('clipboardData' in e && (e as any).clipboardData) {
      file = (e as any).clipboardData.files?.[0];
    } else if ('target' in e && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files?.[0];
    }

    if (file) {
      const isText = file.type.startsWith('text/') || 
                     file.name.endsWith('.js') || 
                     file.name.endsWith('.ts') || 
                     file.name.endsWith('.py') || 
                     file.name.endsWith('.json') || 
                     file.name.endsWith('.md');

      const reader = new FileReader();
      
      if (isText) {
        reader.onload = (readerEvent) => {
          const textContent = readerEvent.target?.result as string;
          setSelectedFile({
            data: btoa(textContent),
            mimeType: file!.type || 'text/plain',
            name: file!.name,
            textContent: textContent
          });
        };
        reader.readAsText(file);
      } else {
        reader.onload = (readerEvent) => {
          const base64 = readerEvent.target?.result as string;
          setSelectedFile({
            data: base64.split(',')[1],
            mimeType: file!.type || 'application/octet-stream',
            name: file!.name
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      handleFileChange(e.nativeEvent as any);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e as any);
  };

  /**
   * Tactical Data Backup: Persist interactions to Firestore
   */
  const saveMessageToFirestore = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        role,
        content,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chats');
    }
  }, []);

  /**
   * Vocalize AI response using the high-fidelity Zephyr relay
   */
  const playResponseVoice = async (text: string) => {
    if (!isVoiceEnabled || !text) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioData = await vocalize(text);
    if (audioData) {
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;
      audio.play().catch(e => console.warn('Vocal relay blocked:', e));
    }
  };

  /**
   * Dispatches data packets to the core.
   * Handles text, files, and camera streams.
   */
  const handleSend = async (e?: React.FormEvent, directInput?: string) => {
    e?.preventDefault();
    const finalInput = directInput || input;
    if ((!finalInput.trim() && !selectedFile) || isTyping) return;

    const userMsg = finalInput;
    const currentFile = selectedFile;
    
    let promptContent = userMsg;
    if (currentFile?.textContent) {
      promptContent = `[Source File Analysis: ${currentFile.name}]\n\nContent:\n\`\`\`\n${currentFile.textContent}\n\`\`\`\n\nUser Request: ${userMsg || "Please analyze this file."}`;
    }
    
    setInput('');
    setSelectedFile(null);
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg || `Analyzed source: ${currentFile?.name}`,
      file: currentFile ? { name: currentFile.name, mimeType: currentFile.mimeType } : undefined
    }]);
    
    setIsTyping(true);
    saveMessageToFirestore('user', userMsg || `[File: ${currentFile?.name}]`);

    const assistantMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await processCommandStream({
      message: promptContent,
      file: currentFile?.textContent ? undefined : currentFile,
      onChunk: (chunk) => {
        setMessages(prev => {
          const next = [...prev];
          next[assistantMsgIndex].content += chunk;
          return next;
        });
      },
      onComplete: (fullText) => {
        setIsTyping(false);
        saveMessageToFirestore('assistant', fullText);
        if (isVoiceEnabled) playResponseVoice(fullText);
      }
    });
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

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
            className="mb-4 w-[350px] md:w-[450px] h-[600px] bg-jarvis-bg/95 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col shadow-2xl shadow-cyan-500/10 overflow-hidden relative"
            id="jarvis-chat-panel"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag Overlay */}
            <AnimatePresence>
              {isCameraOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black flex flex-col overflow-hidden"
                >
                  <div className="flex-1 relative">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* HUD Overlays */}
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20" />
                    <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-cyan-500/50" />
                    <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-cyan-500/50" />
                    <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-cyan-500/50" />
                    <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-cyan-500/50" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border border-cyan-500/20 rounded-full flex items-center justify-center">
                        <div className="w-48 h-48 border border-cyan-500/10 rounded-full animate-ping" />
                      </div>
                    </div>

                    <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/20 animate-[scan_3s_linear_infinite]" />
                    
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1 rounded-full flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">Live Optic Stream</span>
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="p-8 flex justify-around items-center bg-jarvis-bg border-t border-white/5">
                    <button 
                      onClick={stopCamera}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all shadow-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={capturePhoto}
                      className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                    >
                      <div className="absolute inset-0 border-4 border-cyan-500 rounded-full" />
                      <div className="absolute -inset-2 border border-cyan-400/20 rounded-full animate-spin-slow" />
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transition-colors group-hover:bg-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                        <Camera className="w-6 h-6 text-black" />
                      </div>
                    </button>
                    <div className="w-14" /> {/* Spacer */}
                  </div>
                </motion.div>
              )}
              {isDragging && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-cyan-500/20 backdrop-blur-md border-4 border-dashed border-cyan-400/50 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="w-20 h-20 rounded-full bg-cyan-400/20 flex items-center justify-center mb-4">
                    <Paperclip className="w-10 h-10 text-cyan-400 animate-bounce" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">Initialize Data Transfer</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">Neural Link</h3>
                  <p className="text-[9px] text-white/30 font-mono">v4.0.2 SECURE</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`p-2 rounded-lg transition-colors ${isVoiceEnabled ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/30 hover:text-white'}`}
                  title={isVoiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/30 hover:text-white transition-colors"
                  id="close-chat-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
              id="chat-messages-container"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full border border-cyan-500/20 flex items-center justify-center mb-4 animate-pulse bg-cyan-500/5 relative">
                    <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
                    <Mic className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h4 className="text-white font-light text-lg mb-2">Systems Ready, Sir.</h4>
                  <p className="text-cyan-400/50 font-mono text-[10px] uppercase tracking-widest leading-relaxed max-w-[200px]">How may I assist you this evening?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-light relative group/msg ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' 
                      : 'bg-white/5 border border-white/10 text-slate-200'
                  }`}>
                    {msg.role === 'assistant' && msg.content && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        <button 
                          onClick={() => copyToClipboard(msg.content)}
                          className="p-1 rounded bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-white/40 hover:text-cyan-400 transition-all"
                          title="Copy Output"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => downloadAsFile(msg.content, `jarvis_output_${Date.now()}.md`)}
                          className="p-1 rounded bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-white/40 hover:text-cyan-400 transition-all"
                          title="Download Output"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {msg.file && (
                      <div className="mb-3 p-2 bg-black/40 rounded-lg flex items-center gap-2 border border-white/10">
                        <Paperclip className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-mono truncate max-w-[150px]">{msg.file.name}</span>
                      </div>
                    )}
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 mt-1 uppercase tracking-tighter">
                    {msg.role === 'user' ? 'Authentication Logged' : 'Core Response'}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <div className="flex gap-1.5">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-duration:1s]" />
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-white/5">
              {selectedFile && (
                <div className="mb-3 flex items-center justify-between bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-mono text-cyan-100 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-cyan-400 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                  type="file"
                  id="chat-file-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onPaste={handlePaste}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a command or paste a file..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light placeholder:text-white/20"
                  id="chat-input"
                />
                {!input.trim() && !selectedFile ? (
                   <button 
                    type="button"
                    onClick={toggleGlobalVoice}
                    className={`p-2.5 rounded-xl transition-all ${globalVoiceEnabled ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/30 border border-white/10 hover:border-white/30'}`}
                    id="voice-input-btn"
                  >
                    {globalVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={isTyping}
                    className={`p-2.5 rounded-xl transition-all ${isTyping ? 'bg-white/5 text-white/10' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                    id="send-msg-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group outline-none"
        id="toggle-chat-panel-btn"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className={`relative ${isOpen ? 'bg-white/10 border-white/20' : 'bg-slate-900/90 border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]'} border rounded-2xl px-6 py-4 flex items-center space-x-3 backdrop-blur-xl transition-all hover:border-cyan-500/50 hover:translate-y-[-2px]`}>
          <div className="relative">
            {isOpen ? (
              <X className="w-5 h-5 text-red-400" id="close-chat-icon" />
            ) : (
              <>
                <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 animate-pulse" />
                <MessageSquare className="w-5 h-5 text-cyan-400 relative" id="open-chat-icon" />
              </>
            )}
          </div>
          <span className="text-sm font-medium text-slate-200 tracking-tight">
            {isOpen ? 'Minimize Stream' : 'Cognitive Interface'}
          </span>
        </div>
      </button>
    </div>
  );
}
