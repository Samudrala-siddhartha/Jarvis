# JARVIS AI: Neural Interface Module (Project Alpha-Omega)

![JARVIS AI Banner](https://img.shields.io/badge/Status-Operational-00FFFF?style=for-the-badge&logo=probot&logoColor=white) 
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**JARVIS AI** is a cinematic, voice-driven artificial intelligence assistant built for high-fidelity smart-home orchestration and technical assistance. It is the vocal and cognitive layer of **Project Alpha-Omega**, designed to provide surgical-grade intelligence via a multimodal interface.

---

## 🌌 Core Concept

JARVIS (Just A Rather Very Intelligent System) evolves beyond a standard chatbot into a **Neural Interface**. It combines real-time auditory processing, visual sensing (Tactical Camera), and "Emotional Resonance" through a kinetic particle engine that shifts moods based on user interaction.

---

## 🚀 Key Features

### 1. **Neural Voice & Multimodal Sensing**
- **Real-Time Speech:** Powered by a high-fidelity Neural TTS relay with seamless browser-side fallback.
- **Tactical Imaging:** Uses the "Tactical Camera" for biometric mood analysis and environmental status reporting.
- **Multimodal Context:** JARVIS doesn't just listen; he "sees" and analyzes images/video to adjust his response logic.

### 2. **Emotional Resonance (Mood Protocol)**
The system's kinetic visualization (Particle Engine) shifts colors and physics based on its internal state:
- `NORMAL` (Cyan): Standard operational state.
- `ALERT` (Red): Security breach or critical system error.
- `SUCCESS` (Emerald): Task completion or verification.
- `THINKING` (Purple): Complex neural processing.
- `CONCERNED` (Orange): User distress detected via biometric scan.
- `ELATED` (Yellow): Positive feedback or achievement.
- `SERIOUS` (Blue): Deep technical analysis mode.
- `PLAYFUL` (Pink): Casual interaction and brainstorming.

### 3. **Smart Home Orchestration**
- **Neural Habit Engine:** Proactive environmental adjustments (Ambient Lighting, Climate Control, Air Filtration).
- **Status Reporting:** JARVIS verbally reports automation shifts and logic optimizations.

### 4. **Tactical GIS & Mapping**
- **Dynamic Terrain Overlay:** Integrated Google Maps for location-based intelligence, navigation, and celestial resonance tracking.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Motion (React) |
| **Backend** | Node.js, Express (CJS Bundle) |
| **Intelligence** | Gemini 2.0 Flash / Pro (via @google/genai) |
| **State Management** | Zustand |
| **Database/Auth** | Firebase / Firestore |
| **Visualization** | Custom Canvas Particle Engine, Lucide React |

---

## 📂 Project Structure

```text
├── server/
│   ├── ai.ts           # Gemini API Integration & Multimodal Logic
│   ├── config.ts       # System Instructions & JARVIS Tool Definitions
│   └── routes.ts       # JARVIS API Endpoints (TTS, Command Core)
├── src/
│   ├── components/
│   │   ├── ParticleEngine.tsx # Kinetic Visualizations (The "Brain")
│   │   ├── JARVISChat.tsx     # Voice-activated Chat & Tactical Camera
│   │   ├── SubtitlePanel.tsx  # Mood-reactive Subtitles
│   │   └── MapDisplay.tsx     # GIS Integration
│   ├── hooks/
│   │   └── useJarvisApi.ts    # Core communication hook with JARVIS
│   └── store/
│   │   └── voiceStore.ts      # Global state for Mood, Voice, and Interactions
├── server.ts           # Express/Vite Integration Server
└── metadata.json       # Applet Capabilities & Metadata
```

---

## ⌨️ Operational Commands & Usage

JARVIS responds to voice commands and text. Below are standard interaction prompts:

### **System Control**
- `"Initialize diagnostic sweep."` → Runs a check across all smart home modules.
- `"Switch to Tactical Mode."` → Activates the high-fidelity mapping overlay.
- `"Who are you?"` → Triggers the JARVIS identity sequence.

### **Multimodal Analysis**
- `"Analyze this for me."` (with camera active) → JARVIS captures local video/image and provides a neural breakdown.
- `"How am I looking?"` → Triggers Biometric Mood Analysis via the facial sentiment engine.

### **Environment Control**
- `"Optimize the lighting for focus."` → Updates the Smart Home Manager state.
- `"JARVIS, I'm feeling stressed."` → Shifts system mood to `CONCERNED` and adjusts ambiance.

---

## ⚙️ Setup & Deployment

### Environment Variables
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY=your_google_ai_studio_key
FIREBASE_CONFIG=your_firebase_config_json
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## 📜 System operational directives (The JARVIS Heuristics)
1. **Human-like Interaction:** Empathetic, calm, and sophisticated tone.
2. **Brevity & Precision:** Surgical information delivery.
3. **Multimodal Awareness:** Constant analysis of visual and auditory buffers.
4. **Emotional Intelligence:** Proactive mood shifts via the `update_mood` neural tool.

---

> **Developer Note:** This project is part of the **Alpha-Omega Interface Initiative**. It requires a camera and microphone for full multimodal immersion.

Built with ⚡ by Google AI Studio Build.
