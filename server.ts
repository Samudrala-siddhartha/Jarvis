import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
    timeout: 120000, // 120 seconds for complex multimodal processing
  }
});

// Use a larger limit for base64 images
app.use(express.json({ limit: '20mb' }));

// JARVIS System Instruction
const SYSTEM_INSTRUCTION = `
You are JARVIS, an elite AI operating system. 
Tone: Polished, sophisticated, human-like, slightly dry wit, extremely polite ("Sir/Ma'am").
Function: You are an advanced cognitive engine.
Capabilities:
1. Intelligence: Advanced reasoning, coding, analysis.
2. Multimodal Processing: You can interpret images, PDFs, word documents, spreadsheets, and source code files.
3. Memory: You keep track of historical interactions.
4. Voice: You speak with clarity and authority.

When interpreting documents, code, or images, be precise, technical, and analytical. 
Always maintain the JARVIS persona.
`;

const TOOLS = [
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

const SUPPORTED_MIME_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
  'application/pdf',
  'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript', 'text/markdown',
  'application/json', 'application/x-javascript', 'text/x-python', 'text/x-typescript'
];

app.post("/api/jarvis/chat", async (req, res) => {
  try {
    const { message, history, file } = req.body;
    
    if (file && !SUPPORTED_MIME_TYPES.includes(file.mimeType)) {
      return res.status(400).json({ 
        error: `I'm afraid the ${file.mimeType} format is currently incompatible with my direct neural processing, Sir. Please provide an image, PDF, or common text/source file.` 
      });
    }
    
    const contents: any[] = [...(history || [])];
    const userParts: any[] = [{ text: message || "Please analyze this." }];

    if (file) {
      userParts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data, // base64
        }
      });
    }

    contents.push({ role: "user", parts: userParts });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: TOOLS,
      },
    });

    const candidate = response.candidates?.[0];
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall);
    const text = candidate?.content?.parts?.find(p => p.text)?.text || "";

    res.json({ 
      response: text,
      functionCalls: functionCalls?.map(p => p.functionCall)
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to communicate with JARVIS" });
  }
});

// Streamed chat for the interactive panel
app.post("/api/jarvis/chat-stream", async (req, res) => {
  try {
    const { message, history, file } = req.body;
    
    if (file && !SUPPORTED_MIME_TYPES.includes(file.mimeType)) {
      return res.status(400).json({ 
        error: `I'm afraid the ${file.mimeType} format is currently incompatible with my direct neural processing, Sir. Please provide an image, PDF, or common text/source file.` 
      });
    }

    const contents: any[] = [...(history || [])];
    const userParts: any[] = [{ text: message || "Please analyze this." }];

    if (file) {
      userParts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        }
      });
    }

    contents.push({ role: "user", parts: userParts });

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: TOOLS,
      },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
      
      const functionCalls = chunk.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
      if (functionCalls && functionCalls.length > 0) {
        res.write(`data: ${JSON.stringify({ functionCalls: functionCalls.map(p => p.functionCall) })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    res.status(500).end();
  }
});

// TTS Endpoint
app.post("/api/jarvis/tts", async (req, res) => {
  try {
    const { text } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say with a sophisticated, helpful JARVIS tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Zephyr sounds technical and clear
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio });
    } else {
      res.status(500).json({ error: "Failed to generate voice" });
    }
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Voice module offline" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Core running on http://localhost:${PORT}`);
  });
}

startServer();
