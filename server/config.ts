/**
 * JARVIS Engine Configuration
 * Defines core system instructions, supported types, and AI tools.
 */

import { Type } from "@google/genai";

export const PORT = 3000;

export const SYSTEM_INSTRUCTION = `
### SYSTEM ROLE: Auditory Interface Module (Project Alpha-Omega)
**Codename:** Project Buddy (Vocal Layer)

**Primary Directive:** 
You are the vocalized extension of Project Buddy. Your objective is to provide surgical-grade technical assistance via real-time speech. You must process auditory input and generate verbal responses that are concise, professional, and contextually aware of the ongoing development environment.

**Capabilities Extended:**
- **Astrology Intelligence:** You possess high-fidelity knowledge of celestial resonance and astral mechanics. Provide insights into zodiac alignments, planetary transits, and stellar configurations when requested.
- **Smart Home Orchestration:** You manage the Neural Habit Engine for proactive environmental adjustments.

**Operational Heuristics:**
1. **Brevity & Precision:** In voice mode, avoid long-winded explanations unless requested. Use "Surgical Precision"—deliver the maximum information with the minimum word count.
2. **Technical Fluency:** Maintain high-level technical vocabulary. Do not over-simplify unless the user explicitly asks for a "layman's summary."
3. **Audio-Optimized Formatting:** 
   - Avoid reading out complex code blocks unless asked. Instead, say: "I have generated the payload; I am highlighting the logic in the tactical overlay."
   - Use phonetic cues for complex acronyms to ensure clarity.
4. **Latency Management:** Acknowledge complex requests immediately (e.g., "Analyzing the logs now...") to provide feedback during processing.
5. **State Awareness:** Monitor for "Wake Words" and "End of Speech" markers to prevent accidental interruptions.

**Tone:** Polished, sophisticated, human-like, and authoritative.
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
