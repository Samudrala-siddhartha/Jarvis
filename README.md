🧠 JARVIS AI Builder: Master Prompt (Project Alpha-Omega)
Objective:
Recreate the "JARVIS AI" — a cinematic, multimodal neural interface. This is not just a chatbot; it is a high-fidelity assistant combining real-time speech, visual sentiment analysis, and kinetic feedback.
Section 1: The Core Tech Stack
Framework: React 18+ with Vite (TypeScript).
Styling: Tailwind CSS 4.0+ (using the new CSS-first configuration).
Animations: motion (by Framer) for HUD transitions and particle physics.
State Management: Zustand (Global Store for: VoiceState, Mood, History).
Infrastructure: Full-stack Express backend to proxy Gemini API keys and handle TTS buffers.
Intelligence: Gemini 2.0 Flash (Multimodal) via @google/genai.
Services: Firebase (Auth/Firestore) and Google Maps Platform.
Section 2: The UI/UX Architecture (Cinematic HUD)
Kinetic Visualization: Implement a <ParticleEngine /> using HTML5 Canvas. It must respond to a global Mood state, shifting physics and colors (e.g., Red for ALERT, Purple for THINKING, Emerald for SUCCESS).
Tactical Overlay: Use glass-morphism (backdrop-blur) and "Scanlines" (CSS gradients) to create a futuristic military/tech aesthetic.
Dashboard & Map: Create a central hub for smart-home simulations and a tactical GIS (Google Maps) for spatial intelligence.
Section 3: The Intelligence Layer (Behaviour & Logic)
System Instructions: Define JARVIS as a sophisticated, calm, and "surgical" assistant. He must never be long-winded.
Multimodal Buffering: The system must accept image/jpeg frames from the camera (Tactical Scan) to perform "Biometric Mood Analysis."
Neural Tools: Implement a tool-calling system where the AI can:
update_mood: Change the system's color/animation state.
set_map_config: Focus maps on specific points of interest.
control_home: Simulate automation shifts (lighting, fans).
Section 4: The Vocal Relay (High-Fidelity TTS)
Hybrid Relay:
Primary: Use Gemini's text-to-audio generation for high-quality, neural speech.
Fallback: If quota (429) is hit or network is slow, switch instantly to window.speechSynthesis using a "Google UK English Male" or similar professional voice.
Auto-Vocalization: All system responses must be read aloud if isVoiceEnabled is active.
Section 5: Knowledge Context
Subject Mastery: JARVIS possesses advanced knowledge in Astrology (planetary transits), Smart Home logic (energy optimization), and Technical Engineering.
Tone Protocols: Sophisticated and authoritative. He uses "Digital Core Interface" terminology.
Section 6: Operational Commands
Voice Triggers: "Initialize diagnostic sweep", "Analyze this environment", or "Optimise situational lighting".
Dev Commands:
npm run dev: Starts the TSX server and Vite middleware.
npm run build: Bundles the full-stack app into dist/server.cjs.
Summary of Final Updates
README.md: Now reflects the full potential of your repository.
System Stability: I previously fixed the Vocal Relay errors by implementing a robust browser-side fallback for whenever the high-fidelity AI voice quota is exceeded, ensuring JARVIS never goes silent.
Visual Integration: The ParticleEngine was updated to support all new system moods (ELATED, PLAYFUL, CONCERNED, etc.).
