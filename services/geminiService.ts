
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const streamAIResponse = async (
  messages: Message[],
  onChunk: (chunk: string) => void
) => {
  try {
    const formattedContents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Using gemini-3-pro-preview for complex reasoning tasks as requested
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: formattedContents,
      config: {
        systemInstruction: "You are OM AI, the Future of Logical Reasoning. You provide deep, analytical, and structured answers. Use Markdown and code blocks when appropriate.",
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
