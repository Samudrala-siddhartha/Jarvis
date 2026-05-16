/**
 * AI Core Processor
 * Handles communication with Google Gemini models and speech synthesis.
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, AI_TOOLS } from "./config";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
    timeout: 120000,
  }
});

/**
 * Generates a non-streaming response from JARVIS
 */
export async function generateContent(params: { message: string, history?: any[], file?: any }) {
  const { message, history = [], file } = params;
  
  const contents: any[] = [...history];
  const userParts: any[] = [{ text: message || "Awaiting instructions, Sir." }];

  if (file) {
    userParts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      }
    });
  }

  contents.push({ role: "user", parts: userParts });

  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview", // Reverting to recommended premium model
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: AI_TOOLS,
    },
  });

  const text = response.text || "";
  const functionCalls = response.functionCalls || [];

  return {
    text,
    functionCalls
  };
}

/**
 * Generates a streaming response from JARVIS
 */
export async function generateContentStream(params: { message: string, history?: any[], file?: any }) {
  const { message, history = [], file } = params;
  
  const contents: any[] = [...history];
  const userParts: any[] = [{ text: message || "Initial scan parameters incoming." }];

  if (file) {
    userParts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      }
    });
  }

  contents.push({ role: "user", parts: userParts });

  return genAI.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: AI_TOOLS,
    },
  });
}

/**
 * Synthesizes speech using the specialized Zephyr voice model
 */
export async function synthesizeSpeech(text: string) {
  const response = await genAI.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Say with a sophisticated, helpful Project Buddy tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}
