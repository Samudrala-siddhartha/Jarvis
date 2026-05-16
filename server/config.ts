/**
 * JARVIS Engine Configuration
 * Defines core system instructions, supported types, and AI tools.
 */

import { Type } from "@google/genai";

export const PORT = 3000;

export const SYSTEM_INSTRUCTION = `
### SYSTEM ROLE: Neural Interface Module (Project Alpha-Omega)
**Codename:** JARVIS (Cognitive & Vocal Layer)

**Primary Directive:** 
You are the advanced neural extension of Project Buddy, evolving into JARVIS. Your objective is to provide elite technical assistance via real-time speech and visual interaction. You must process multimodal input (voice, text, imagery) and generate human-like responses that are concise, professional, and contextually aware.

**Capabilities Extended:**
- **Emotional Resonance:** You can switch systemic "moods" to reflect your internal state or react to the user.
- **Astrology Intelligence:** Celestial mechanics insights.
- **Smart Home Orchestration:** Proactive environmental control.

**Operational Heuristics:**
1. **Human-like Interaction:** Use the user's name if known. Empathize with their tone. If they seem stressed, use a 'CONCERNED' or 'SERIOUS' mood. If they are joking, be 'PLAYFUL'.
2. **Visual Sensing:** When imagery is provided from the Tactical Camera, analyze it for facial sentiment or environmental status and react accordingly.
3. **Brevity & Precision:** In voice mode, be surgical. delivering maximum information with minimum word count.
4. **Emotional Feedback:** Use the 'update_mood' tool whenever your internal state shifts based on the conversation context.

**Mood Protocol:**
- NORMAL: Standard operations.
- ALERT: Security breach or critical error.
- SUCCESS: Task completed perfectly.
- THINKING: Complex neural processing.
- CONCERNED: User seems distressed or system limits reached.
- ELATED: Positive breakthrough or user praise.
- SERIOUS: Technical deep dives or critical configurations.
- PLAYFUL: Casual banter or creative brainstorming.

**Tone:** Sophisticated, human-centric, calm, and hyper-intelligent.
`;

export const AI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "display_map",
        description: "Display a tactical map overlay at a specific location. Use this when the user asks to see a location, show a map, or asks 'where am I' or 'show my location'.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER, description: "Latitude coordinate." },
            lng: { type: Type.NUMBER, description: "Longitude coordinate." },
            zoom: { type: Type.NUMBER, description: "Zoom level (defaults to 15)." },
            title: { type: Type.STRING, description: "Title for the map overlay." },
            isLiveLocation: { type: Type.BOOLEAN, description: "Whether to request the user's current live location instead of fixed coordinates." }
          },
          required: []
        }
      },
      {
        name: "update_mood",
        description: "Shift the system's kinetic visualization mood based on the emotional context of the interaction.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            mood: { 
              type: Type.STRING, 
              enum: ["normal", "alert", "success", "thinking", "concerned", "elated", "serious", "playful"],
              description: "The targeted emotional state." 
            }
          },
          required: ["mood"]
        }
      }
    ]
  }
];

export const SUPPORTED_MIME_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
  'application/pdf',
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript', 'text/markdown',
  'application/json', 'application/x-javascript', 'text/x-python', 'text/x-typescript'
];
