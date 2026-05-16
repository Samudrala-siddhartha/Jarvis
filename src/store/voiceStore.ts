import { create } from 'zustand';

export enum VoiceState {
  IDLE = 'IDLE',
  WAKE_LISTENING = 'WAKE_LISTENING',
  ACTIVE_LISTENING = 'ACTIVE_LISTENING',
  PROCESSING = 'PROCESSING',
  RESPONDING = 'RESPONDING',
  ERROR = 'ERROR'
}

export enum Mood {
  NORMAL = 'normal',
  ALERT = 'alert',
  SUCCESS = 'success',
  THINKING = 'thinking'
}

interface VoiceStore {
  state: VoiceState;
  mood: Mood;
  transcript: string;
  response: string;
  errorMessage: string | null;
  isWakeEnabled: boolean;
  isUplinkStable: boolean;
  isMapOpen: boolean;
  mapConfig: { center: { lat: number, lng: number }, zoom: number, title?: string } | null;
  history: { role: 'user' | 'model', parts: { text: string }[] }[];
  setState: (state: VoiceState) => void;
  setMood: (mood: Mood) => void;
  setErrorMessage: (msg: string | null) => void;
  setTranscript: (transcript: string) => void;
  setResponse: (response: string) => void;
  setWakeEnabled: (enabled: boolean) => void;
  setUplinkStable: (stable: boolean) => void;
  setMapConfig: (config: { center: { lat: number, lng: number }, zoom: number, title?: string } | null) => void;
  addInteraction: (command: string, response: string) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: VoiceState.IDLE,
  mood: Mood.NORMAL,
  transcript: '',
  response: '',
  errorMessage: null,
  isWakeEnabled: true,
  isUplinkStable: false,
  isMapOpen: false,
  mapConfig: null,
  history: [],
  setState: (state) => set({ state }),
  setMood: (mood) => set({ mood }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setTranscript: (transcript) => set({ transcript }),
  setResponse: (response) => set({ response }),
  setWakeEnabled: (isWakeEnabled) => set({ isWakeEnabled }),
  setUplinkStable: (isUplinkStable) => set({ isUplinkStable }),
  setMapConfig: (mapConfig) => set({ mapConfig, isMapOpen: !!mapConfig }),
  addInteraction: (command, response) => set((state) => ({
    history: [
      ...state.history.slice(-10), // Keep last 10 interactions for context
      { role: 'user', parts: [{ text: command }] },
      { role: 'model', parts: [{ text: response }] }
    ]
  })),
  reset: () => set({ state: VoiceState.IDLE, transcript: '', response: '' }),
}));
