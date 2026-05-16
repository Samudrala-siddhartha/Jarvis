import { motion, AnimatePresence } from 'motion/react';
import { Menu as MenuIcon, X, Settings, History, User, Shield, Info, LogOut, ChevronRight, Fingerprint, Activity, Cpu } from 'lucide-react';
import { useState } from 'react';
import { auth, signInWithGoogle, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [activeTab, setActiveTab] = useState<'main' | 'history'>('main');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatHistory(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const menuItems = [
    { icon: User, label: 'User Profile', id: 'menu-user' },
    { icon: History, label: 'Interaction History', id: 'menu-history', onClick: () => setActiveTab('history') },
    { icon: Shield, label: 'Security Protocols', id: 'menu-security' },
    { icon: Settings, label: 'System Settings', id: 'menu-settings' },
    { icon: Info, label: 'About JARVIS', id: 'menu-about' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-40 p-2 rounded-full border border-cyan-500/30 hover:bg-cyan-500/10 transition-all group backdrop-blur-md"
        id="open-menu-btn"
      >
        <MenuIcon className="w-6 h-6 text-cyan-500 group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              id="menu-overlay"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-85 bg-black/95 border-r border-cyan-500/20 z-50 p-6 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.5)]"
              id="sidebar-container"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                  <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em]">Cognitive Shell</span>
                  <span className="text-white font-light text-xl tracking-tighter">OS_JARVIS <span className="text-[10px] text-white/30 font-mono">v4.2</span></span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-cyan-500 hover:text-white transition-colors" id="close-menu-btn">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                  {activeTab === 'main' ? (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1 flex flex-col"
                    >
                      {/* User Section */}
                      <div className="mb-8 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-3">
                        {user ? (
                          <>
                            <img src={user.photoURL || ''} className="w-10 h-10 rounded-full border border-cyan-400/50" alt="Avatar" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-white text-sm font-medium truncate">{user.displayName}</span>
                              <span className="text-cyan-500/60 text-[10px] uppercase tracking-wider">Access Level: OVERSEER</span>
                            </div>
                          </>
                        ) : (
                          <button 
                            onClick={() => signInWithGoogle()}
                            className="w-full flex items-center justify-center gap-2 py-2 text-cyan-400 font-mono text-xs uppercase hover:text-white transition-colors"
                            id="sign-in-btn"
                          >
                            Authenticate Protocol
                          </button>
                        )}
                      </div>

                      {/* Navigation */}
                      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide">
                        {menuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={item.onClick}
                            className="w-full flex items-center justify-between p-3 rounded-lg text-cyan-500/70 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all group"
                            id={item.id}
                          >
                            <div className="flex items-center gap-4">
                              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span className="font-light text-sm tracking-wide">{item.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-cyan-400">
                                <Activity className="w-3 h-3" />
                                <span className="text-[10px] font-mono uppercase tracking-widest">Neural Load</span>
                              </div>
                              <span className="text-[10px] font-mono text-cyan-400/60">42%</span>
                            </div>
                            <div className="h-1 bg-cyan-950 w-full rounded-full overflow-hidden">
                              <motion.div 
                                animate={{ width: ['40%', '45%', '42%'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-full bg-cyan-500" 
                              />
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-blue-400">
                                <Cpu className="w-3 h-3" />
                                <span className="text-[10px] font-mono uppercase tracking-widest">Core Cycles</span>
                              </div>
                              <span className="text-[10px] font-mono text-blue-400/60">STABLE</span>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(8)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                  className="h-1 flex-1 bg-blue-500 rounded-full"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </nav>

                      {/* Biometric Status */}
                      <div className="mt-8 space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3 mb-3">
                            <Fingerprint className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-mono uppercase text-white/40 tracking-widest">Biometric Status</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-mono text-white/60">FACE_ID</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-mono text-white/60">VOICE_PRNT</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex-1 flex flex-col min-h-0"
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <button 
                          onClick={() => setActiveTab('main')}
                          className="text-cyan-500 hover:text-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h3 className="text-white font-medium">Log History</h3>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                        {chatHistory.length === 0 ? (
                          <p className="text-[10px] font-mono text-white/20 uppercase text-center py-12">No data logs found.</p>
                        ) : (
                          chatHistory.map((chat) => (
                            <div key={chat.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[8px] font-mono uppercase ${chat.role === 'user' ? 'text-cyan-500' : 'text-purple-400'}`}>
                                  {chat.role}
                                </span>
                                <span className="text-[8px] font-mono text-white/20">
                                  {chat.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">{chat.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-cyan-500/10">
                {user && (
                  <button 
                    onClick={() => signOut(auth)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg text-red-500/70 hover:bg-red-500/10 transition-all font-light text-sm"
                    id="sign-out-btn"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Terminate Session</span>
                  </button>
                )}
                <div className="mt-4 flex flex-col gap-1 px-3">
                  <div className="flex justify-between text-[8px] font-mono text-cyan-900 uppercase">
                    <span>Sync Strength</span>
                    <span>100%</span>
                  </div>
                  <div className="h-0.5 bg-cyan-950 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[100%] animate-[pulse_2s_infinite]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
