/**
 * Express API Hub
 * Routes and handles all incoming requests for the JARVIS intelligence layer.
 */

import { Router } from "express";
import { generateContent, generateContentStream, synthesizeSpeech } from "./ai";
import { SUPPORTED_MIME_TYPES } from "./config";

const router = Router();

/**
 * Standard Chat Endpoint
 * Used for quick, singular command processing.
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, history, file } = req.body;
    
    if (file && !SUPPORTED_MIME_TYPES.includes(file.mimeType)) {
      return res.status(400).json({ 
        error: "Neural link error: Unsupported file format detected. Please provide standard data packets (PNG, PDF, TXT)." 
      });
    }

    const result = await generateContent({ message, history, file });
    res.json({ response: result.text, functionCalls: result.functionCalls });
  } catch (error: any) {
    console.error("[Neural Link Error]", error);
    res.status(500).json({ error: "Communication link severed. Retry recommended, Sir." });
  }
});

/**
 * Real-time Stream Endpoint
 * Used for the Interactive Cognitive Interface (Chat UI).
 */
router.post("/chat-stream", async (req, res) => {
  try {
    const { message, history, file } = req.body;
    
    if (file && !SUPPORTED_MIME_TYPES.includes(file.mimeType)) {
      return res.status(400).end("Unsupported data format.");
    }

    const stream = await generateContentStream({ message, history, file });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
      
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        res.write(`data: ${JSON.stringify({ functionCalls: chunk.functionCalls })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("[Stream Uplink Failure]", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Unknown neural link failure" })}\n\n`);
    res.end();
  }
});

/**
 * Vocalization Endpoint
 * Transforms text into high-fidelity speech.
 */
router.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Vocal array empty." });

    const audio = await synthesizeSpeech(text);
    if (audio) {
      res.json({ audio });
    } else {
      res.status(500).json({ error: "Vocal cords offline." });
    }
  } catch (error) {
    console.error("[TTS Diagnostics]", error);
    res.status(500).json({ error: "Neural vocal relay failure." });
  }
});

export default router;
