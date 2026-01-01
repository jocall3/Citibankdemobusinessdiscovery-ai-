
import { GoogleGenAI, Type } from "@google/genai";
import { GaLmL } from "../types";

export const getGeminiService = (): GaLmL => {
  // Always use a named parameter for apiKey and rely on process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  return {
    gn: async (prompt, context) => {
      // Use gemini-3-flash-preview for basic text tasks like summarization
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}`,
      });
      // Access text property directly
      return response.text || "No response generated.";
    },
    prDa: async (data, schema, instruction) => {
      // Use gemini-3-pro-preview for complex reasoning and data extraction tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Process this data according to the schema and instruction.\nInstruction: ${instruction}\nData: ${JSON.stringify(data)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      try {
        // Access text property directly and parse JSON result
        const jsonStr = response.text?.trim() || "{}";
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse AI JSON response", e);
        return { error: "Parse failure", original: response.text };
      }
    }
  };
};
